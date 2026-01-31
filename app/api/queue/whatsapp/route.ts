import { NextResponse } from "next/server"
import { env } from "@/lib/env"
import { logger } from "@/lib/logger"
import { checkRateLimit, getClientIp, logRateLimitRejection } from "@/lib/rate-limit"
import { processPendingAiJobs } from "@/lib/message-queue"

export async function POST(request: Request) {
  const requestId = crypto.randomUUID()
  const rateLimitKey = `${getClientIp(request)}:queue`
  const maxRequests = Number(env.QUEUE_RATE_LIMIT_MAX) || 30
  const windowMs = (Number(env.QUEUE_RATE_LIMIT_WINDOW_SEC) || 60) * 1000
  const rateLimitResult = checkRateLimit(rateLimitKey, { max: maxRequests, windowMs })

  if (!rateLimitResult.allowed) {
    logRateLimitRejection("/api/queue/whatsapp", rateLimitKey, rateLimitResult.resetAt)
    return new Response("Too Many Requests", { status: 429 })
  }
  const secret = request.headers.get("x-queue-secret")

  if (!secret || secret !== env.QUEUE_SECRET) {
    logger.warn("Queue authentication failed", { requestId })
    return new Response("Unauthorized", { status: 401 })
  }

  const { processed, failed } = await processPendingAiJobs()
  logger.info("Queue processing completed", { requestId, processed, failed })

  return NextResponse.json({ status: "ok", processed, failed })
}
