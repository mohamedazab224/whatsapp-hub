import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createLogger } from "@/lib/logger"
import crypto from "crypto"

const logger = createLogger("API:SendMessage")

interface SendMessageRequest {
  phoneNumberId: string
  recipientPhone: string
  message: string
  projectId: string
  contactId?: string
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  
  try {
    const body: SendMessageRequest = await request.json()
    const { phoneNumberId, recipientPhone, message, projectId, contactId } = body

    if (!phoneNumberId || !recipientPhone || !message || !projectId) {
      logger.warn("Missing required fields", { requestId, fields: { phoneNumberId, recipientPhone, message, projectId } })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const apiVersion = process.env.WHATSAPP_API_VERSION || "v24.0"

    if (!accessToken) {
      logger.error("WhatsApp access token not configured", { requestId })
      return NextResponse.json({ error: "WhatsApp not configured" }, { status: 500 })
    }

    logger.info("Sending message via WhatsApp API", { requestId, phoneNumberId, recipientPhone })

    // إرسال الرسالة عبر WhatsApp API
    const metaResponse = await fetch(
      `https://graph.instagram.com/${apiVersion}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipientPhone,
          type: "text",
          text: {
            preview_url: false,
            body: message,
          },
        }),
      }
    )

    const responseData = await metaResponse.json()

    if (metaResponse.ok && responseData.messages?.[0]?.id) {
      const messageId = responseData.messages[0].id
      const supabase = await createSupabaseServerClient()

      // Get whatsapp_number_id
      const { data: whatsappNumber } = await supabase
        .from("whatsapp_numbers")
        .select("id")
        .eq("phone_number_id", phoneNumberId)
        .maybeSingle()

      if (!whatsappNumber) {
        logger.warn("WhatsApp number not found", { requestId, phoneNumberId })
        return NextResponse.json({ error: "WhatsApp number not configured" }, { status: 500 })
      }

      const whatsappNumberData = whatsappNumber as unknown as { id: string }
      // حفظ الرسالة في قاعدة البيانات
      const { error: saveError } = await supabase
        .from("messages")
        .insert({
          project_id: projectId,
          whatsapp_message_id: messageId,
          contact_id: contactId,
          whatsapp_number_id: whatsappNumberData.id,
          body: message,
          message_type: "text",
          direction: "outbound",
          status: "sent",
          created_at: new Date().toISOString(),
        })

      if (saveError) {
        logger.warn("Failed to save sent message to database", { requestId, messageId, error: saveError })
      } else {
        logger.info("Message sent and stored successfully", { requestId, messageId })
      }

      return NextResponse.json({ success: true, messageId })
    } else {
      logger.error("WhatsApp API error", { requestId, error: responseData.error || responseData })
      return NextResponse.json(
        { error: responseData.error?.message || "Failed to send message" },
        { status: metaResponse.status }
      )
    }
  } catch (error) {
    logger.error("Error sending message", { requestId, error })
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
