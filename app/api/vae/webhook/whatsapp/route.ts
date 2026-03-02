import { NextRequest, NextResponse } from "next/server"
import { verifyWebhookSignature, processWhatsAppWebhook, forwardToVAE } from "@/lib/middleware/whatsapp-webhook-receiver"
import { routeMessage, MessageContext } from "@/lib/middleware/flow-router"
import { createSupabaseAdminClient } from "@/lib/supabase/server"

/**
 * WhatsApp Business API Webhook Handler
 * Main entry point that integrates with:
 * - Webhook receiver (signature verification, event processing)
 * - Flow router (message routing to VAE flows)
 * - Media handling (downloads and storage)
 * - Contact & conversation management
 */

// POST request - استقبال الرسائل
export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text()
    const body = JSON.parse(bodyText)

    // Verify WhatsApp signature
    const signature = request.headers.get("x-hub-signature-256") || ""
    const appSecret = process.env.WHATSAPP_APP_SECRET

    if (!appSecret) {
      console.error("[v0] WHATSAPP_APP_SECRET not configured")
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
    }

    const isValid = await verifyWebhookSignature(bodyText, signature, appSecret)
    if (!isValid) {
      console.warn("[v0] Invalid webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    // Process webhook through middleware pipeline
    const entries = body.entry || []
    const admin = createSupabaseAdminClient()
    let totalProcessed = 0

    for (const entry of entries) {
      const changes = entry.changes || []

      for (const change of changes) {
        const value = change.value
        const phoneNumberId = value.metadata?.phone_number_id

        // Get project for this phone number
        const { data: whatsappNumber, error: numberError } = await admin
          .from("whatsapp_numbers")
          .select("project_id")
          .eq("phone_number_id", phoneNumberId)
          .maybeSingle()

        if (numberError || !whatsappNumber) {
          console.warn(`[v0] Phone number not found: ${phoneNumberId}`)
          continue
        }

        const projectId = whatsappNumber.project_id

        // Process messages through webhook receiver
        const result = await processWhatsAppWebhook(body, phoneNumberId)

        if (!result.success) {
          console.error(`[v0] Webhook processing failed:`, result.errors)
          continue
        }

        totalProcessed += result.processedEvents

        // Route messages to appropriate flows
        if (value.messages) {
          for (const message of value.messages) {
            try {
              // Get contact info
              const { data: contact } = await admin
                .from("contacts")
                .select("id, name")
                .eq("wa_id", message.from)
                .eq("project_id", projectId)
                .maybeSingle()

              if (!contact) continue

              // Create routing context
              const routingContext: MessageContext = {
                projectId,
                contactId: contact.id,
                phoneNumberId,
                messageBody: message.text?.body || "[Non-text message]",
                messageType: message.type as any,
                senderPhone: message.from,
              }

              // Route the message
              const routing = await routeMessage(routingContext)

              if (routing.shouldRoute && routing.targetFlow) {
                console.log(`[v0] Routing message to flow: ${routing.targetFlow}`)

                // Forward to VAE for processing
                await forwardToVAE(projectId, "message", {
                  contact_id: contact.id,
                  message_type: message.type,
                  body: message.text?.body,
                  flow: routing.targetFlow,
                  timestamp: new Date().toISOString(),
                })
              }
            } catch (error) {
              console.error(`[v0] Error routing message:`, error)
            }
          }
        }

        // Handle status updates
        if (value.statuses) {
          for (const status of value.statuses) {
            try {
              await admin
                .from("messages")
                .update({ status: status.status })
                .eq("wamid", status.id)
                .eq("project_id", projectId)
            } catch (error) {
              console.error(`[v0] Error updating message status:`, error)
            }
          }
        }
      }
    }

    console.log(`[v0] Webhook processed ${totalProcessed} events`)

    return NextResponse.json({
      ok: true,
      processed: totalProcessed,
    })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json(
      { error: "Processing failed", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// GET request - Webhook verification
export async function GET(request: NextRequest) {
  try {
    const mode = request.nextUrl.searchParams.get("hub.mode")
    const token = request.nextUrl.searchParams.get("hub.verify_token")
    const challenge = request.nextUrl.searchParams.get("hub.challenge")

    const verifyToken = process.env.VERIFY_TOKEN || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

    if (!verifyToken) {
      console.error("[v0] VERIFY_TOKEN not configured")
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
    }

    if (mode === "subscribe" && token === verifyToken && challenge) {
      console.log("[v0] Webhook verified successfully")
      return new NextResponse(challenge, { status: 200 })
    }

    console.warn("[v0] Webhook verification failed")
    return NextResponse.json({ error: "Verification failed" }, { status: 403 })
  } catch (error) {
    console.error("[v0] Verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}

