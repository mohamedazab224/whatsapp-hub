import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
})

interface SendMessageRequest {
  phoneNumberId: string
  recipientPhone: string
  message: string
  projectId: string
  contactId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SendMessageRequest = await request.json()

    const { phoneNumberId, recipientPhone, message, projectId, contactId } = body

    if (!phoneNumberId || !recipientPhone || !message || !projectId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const apiVersion = process.env.WHATSAPP_API_VERSION || "v24.0"

    // إرسال الرسالة عبر WhatsApp API
    const response = await fetch(
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

    const responseData = await response.json()

    if (response.ok && responseData.messages) {
      const messageId = responseData.messages[0].id

      // حفظ الرسالة في قاعدة البيانات
      const { error: saveError } = await supabase
        .from("messages")
        .insert({
          wamid: messageId,
          contact_id: contactId,
          project_id: projectId,
          whatsapp_number_id: phoneNumberId,
          to_phone_id: recipientPhone,
          direction: "outbound",
          status: "sent",
          type: "text",
          body: message,
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })

      if (saveError) {
        console.error("Error saving outbound message:", saveError)
      }

      return NextResponse.json({
        success: true,
        messageId,
      })
    } else {
      console.error("WhatsApp API error:", responseData)
      return NextResponse.json(
        { error: responseData.error?.message || "Failed to send message" },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
