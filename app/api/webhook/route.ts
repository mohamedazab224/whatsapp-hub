import { NextResponse } from "next/server"
import { getWebhookEnv } from "@/lib/env.server"
import { logger } from "@/lib/logger"
import { checkRateLimit, getClientIp, logRateLimitRejection } from "@/lib/rate-limit"
import { verifyWebhookSignature } from "@/lib/webhook-security"
import { processWebhookEvent } from "@/lib/workflow-engine"

export async function GET(request: Request) {
  const requestId = crypto.randomUUID()
  const { WHATSAPP_WEBHOOK_VERIFY_TOKEN } = getWebhookEnv()
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
  const { WHATSAPP_APP_SECRET, WEBHOOK_RATE_LIMIT_MAX, WEBHOOK_RATE_LIMIT_WINDOW_SEC } = getWebhookEnv()
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
