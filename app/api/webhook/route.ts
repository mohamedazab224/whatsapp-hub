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
  // Placeholder implementation
  logger.info("Processing webhook event", { requestId, eventType: body.entry?.[0]?.changes?.[0]?.field })
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
