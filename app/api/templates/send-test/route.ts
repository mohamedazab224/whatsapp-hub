import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { sendWhatsAppMessage } from "@/lib/whatsapp"
import { logger } from "@/lib/logger"

export async function POST(request: Request) {
  const payload = await request.json()
  const supabase = getSupabaseAdmin()

  const { data: template, error } = await supabase
    .from("templates")
    .select("id, wa_template_name, language")
    .eq("id", payload.template_id)
    .maybeSingle()

  if (error || !template || !template.wa_template_name || !template.language) {
    logger.error("Template not found for test send", { error, templateId: payload.template_id })
    return new Response("Not Found", { status: 404 })
  }

  const { data: phoneNumber, error: phoneError } = await supabase
    .from("whatsapp_numbers")
    .select("phone_number_id")
    .eq("id", payload.phone_number_id)
    .maybeSingle()

  if (phoneError || !phoneNumber || !phoneNumber.phone_number_id) {
    logger.error("Phone number not found for test send", { error: phoneError, phoneNumberId: payload.phone_number_id })
    return new Response("Missing phone number", { status: 400 })
  }

  const message = {
    template: {
      name: template.wa_template_name,
      language: { code: template.language },
    },
  }

  try {
    await sendWhatsAppMessage(phoneNumber.phone_number_id, payload.to, message)
    logger.info("Template test message sent", {
      templateId: template.id,
      phoneNumberId: payload.phone_number_id,
      to: payload.to,
    })
    return NextResponse.json({ status: "ok" })
  } catch (error) {
    logger.error("Failed to send template test message", { error, templateId: template.id })
    return new Response("Failed to send template message", { status: 502 })
  }
}
