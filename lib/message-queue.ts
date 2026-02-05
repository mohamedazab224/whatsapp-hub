import { getSupabaseAdmin } from "./supabase"
import { logger } from "./logger"

type MessageJobPayload = {
  message_id: string
  whatsapp_message_id: string
  contact_id?: string
  whatsapp_number_id: string
  phone_number_id?: string
  business_account_id?: string
}

type ProcessingStage = "RECEIVED" | "PARSED" | "CLASSIFIED" | "ROUTED" | "ACTIONED" | "COMPLETED"

const updateMessageStage = async (messageId: string, stage: ProcessingStage, intent?: string | null) => {
  const supabase = getSupabaseAdmin()
  const updatePayload: Record<string, string | null> = {
    processing_stage: stage,
  }

  if (intent !== undefined) {
    updatePayload.intent = intent
  }

  if (stage === "COMPLETED") {
    updatePayload.processed_at = new Date().toISOString()
  }

  const { error } = await supabase.from("messages").update(updatePayload).eq("id", messageId)
  if (error) {
    logger.error("Failed to update message processing stage", { error, messageId, stage })
  }
}

const parseMessage = (message: { body?: string | null; type?: string | null }) => {
  const text = message.body?.trim() || ""
  return {
    type: message.type || "unknown",
    text,
    hasText: text.length > 0,
  }
}

const classifyMessage = (parsed: { type: string; text: string; hasText: boolean }) => {
  if (!parsed.hasText) return "non_text"
  const lower = parsed.text.toLowerCase()
  if (lower.includes("price") || lower.includes("سعر")) return "pricing"
  if (lower.includes("help") || lower.includes("مساعدة")) return "support"
  if (lower.includes("order") || lower.includes("طلب")) return "order"
  return "general"
}

const routeMessage = async (payload: {
  messageId: string
  intent: string
  phoneNumberId?: string
  businessAccountId?: string
}) => {
  logger.info("Message routed", payload)
  // TODO: handleStatusUpdate()
  // TODO: handleMediaDownload()
  // TODO: triggerWorkflow()
}

const processMessageJob = async (jobId: string, payload: MessageJobPayload) => {
  const supabase = getSupabaseAdmin()
  const { data: message, error } = await supabase
    .from("messages")
    .select("id, body, type")
    .eq("id", payload.message_id)
    .maybeSingle()

  if (error) {
    throw new Error(`message fetch failed: ${error.message}`)
  }

  if (!message) {
    throw new Error("message not found")
  }

  await updateMessageStage(message.id, "PARSED")
  const parsed = parseMessage({ body: message.body, type: message.type })

  const intent = classifyMessage(parsed)
  await updateMessageStage(message.id, "CLASSIFIED", intent)

  await updateMessageStage(message.id, "ROUTED", intent)
  await routeMessage({
    messageId: message.id,
    intent,
    phoneNumberId: payload.phone_number_id,
    businessAccountId: payload.business_account_id,
  })

  await updateMessageStage(message.id, "ACTIONED", intent)
  await updateMessageStage(message.id, "COMPLETED", intent)

  logger.info("Message job processed", { jobId, messageId: message.id, intent })
}

export async function processPendingMessageJobs(batchSize = 10) {
  const supabase = getSupabaseAdmin()
  const now = new Date()
  const staleBefore = new Date(now.getTime() - 10 * 60 * 1000).toISOString()

  const { error: recycleError } = await supabase
    .from("message_jobs")
    .update({ status: "pending", updated_at: now.toISOString() })
    .eq("status", "processing")
    .lt("updated_at", staleBefore)

  if (recycleError) {
    logger.error("Failed to recycle stuck message jobs", { error: recycleError })
  }

  const { data: jobs, error } = await supabase
    .from("message_jobs")
    .select("id, payload")
    .eq("type", "message_process")
    .eq("status", "pending")
    .limit(batchSize)

  if (error) {
    logger.error("Failed to fetch message jobs", { error })
    return { processed: 0, failed: 0 }
  }

  let processed = 0
  let failed = 0

  for (const job of jobs ?? []) {
    const payload = job.payload as MessageJobPayload

    const { error: markError } = await supabase
      .from("message_jobs")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", job.id)
      .eq("status", "pending")

    if (markError) {
      logger.error("Failed to mark message job as processing", { error: markError, jobId: job.id })
      failed += 1
      continue
    }

    try {
      await processMessageJob(job.id, payload)
      await supabase.from("message_jobs").update({ status: "completed", updated_at: new Date().toISOString() }).eq("id", job.id)
      processed += 1
    } catch (error) {
      logger.error("Message job processing failed", { error, jobId: job.id })
      await supabase
        .from("message_jobs")
        .update({ status: "failed", error: String(error), updated_at: new Date().toISOString() })
        .eq("id", job.id)
      failed += 1
    }
  }

  return { processed, failed }
}
