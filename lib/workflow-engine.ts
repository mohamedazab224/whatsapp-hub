import { createHash } from "node:crypto"
import { getSupabaseAdmin } from "./supabase"
import { downloadWhatsAppMedia } from "./whatsapp"
import { enqueueAiReplyJob } from "./message-queue"
import { logger } from "./logger"
import { runIntegrations } from "./integrations"
import type { IntegrationEvent } from "./integrations/types"

type WebhookContext = {
  requestId: string
  rawBody: string
  body: any
  signatureHeader: string | null
}

type WorkflowRecord = {
  id: string
  ai_enabled: boolean | null
  is_active: boolean | null
}

const formatMediaExtension = (mimeType?: string) => {
  if (!mimeType) return "bin"
  const parts = mimeType.split("/")
  return parts[1] || "bin"
}

export async function processWebhookEvent({ requestId, rawBody, body, signatureHeader }: WebhookContext) {
  const supabase = getSupabaseAdmin()
  const eventHash = createHash("sha256").update(rawBody, "utf8").digest("hex")

  const { data: existingEvent } = await supabase
    .from("webhook_events")
    .select("id")
    .eq("event_hash", eventHash)
    .maybeSingle()

  if (existingEvent) {
    logger.warn("Duplicate webhook event ignored", { requestId })
    return
  }

  const { error: webhookError } = await supabase.from("webhook_events").insert({
    source: "whatsapp",
    payload: body,
    raw_body: rawBody,
    signature: signatureHeader,
    event_hash: eventHash,
  })

  if (webhookError) {
    logger.error("Failed to store webhook event", { requestId, error: webhookError })
  }

  const entry = body.entry?.[0]
  const changes = entry?.changes?.[0]
  const value = changes?.value
  const messages = value?.messages ?? []
  const statuses = value?.statuses ?? []

  if (statuses.length) {
    for (const status of statuses) {
      await supabase.from("message_statuses").insert({
        whatsapp_message_id: status.id,
        status: status.status,
        timestamp: status.timestamp ? Number(status.timestamp) : null,
        recipient_id: status.recipient_id,
        conversation_id: status.conversation?.id,
        pricing: status.pricing,
        metadata: status,
      })
    }
    logger.info("Processed message status updates", { requestId, count: statuses.length })
  }

  for (const msg of messages) {
    const contact = value.contacts?.[0]
    const whatsappPhoneNumberId = value.metadata?.phone_number_id

    if (!whatsappPhoneNumberId) {
      logger.warn("Missing WhatsApp phone number ID", { requestId })
      continue
    }

    logger.info("Incoming WhatsApp message", {
      requestId,
      from: msg.from,
      phoneNumberId: whatsappPhoneNumberId,
      messageType: msg.type,
    })

    const { data: contactData } = await supabase
      .from("contacts")
      .upsert({ wa_id: msg.from, name: contact?.profile?.name }, { onConflict: "wa_id" })
      .select()
      .single()

    const { data: waNumberRecord } = await supabase
      .from("whatsapp_numbers")
      .select("id, project_id, project:project_id(id, slug)")
      .eq("phone_number_id", whatsappPhoneNumberId)
      .single()

    if (!waNumberRecord) {
      logger.warn("WhatsApp number record not found", { requestId, whatsappPhoneNumberId })
      continue
    }

    const { data: workflow } = await supabase
      .from("workflows")
      .select("id, ai_enabled, is_active")
      .eq("project_id", waNumberRecord.project_id)
      .eq("is_default", true)
      .eq("is_active", true)
      .maybeSingle()

    if (!workflow) {
      logger.warn("Workflow not found for project", { requestId, projectId: waNumberRecord.project_id })
      continue
    }

    const { data: existingMessage } = await supabase
      .from("messages")
      .select("id")
      .eq("whatsapp_message_id", msg.id)
      .maybeSingle()

    if (existingMessage) {
      logger.info("Duplicate WhatsApp message ignored", { requestId, messageId: msg.id })
      continue
    }

    let mediaAttachment:
      | {
          media_id: string
          mime_type?: string
          sha256?: string
          file_size?: number
          storage_path?: string
          public_url?: string
        }
      | undefined

    const mediaPayload = msg.type ? msg[msg.type] : undefined
    const mediaId = mediaPayload?.id

    if (mediaId) {
      try {
        const { buffer, info } = await downloadWhatsAppMedia(mediaId)
        const extension = formatMediaExtension(info.mime_type || mediaPayload?.mime_type)
        const storagePath = `${waNumberRecord.id}/${msg.id}/${mediaId}.${extension}`

        const { error: uploadError } = await supabase.storage.from("media").upload(storagePath, Buffer.from(buffer), {
          contentType: info.mime_type || mediaPayload?.mime_type || "application/octet-stream",
          upsert: true,
        })

        if (!uploadError) {
          const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(storagePath)
          mediaAttachment = {
            media_id: mediaId,
            mime_type: info.mime_type || mediaPayload?.mime_type,
            sha256: info.sha256,
            file_size: info.file_size,
            storage_path: storagePath,
            public_url: publicUrl?.publicUrl,
          }
        } else {
          logger.error("Failed to upload media to storage", { requestId, error: uploadError })
        }
      } catch (error) {
        logger.error("Failed to download WhatsApp media", { requestId, error })
      }
    }

    const { data: messageRecord } = await supabase
      .from("messages")
      .insert({
        whatsapp_message_id: msg.id,
        contact_id: contactData?.id,
        whatsapp_number_id: waNumberRecord.id,
        project_id: waNumberRecord.project_id,
        workflow_id: workflow.id,
        type: msg.type,
        direction: "inbound",
        body: msg.text?.body || "",
        metadata: { ...msg, media: mediaAttachment },
      })
      .select()
      .single()

    if (messageRecord) {
      const { data: integrations } = await supabase
        .from("integrations")
        .select("id, type")
        .eq("project_id", waNumberRecord.project_id)
        .eq("is_active", true)

      if (integrations?.length) {
        const integrationEvent: IntegrationEvent = {
          projectId: waNumberRecord.project_id,
          workflowId: workflow.id,
          whatsappNumberId: waNumberRecord.id,
          contactId: contactData?.id,
          messageId: messageRecord.id,
          messageType: msg.type,
          messageBody: msg.text?.body || "",
          media: mediaAttachment
            ? {
                mediaId: mediaAttachment.media_id,
                mimeType: mediaAttachment.mime_type,
                fileSize: mediaAttachment.file_size,
                storagePath: mediaAttachment.storage_path,
                publicUrl: mediaAttachment.public_url,
              }
            : undefined,
        }

        await runIntegrations(integrations, integrationEvent)
      }
    }

    if (mediaAttachment && messageRecord) {
      const { error: mediaError } = await supabase.from("media_files").insert({
        project_id: waNumberRecord.project_id,
        whatsapp_number_id: waNumberRecord.id,
        workflow_id: workflow.id,
        contact_id: contactData?.id,
        message_id: messageRecord.id,
        media_id: mediaAttachment.media_id,
        mime_type: mediaAttachment.mime_type,
        file_size: mediaAttachment.file_size,
        storage_path: mediaAttachment.storage_path,
        public_url: mediaAttachment.public_url,
        metadata: mediaAttachment,
      })

      if (mediaError) {
        logger.error("Failed to store media file metadata", { requestId, error: mediaError })
      }
    }

    if (workflow.ai_enabled && msg.text?.body && waNumberRecord.project?.slug === "alazab-system" && contactData) {
      await enqueueAiReplyJob({
        inbound_message_id: msg.id,
        contact_id: contactData.id,
        whatsapp_number_id: waNumberRecord.id,
        project_id: waNumberRecord.project_id,
        workflow_id: workflow.id,
        whatsapp_phone_number_id: whatsappPhoneNumberId,
        recipient: msg.from,
        message_body: msg.text.body,
      })
      logger.info("AI reply job enqueued", { requestId, projectId: waNumberRecord.project_id, workflowId: workflow.id })
    }
  }
}
