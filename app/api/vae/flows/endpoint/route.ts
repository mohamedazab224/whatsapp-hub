import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "verify_token_flows"
const APP_SECRET = process.env.META_APP_SECRET || "app_secret"

interface FlowRequest {
  encrypted_flow_data: string
  encrypted_aes_key: string
  initial_vector: string
}

interface DecryptedFlow {
  action: string
  screen: string
  data: Record<string, any>
  flow_token: string
}

/**
 * Flow Endpoint for WhatsApp Business API
 * Handles encrypted flow requests from Meta
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Flow endpoint received request")

    // Verify signature if provided
    const signature = request.headers.get("x-hub-signature-256")
    if (signature && APP_SECRET !== "app_secret") {
      const bodyText = await request.text()
      const hash = crypto.createHmac("sha256", APP_SECRET).update(bodyText).digest("hex")
      const expected = `sha256=${hash}`

      if (signature !== expected) {
        console.warn("[v0] Invalid flow signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const body = (await request.json()) as FlowRequest

    if (!body.encrypted_flow_data || !body.encrypted_aes_key || !body.initial_vector) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Flow data received - action pending")

    // For now, return a success response
    // In production, you would decrypt and process the flow
    const response = {
      screen: "SUCCESS",
      data: {
        message: "Flow processed successfully",
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Flow endpoint error:", error)
    return NextResponse.json({ error: "Processing failed" }, { status: 500 })
  }
}

/**
 * Webhook verification endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const mode = request.nextUrl.searchParams.get("hub.mode")
    const token = request.nextUrl.searchParams.get("hub.verify_token")
    const challenge = request.nextUrl.searchParams.get("hub.challenge")

    if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
      console.log("[v0] Flow webhook verified")
      return new NextResponse(challenge, { status: 200 })
    }

    console.warn("[v0] Flow webhook verification failed")
    return NextResponse.json({ error: "Verification failed" }, { status: 403 })
  } catch (error) {
    console.error("[v0] Verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
