import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { phone_number, message } = await request.json()

    // البيانات المطلوبة
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const apiVersion = process.env.WHATSAPP_API_VERSION || "v24.0"

    if (!accessToken || !phoneNumberId) {
      return NextResponse.json({ error: "Missing configuration" }, { status: 400 })
    }

    // رابط API الخاص بـ Meta
    const url = `https://graph.instagram.com/${apiVersion}/${phoneNumberId}/messages`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone_number,
        type: "text",
        text: { body: message },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("WhatsApp API error:", data)
      return NextResponse.json({ error: data.error?.message }, { status: response.status })
    }

    console.log("[v0] Message sent successfully:", data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Send message error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
