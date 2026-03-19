import { NextRequest, NextResponse } from "next/server"
import { webhookQueue } from "@/lib/queue/webhook-processor"
import { createLogger } from "@/lib/logger"
import { checkRateLimit } from "@/lib/ratelimit"
import { ResponseBuilder } from "@/lib/response/builder"
import crypto from "crypto"

const logger = createLogger("Webhook:WhatsApp")

/**
 * WhatsApp Business API Webhook Handler
 * Receives messages from Meta and queues them for processing
 */

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    if (!checkRateLimit(`webhook:${ip}`, 1000, 60000)) {
      logger.warn("Rate limit exceeded", { ip })
      return ResponseBuilder.rateLimitExceeded(60)
    }

    const bodyText = await request.text()
    const body = JSON.parse(bodyText)

    // Verify WhatsApp signature (critical for security)
    const signature = request.headers.get("x-hub-signature-256") || ""
    const appSecret = process.env.WHATSAPP_APP_SECRET

    if (!appSecret) {
      logger.error("WHATSAPP_APP_SECRET not configured")
      return ResponseBuilder.internalError("Server misconfigured")
    }

    const hash = crypto
      .createHmac("sha256", appSecret)
      .update(bodyText)
      .digest("hex")

    const expectedSignature = `sha256=${hash}`
    if (signature !== expectedSignature) {
      logger.warn("Invalid webhook signature", { signature, expected: expectedSignature })
      return ResponseBuilder.error("Invalid signature", 403, "INVALID_SIGNATURE")
    }

    // Queue the webhook for processing (return immediately to Meta)
    const jobId = await webhookQueue.enqueue(body)
    logger.info("Webhook queued for processing", { jobId, ip })

    // Return immediately (required by Meta)
    return ResponseBuilder.success({ jobId, queued: true }, 200)
  } catch (error) {
    logger.error("Webhook processing error", error)
    return ResponseBuilder.internalError()
  }
}

// GET request - Webhook verification
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get("hub.mode")
    const token = searchParams.get("hub.verify_token")
    const challenge = searchParams.get("hub.challenge")

    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

    if (!verifyToken) {
      logger.error("WHATSAPP_WEBHOOK_VERIFY_TOKEN not configured")
      return ResponseBuilder.internalError()
    }

    if (mode === "subscribe" && token === verifyToken) {
      logger.info("Webhook verified successfully")
      return new Response(challenge, { status: 200 })
    }

    logger.warn("Webhook verification failed", { mode, token, verifyToken })
    return ResponseBuilder.error("Forbidden", 403, "FORBIDDEN")
  } catch (error) {
    logger.error("Webhook verification error", error)
    return ResponseBuilder.internalError()
  }
}

                // Forward to VAE for processing
                await forwardToVAE(projectId, "message", {
                  contact_id: contact.id,
                  message_type: message.type,
                  body: message.text?.body,
                  flow: routing.targetFlow,
                  timestamp: new Date().toISOString(),
                })
              }
            } catch (error) {
              console.error(`[v0] Error routing message:`, error)
            }
          }
        }

        // Handle status updates
        if (value.statuses) {
          for (const status of value.statuses) {
            try {
              await admin
                .from("messages")
                .update({ status: status.status })
                .eq("wamid", status.id)
                .eq("project_id", projectId)
            } catch (error) {
              console.error(`[v0] Error updating message status:`, error)
            }
          }
        }
      }
    }

    console.log(`[v0] Webhook processed ${totalProcessed} events`)

    return NextResponse.json({
      ok: true,
      processed: totalProcessed,
    })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json(
      { error: "Processing failed", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// GET request - Webhook verification
export async function GET(request: NextRequest) {
  try {
    const mode = request.nextUrl.searchParams.get("hub.mode")
    const token = request.nextUrl.searchParams.get("hub.verify_token")
    const challenge = request.nextUrl.searchParams.get("hub.challenge")

    const verifyToken = process.env.VERIFY_TOKEN || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

    if (!verifyToken) {
      console.error("[v0] VERIFY_TOKEN not configured")
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
    }

    if (mode === "subscribe" && token === verifyToken && challenge) {
      console.log("[v0] Webhook verified successfully")
      return new NextResponse(challenge, { status: 200 })
    }

    console.warn("[v0] Webhook verification failed")
    return NextResponse.json({ error: "Verification failed" }, { status: 403 })
  } catch (error) {
    console.error("[v0] Verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}

