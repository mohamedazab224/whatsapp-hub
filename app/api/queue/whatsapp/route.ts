import { NextResponse } from "next/server"
import { getQueueEnv } from "@/lib/env.server"
import { logger } from "@/lib/logger"
import { checkRateLimit, getClientIp, logRateLimitRejection } from "@/lib/rate-limit"
import { processPendingMessageJobs } from "@/lib/message-queue"

export async function POST(request: Request) {
  const requestId = crypto.randomUUID()
  const { QUEUE_RATE_LIMIT_MAX, QUEUE_RATE_LIMIT_WINDOW_SEC, QUEUE_SECRET } = getQueueEnv()
  const rateLimitKey = `${getClientIp(request)}:queue`
  const maxRequests = Number(QUEUE_RATE_LIMIT_MAX) || 30
  const windowMs = (Number(QUEUE_RATE_LIMIT_WINDOW_SEC) || 60) * 1000
  const rateLimitResult = checkRateLimit(rateLimitKey, { max: maxRequests, windowMs })

  if (!rateLimitResult.allowed) {
    logRateLimitRejection("/api/queue/whatsapp", rateLimitKey, rateLimitResult.resetAt)
    return new Response("Too Many Requests", { status: 429 })
  }
  const secret = request.headers.get("x-queue-secret")

  if (!secret || secret !== QUEUE_SECRET) {
    logger.warn("Queue authentication failed", { requestId })
    return new Response("Unauthorized", { status: 401 })
  }

  const { processed, failed } = await processPendingMessageJobs()
  logger.info("Queue processing completed", { requestId, processed, failed })

  return NextResponse.json({ status: "ok", processed, failed })
}
