import { getSupabaseAdmin } from "./supabase"
import { logger } from "./logger"

type WebhookContext = {
  requestId: string
  body: any
}

export async function processWebhookEvent({ requestId, body }: WebhookContext) {
  const supabase = getSupabaseAdmin()

  const entry = body.entry?.[0]
  const changes = entry?.changes?.[0]
  const value = changes?.value
  const messages = value?.messages ?? []

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
      .select("id, phone_number_id, business_account_id")
      .eq("phone_number_id", whatsappPhoneNumberId)
      .single()

    if (!waNumberRecord) {
      logger.warn("WhatsApp number record not found", { requestId, whatsappPhoneNumberId })
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

    const { data: messageRecord } = await supabase
      .from("messages")
      .insert({
        whatsapp_message_id: msg.id,
        contact_id: contactData?.id,
        whatsapp_number_id: waNumberRecord.id,
        type: msg.type,
        direction: "inbound",
        body: msg.text?.body || "",
        processing_stage: "RECEIVED",
        metadata: msg,
      })
      .select()
      .single()

    if (messageRecord) {
      const { error: jobError } = await supabase.from("message_jobs").insert({
        type: "message_process",
        status: "pending",
        payload: {
          message_id: messageRecord.id,
          whatsapp_message_id: msg.id,
          contact_id: contactData?.id,
          whatsapp_number_id: waNumberRecord.id,
          phone_number_id: waNumberRecord.phone_number_id,
          business_account_id: waNumberRecord.business_account_id,
        },
      })

      if (jobError) {
        logger.error("Failed to enqueue message job", { requestId, error: jobError, messageId: messageRecord.id })
      }

    }
  }
}
