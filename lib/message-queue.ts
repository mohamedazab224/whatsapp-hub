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
      const { data: existingMessage } = await supabase
        .from("messages")
        .select("id")
        .eq("id", payload.message_id)
        .maybeSingle()

      if (!existingMessage) {
        await supabase
          .from("message_jobs")
          .update({ status: "failed", error: "message not found", updated_at: new Date().toISOString() })
          .eq("id", job.id)
        failed += 1
        continue
      }

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
