import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import crypto from "crypto"

function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"
}

function checkRateLimit(key: string, options: { max: number; windowMs: number }): { allowed: boolean; resetAt: Date } {
  const now = Date.now()
  const resetAt = new Date(now + options.windowMs)
  // Simplified rate limiting - in production use Redis
  return { allowed: true, resetAt }
}

function logRateLimitRejection(path: string, key: string, resetAt: Date) {
  logger.warn(`Rate limit exceeded at ${path}`, { key, resetAt })
}

function verifyWebhookSignature(rawBody: string, signatureHeader: string | null, appSecret: string): boolean {
  if (!signatureHeader) return false
  const hash = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex")
  const expected = `sha256=${hash}`
  return signatureHeader === expected
}

async function processWebhookEvent({ requestId, body }: { requestId: string; body: any }) {
  if (!body.entry || !Array.isArray(body.entry)) {
    logger.warn("Invalid webhook body structure", { requestId })
    return
  }

  for (const entry of body.entry) {
    if (!entry.changes || !Array.isArray(entry.changes)) continue

    for (const change of entry.changes) {
      const field = change.field
      const value = change.value

      if (field === "messages") {
        await handleIncomingMessage({ requestId, entry: entry.id, value })
      } else if (field === "message_status") {
        await handleMessageStatus({ requestId, entry: entry.id, value })
      } else if (field === "message_template_status_update") {
        await handleTemplateStatusUpdate({ requestId, entry: entry.id, value })
      }
    }
  }
}

async function handleIncomingMessage({ requestId, entry: wabaId, value }: any) {
  try {
    if (!value.messages || !Array.isArray(value.messages)) return

    for (const msg of value.messages) {
      const phoneNumberId = value.metadata?.phone_number_id
      const contactWaId = msg.from
      const timestamp = msg.timestamp

      let messageBody = ""
      let messageType = "unknown"

      if (msg.type === "text") {
        messageBody = msg.text?.body || ""
        messageType = "text"
      } else if (msg.type === "interactive") {
        messageBody = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || ""
        messageType = "interactive"
      } else if (msg.type === "document" || msg.type === "image" || msg.type === "audio" || msg.type === "video") {
        messageType = msg.type
        const mediaId = msg[msg.type]?.id
        messageBody = mediaId || ""
      }

      // Store message in database
      await storeIncomingMessage({
        requestId,
        wabaId,
        phoneNumberId,
        contactWaId,
        messageId: msg.id,
        messageType,
        messageBody,
        timestamp: parseInt(timestamp),
      })
    }
  } catch (error) {
    logger.error("Error handling incoming message", { requestId, error })
  }
}

async function handleMessageStatus({ requestId, entry: wabaId, value }: any) {
  try {
    if (!value.statuses || !Array.isArray(value.statuses)) return

    for (const status of value.statuses) {
      const phoneNumberId = value.metadata?.phone_number_id
      const messageId = status.id
      const statusValue = status.status // delivered, read, failed, sent
      const timestamp = status.timestamp

      await updateMessageStatus({
        requestId,
        messageId,
        status: statusValue,
        timestamp: parseInt(timestamp),
      })
    }
  } catch (error) {
    logger.error("Error handling message status", { requestId, error })
  }
}

async function handleTemplateStatusUpdate({ requestId, entry: wabaId, value }: any) {
  try {
    logger.info("Template status update", {
      requestId,
      templateName: value.message_template?.name,
      status: value.message_template?.status,
      reason: value.message_template?.rejection_reason,
    })
  } catch (error) {
    logger.error("Error handling template status", { requestId, error })
  }
}

async function storeIncomingMessage({
  requestId,
  wabaId,
  phoneNumberId,
  contactWaId,
  messageId,
  messageType,
  messageBody,
  timestamp,
}: any) {
  try {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server")
    const supabase = await createSupabaseServerClient()

    // First, ensure contact exists
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("id")
      .eq("project_id", wabaId)
      .eq("wa_id", contactWaId)
      .maybeSingle()

    let contactId = contact?.id

    if (!contact) {
      const { data: newContact, error: createError } = await supabase
        .from("contacts")
        .insert({
          project_id: wabaId,
          wa_id: contactWaId,
          status: "active",
        })
        .select("id")
        .single()

      if (createError) {
        logger.error("Failed to create contact", { requestId, error: createError })
        return
      }
      contactId = newContact?.id
    }

    // Get whatsapp_number_id
    const { data: whatsappNumber, error: numberError } = await supabase
      .from("whatsapp_numbers")
      .select("id")
      .eq("phone_number_id", phoneNumberId)
      .maybeSingle()

    if (!whatsappNumber) {
      logger.warn("WhatsApp number not found", { requestId, phoneNumberId })
      return
    }

    // Store message
    const { error } = await supabase.from("messages").insert({
      project_id: wabaId,
      whatsapp_message_id: messageId,
      contact_id: contactId,
      whatsapp_number_id: whatsappNumber.id,
      message_type: messageType,
      body: messageBody,
      direction: "inbound",
      status: "sent",
      created_at: new Date(timestamp * 1000).toISOString(),
    })

    if (error) {
      logger.error("Failed to store message", { requestId, error })
    } else {
      logger.info("Message stored", { requestId, messageId })
    }
  } catch (error) {
    logger.error("Error storing message", { requestId, error })
  }
}

async function updateMessageStatus({ requestId, messageId, status, timestamp }: any) {
  try {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server")
    const supabase = await createSupabaseServerClient()

    // Map Meta status to our status
    const mappedStatus = status === "delivered" ? "delivered" : status === "read" ? "read" : "sent"

    const { error } = await supabase
      .from("messages")
      .update({
        status: mappedStatus,
        updated_at: new Date(timestamp * 1000).toISOString(),
      })
      .eq("whatsapp_message_id", messageId)

    if (error) {
      logger.error("Failed to update message status", { requestId, error })
    } else {
      logger.info("Message status updated", { requestId, messageId, status: mappedStatus })
    }
  } catch (error) {
    logger.error("Error updating message status", { requestId, error })
  }
}

export async function GET(request: Request) {
  const requestId = crypto.randomUUID()
  const WHATSAPP_WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || process.env.VERIFY_TOKEN

  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    logger.info("Webhook verification succeeded", { requestId })
    return new Response(challenge, { status: 200 })
  }

  logger.warn("Webhook verification failed", { requestId, mode })
  return new Response("Forbidden", { status: 403 })
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID()
  const WHATSAPP_APP_SECRET = process.env.WHATSAPP_APP_SECRET!
  const WEBHOOK_RATE_LIMIT_MAX = process.env.WEBHOOK_RATE_LIMIT_MAX || "120"
  const WEBHOOK_RATE_LIMIT_WINDOW_SEC = process.env.WEBHOOK_RATE_LIMIT_WINDOW_SEC || "60"

  const rawBody = await request.text()
  const signatureHeader = request.headers.get("x-hub-signature-256")
  const rateLimitKey = `${getClientIp(request)}:${signatureHeader || "no-signature"}:webhook`
  const maxRequests = Number(WEBHOOK_RATE_LIMIT_MAX) || 120
  const windowMs = (Number(WEBHOOK_RATE_LIMIT_WINDOW_SEC) || 60) * 1000
  const rateLimitResult = checkRateLimit(rateLimitKey, { max: maxRequests, windowMs })

  if (!rateLimitResult.allowed) {
    logRateLimitRejection("/api/webhook", rateLimitKey, rateLimitResult.resetAt)
    return new Response("Too Many Requests", { status: 429 })
  }

  if (!verifyWebhookSignature(rawBody, signatureHeader, WHATSAPP_APP_SECRET)) {
    logger.warn("Webhook signature verification failed", { requestId })
    return new Response("Unauthorized", { status: 401 })
  }

  let body: any
  try {
    body = JSON.parse(rawBody)
  } catch (error) {
    logger.error("Invalid webhook JSON payload", { requestId, error })
    return new Response("Bad Request", { status: 400 })
  }

  try {
    await processWebhookEvent({ requestId, body })
  } catch (error) {
    logger.error("Webhook processing failed", { requestId, error })
  }

  return NextResponse.json({ status: "ok" })
}
