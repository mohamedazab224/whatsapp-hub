import { AIService } from "./ai-service"
import { getSupabaseAdmin } from "./supabase"
import { sendWhatsAppMessage } from "./whatsapp"
import { logger } from "./logger"

type AiJobPayload = {
  inbound_message_id: string
  contact_id: string
  whatsapp_number_id: string
  project_id: string
  workflow_id: string
  whatsapp_phone_number_id: string
  recipient: string
  message_body: string
}

export async function enqueueAiReplyJob(payload: AiJobPayload) {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase.from("message_jobs").insert({
    type: "ai_reply",
    status: "pending",
    payload,
  })

  if (error) {
    logger.error("Failed to enqueue AI reply job", { error, payload })
  }
}

export async function processPendingAiJobs(batchSize = 10) {
  const supabase = getSupabaseAdmin()

  const { data: jobs, error } = await supabase
    .from("message_jobs")
    .select("id, payload")
    .eq("type", "ai_reply")
    .eq("status", "pending")
    .limit(batchSize)

  if (error) {
    logger.error("Failed to fetch AI reply jobs", { error })
    return { processed: 0, failed: 0 }
  }

  let processed = 0
  let failed = 0

  for (const job of jobs ?? []) {
    const payload = job.payload as AiJobPayload

    const { error: markError } = await supabase
      .from("message_jobs")
      .update({ status: "processing" })
      .eq("id", job.id)
      .eq("status", "pending")

    if (markError) {
      logger.error("Failed to mark AI job as processing", { error: markError, jobId: job.id })
      failed += 1
      continue
    }

    try {
      const { data: steps } = await supabase
        .from("workflow_steps")
        .select("id")
        .eq("workflow_id", payload.workflow_id)
        .eq("type", "ai_response")
        .eq("is_active", true)
        .limit(1)

      if (!steps?.length) {
        await supabase.from("message_jobs").update({ status: "completed" }).eq("id", job.id)
        processed += 1
        continue
      }

      const { data: existingReply } = await supabase
        .from("messages")
        .select("id")
        .eq("direction", "outbound")
        .eq("contact_id", payload.contact_id)
        .contains("metadata", { inbound_message_id: payload.inbound_message_id })
        .maybeSingle()

      if (existingReply) {
        await supabase.from("message_jobs").update({ status: "completed" }).eq("id", job.id)
        processed += 1
        continue
      }

      const aiService = await AIService.fromProjectId(payload.project_id)
      if (!aiService) {
        await supabase.from("message_jobs").update({ status: "completed" }).eq("id", job.id)
        processed += 1
        continue
      }

      const { data: history } = await supabase
        .from("messages")
        .select("body, direction")
        .eq("contact_id", payload.contact_id)
        .order("created_at", { ascending: false })
        .limit(10)

      const conversation =
        history
          ?.reverse()
          .map((m) => ({
            role: m.direction === "inbound" ? ("user" as const) : ("assistant" as const),
            content: m.body || "",
          }))
          .filter((m) => m.content.trim() !== "") || []

      const responseText = await aiService.generateResponse([
        ...conversation,
        { role: "user", content: payload.message_body },
      ])

      if (responseText) {
        await sendWhatsAppMessage(payload.whatsapp_phone_number_id, payload.recipient, responseText)

        await supabase.from("messages").insert({
          contact_id: payload.contact_id,
          whatsapp_number_id: payload.whatsapp_number_id,
          project_id: payload.project_id,
          workflow_id: payload.workflow_id,
          type: "text",
          direction: "outbound",
          body: responseText,
          metadata: { ai_generated: true, source: "alazab-hub-ai", inbound_message_id: payload.inbound_message_id },
        })
      }

      await supabase.from("message_jobs").update({ status: "completed" }).eq("id", job.id)
      processed += 1
    } catch (error) {
      logger.error("AI job processing failed", { error, jobId: job.id })
      await supabase.from("message_jobs").update({ status: "failed", error: String(error) }).eq("id", job.id)
      failed += 1
    }
  }

  return { processed, failed }
}
