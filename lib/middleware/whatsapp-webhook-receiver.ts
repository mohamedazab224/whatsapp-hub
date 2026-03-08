import crypto from "crypto"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import {
  validateMediaMessage,
  extractMediaMetadata,
  handleMediaDownload,
} from "@/lib/media/whatsapp-media-handler"

/**
 * WhatsApp Webhook Receiver
 * Handles incoming WhatsApp events from Meta's webhook
 * Part of the middleware layer that bridges VAE and WhatsApp Business API
 */

interface WhatsAppWebhookPayload {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: {
          display_phone_number: string
          phone_number_id: string
        }
        messages?: Array<{
          from: string
          id: string
          timestamp: string
          type: string
          text?: { body: string }
          image?: { id: string; mime_type: string }
          video?: { id: string; mime_type: string }
          document?: { id: string; mime_type: string; filename: string }
        }>
        statuses?: Array<{
          id: string
          status: string
          timestamp: string
          recipient_id: string
        }>
        contacts?: Array<{
          profile: { name: string }
          wa_id: string
        }>
      }
      field: string
    }>
  }>
}

export async function verifyWebhookSignature(
  body: string,
  signature: string,
  appSecret: string
): Promise<boolean> {
  try {
    const hash = crypto
      .createHmac("sha256", appSecret)
      .update(body)
      .digest("hex")

    const expectedSignature = `sha256=${hash}`
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  } catch (error) {
    console.error("[v0] Signature verification failed:", error)
    return false
  }
}

export async function processWhatsAppWebhook(
  payload: WhatsAppWebhookPayload,
  phoneNumberId: string
): Promise<{
  success: boolean
  processedEvents: number
  errors: string[]
}> {
  const errors: string[] = []
  let processedEvents = 0

  try {
    const admin = createSupabaseAdminClient()

    // Find the project by WhatsApp phone number
    const { data: whatsappNumber, error: numberError } = await admin
      .from("whatsapp_numbers")
      .select("project_id")
      .eq("phone_number_id", phoneNumberId)
      .maybeSingle()

    if (numberError || !whatsappNumber) {
      const msg = `WhatsApp number not found: ${phoneNumberId}`
      console.error(`[v0] ${msg}`)
      errors.push(msg)
      return { success: false, processedEvents, errors }
    }

    const projectId = whatsappNumber.project_id

    // Process each entry
    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        const value = change.value

        // Handle incoming messages
        if (value.messages) {
          for (const message of value.messages) {
            try {
              console.log(`[v0] Processing message from ${message.from}`)

              // Find or create contact
              const { data: contact, error: contactError } = await admin
                .from("contacts")
                .upsert(
                  {
                    project_id: projectId,
                    whatsapp_number_id: value.metadata.phone_number_id,
                    wa_id: message.from,
                    name: value.contacts?.[0]?.profile?.name || message.from,
                  },
                  { onConflict: "wa_id" }
                )
                .select()
                .single()

              if (contactError) {
                errors.push(`Failed to create contact: ${contactError.message}`)
                continue
              }

              // Store the message
              const messageData: any = {
                project_id: projectId,
                contact_id: contact.id,
                whatsapp_number_id: value.metadata.phone_number_id,
                from_phone_id: message.from,
                to_phone_id: value.metadata.display_phone_number,
                wamid: message.id,
                type: message.type,
                direction: "inbound",
                status: "received",
                timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
              }

              // Add message body for text messages
              if (message.type === "text" && message.text) {
                messageData.body = message.text.body
              }

              const { error: messageError } = await admin
                .from("messages")
                .insert(messageData)

              if (messageError) {
                errors.push(`Failed to store message: ${messageError.message}`)
                continue
              }

              // Handle media files (images, videos, documents, audio)
              if (validateMediaMessage(message)) {
                const mediaMetadata = extractMediaMetadata(message)
                if (mediaMetadata) {
                  try {
                    // Generate file name based on type and timestamp
                    const timestamp = new Date(parseInt(message.timestamp) * 1000).getTime()
                    const extension = getFileExtension(mediaMetadata.type, mediaMetadata.mime_type)
                    const fileName = `${mediaMetadata.id}_${timestamp}${extension}`

                    console.log(`[v0] Downloading media: ${fileName}`)

                    // Download media with retry strategy
                    const downloadResult = await handleMediaDownload(
                      mediaMetadata.id,
                      fileName,
                      projectId
                    )

                    if (downloadResult.success) {
                      // Store media file reference
                      await admin.from("media_files").insert({
                        project_id: projectId,
                        message_id: message.id,
                        media_id: mediaMetadata.id,
                        mime_type: mediaMetadata.mime_type,
                        file_size: downloadResult.size || 0,
                        storage_path: downloadResult.path,
                        downloaded_at: new Date().toISOString(),
                      })

                      console.log(`[v0] Media stored: ${downloadResult.path}`)
                    } else {
                      console.warn(`[v0] Media download failed: ${downloadResult.error}`)
                      errors.push(`Media download failed: ${downloadResult.error}`)
                    }
                  } catch (mediaError) {
                    console.error(`[v0] Media handling error:`, mediaError)
                    errors.push(`Media handling failed: ${mediaError instanceof Error ? mediaError.message : String(mediaError)}`)
                  }
                }
              }

              processedEvents++
            } catch (error) {
              errors.push(`Error processing message: ${error instanceof Error ? error.message : String(error)}`)
            }
          }
        }

        // Handle message status updates
        if (value.statuses) {
          for (const status of value.statuses) {
            try {
              await admin
                .from("messages")
                .update({ status: status.status })
                .eq("wamid", status.id)

              processedEvents++
            } catch (error) {
              errors.push(`Error updating message status: ${error instanceof Error ? error.message : String(error)}`)
            }
          }
        }
      }
    }

    return {
      success: errors.length === 0,
      processedEvents,
      errors,
    }
  } catch (error) {
    const msg = `Webhook processing error: ${error instanceof Error ? error.message : String(error)}`
    console.error(`[v0] ${msg}`)
    errors.push(msg)
    return { success: false, processedEvents, errors }
  }
}

// Helper function to get file extension
function getFileExtension(mediaType: string, mimeType?: string): string {
  const extensionMap: Record<string, string> = {
    image: ".jpg",
    video: ".mp4",
    audio: ".m4a",
    document: ".pdf",
  }

  // Try to get extension from mime type first
  if (mimeType) {
    const parts = mimeType.split("/")
    if (parts.length === 2) {
      const subtype = parts[1].toLowerCase()
      if (subtype.includes("jpeg") || subtype.includes("jpg")) return ".jpg"
      if (subtype.includes("png")) return ".png"
      if (subtype.includes("gif")) return ".gif"
      if (subtype.includes("mp4")) return ".mp4"
      if (subtype.includes("webm")) return ".webm"
      if (subtype.includes("pdf")) return ".pdf"
      if (subtype.includes("msword")) return ".doc"
      if (subtype.includes("sheet")) return ".xlsx"
      if (subtype.includes("audio")) return ".m4a"
    }
  }

  return extensionMap[mediaType] || ".bin"
}

export async function forwardToVAE(
  projectId: string,
  eventType: "message" | "status_update" | "contact_change",
  data: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get project webhook endpoint
    const admin = createSupabaseAdminClient()
    const { data: webhook, error: webhookError } = await admin
      .from("webhook_endpoints")
      .select("url, secret")
      .eq("project_id", projectId)
      .maybeSingle()

    if (webhookError || !webhook) {
      console.log(`[v0] No webhook configured for project ${projectId}`)
      return { success: true } // Not an error, just not configured
    }

    // Forward to VAE with signature
    const payload = JSON.stringify({
      event_type: eventType,
      data,
      timestamp: new Date().toISOString(),
    })

    const signature = crypto
      .createHmac("sha256", webhook.secret)
      .update(payload)
      .digest("hex")

    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": `sha256=${signature}`,
      },
      body: payload,
    })

    if (!response.ok) {
      throw new Error(`VAE webhook failed: ${response.statusText}`)
    }

    console.log(`[v0] Forwarded event to VAE for project ${projectId}`)
    return { success: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[v0] Failed to forward to VAE: ${msg}`)
    return { success: false, error: msg }
  }
}
