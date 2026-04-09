import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createLogger } from "@/lib/logger"
import crypto from "crypto"

const logger = createLogger("API:ChatbotRespond")

interface ChatbotMessage {
  messageId: string
  from: string
  body: string
  phoneNumberId: string
  projectId: string
  contactId?: string
  messageType: string
}

// Simple chatbot responses - can be replaced with AI
const getChatbotResponse = (messageBody: string, language: string = "ar"): string => {
  const text = messageBody.toLowerCase().trim()

  if (text.includes("مرحبا") || text.includes("hello") || text.includes("hi")) {
    return language === "ar" ? "مرحبا! كيف يمكننا مساعدتك؟" : "Hello! How can we help you?"
  }

  if (text.includes("شكرا") || text.includes("thanks") || text.includes("thank you")) {
    return language === "ar" ? "تشرفنا! 😊" : "You're welcome! 😊"
  }

  if (text.includes("ساعات") || text.includes("hours") || text.includes("timings")) {
    return language === "ar"
      ? "ساعات العمل: من السبت إلى الخميس، 9 صباحاً إلى 6 مساءً"
      : "Working hours: Saturday to Thursday, 9 AM to 6 PM"
  }

  if (text.includes("عنوان") || text.includes("address") || text.includes("location")) {
    return language === "ar" ? "يمكنك الاتصال بنا للحصول على العنوان" : "Please call us for our address"
  }

  if (text.includes("سعر") || text.includes("price") || text.includes("cost")) {
    return language === "ar" ? "يرجى المراسلة لمزيد من التفاصيل عن الأسعار" : "Please message for pricing details"
  }

  // Default response
  return language === "ar"
    ? "شكراً لرسالتك. سيتواصل معك فريقنا قريباً 🙏"
    : "Thank you for your message. Our team will contact you soon 🙏"
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    const body: ChatbotMessage = await request.json()
    const { messageId, from, body: messageBody, phoneNumberId, projectId, contactId, messageType } = body

    if (!messageId || !from || !messageBody || !phoneNumberId || !projectId) {
      logger.warn("Missing required fields", { requestId })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    logger.info("Processing chatbot request", { requestId, from, messageId })

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const apiVersion = process.env.WHATSAPP_API_VERSION || "v24.0"

    if (!accessToken) {
      logger.error("WhatsApp access token not configured", { requestId })
      return NextResponse.json({ error: "WhatsApp not configured" }, { status: 500 })
    }

    // Get chatbot response
    const botResponse = getChatbotResponse(messageBody, "ar")

    // Send response via WhatsApp API
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
          to: from,
          type: "text",
          text: {
            preview_url: false,
            body: botResponse,
          },
        }),
      }
    )

    const responseData = await metaResponse.json()

    if (metaResponse.ok && responseData.messages?.[0]?.id) {
      const botMessageId = responseData.messages[0].id
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

      // Store both incoming and outgoing messages
      const { error: insertError } = await supabase.from("messages").insert([
        {
          project_id: projectId,
          whatsapp_message_id: botMessageId,
          contact_id: contactId,
          whatsapp_number_id: whatsappNumber.id,
          body: botResponse,
          message_type: "text",
          direction: "outbound",
          status: "sent",
          created_at: new Date().toISOString(),
        },
      ])

      if (insertError) {
        logger.warn("Failed to store bot response", { requestId, error: insertError })
      } else {
        logger.info("Bot response sent and stored", { requestId, botMessageId })
      }

      return NextResponse.json({
        success: true,
        messageId: botMessageId,
        response: botResponse,
      })
    } else {
      logger.error("WhatsApp API error", { requestId, error: responseData.error || responseData })
      return NextResponse.json(
        { error: responseData.error?.message || "Failed to send response" },
        { status: metaResponse.status }
      )
    }
  } catch (error) {
    logger.error("Error processing chatbot request", { requestId, error })
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}
