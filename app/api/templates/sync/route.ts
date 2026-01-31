import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { getWhatsAppTemplates } from "@/lib/whatsapp"
import { logger } from "@/lib/logger"
import { checkRateLimit, getClientIp, logRateLimitRejection } from "@/lib/rate-limit"

const extractPreview = (components: any[]) => {
  const body = components?.find((component) => component.type === "BODY")
  return body?.text || ""
}

const countVariables = (text: string) => {
  const matches = text.match(/\{\{[^}]+\}\}/g)
  return matches ? matches.length : 0
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID()
  const rateLimitKey = `${getClientIp(request)}:templates:sync`
  const rateLimitResult = checkRateLimit(rateLimitKey, { max: 20, windowMs: 60 * 1000 })

  if (!rateLimitResult.allowed) {
    logRateLimitRejection("/api/templates/sync", rateLimitKey, rateLimitResult.resetAt)
    return new Response("Too Many Requests", { status: 429 })
  }

  const payload = await request.json()
  const supabase = getSupabaseAdmin()

  const { data: phoneNumber, error } = await supabase
    .from("whatsapp_numbers")
    .select("id, business_account_id")
    .eq("id", payload.phone_number_id)
    .maybeSingle()

  if (error || !phoneNumber?.business_account_id) {
    logger.error("Missing business account ID for template sync", { error, phoneNumberId: payload.phone_number_id })
    return new Response("Missing business account ID", { status: 400 })
  }

  let templates: any[] = []
  try {
    templates = await getWhatsAppTemplates(phoneNumber.business_account_id)
  } catch (error) {
    logger.error("Failed to fetch templates from WhatsApp", { error, phoneNumberId: phoneNumber.id })
    return new Response("Failed to fetch templates", { status: 502 })
  }

  for (const template of templates) {
    const previewText = extractPreview(template.components || [])
    const { error: upsertError } = await supabase.from("templates").upsert(
      {
        wa_template_name: template.name,
        wa_template_code: template.id,
        phone_number_id: phoneNumber.id,
        status: template.status,
        category: template.category,
        language: template.language,
        preview_text: previewText,
        variables_count: countVariables(previewText),
      },
      { onConflict: "wa_template_code,phone_number_id" },
    )

    if (upsertError) {
      logger.error("Failed to upsert template", { error: upsertError, templateId: template.id, requestId })
    }
  }

  logger.info("Templates synced", { requestId, count: templates.length })
  return NextResponse.json({ status: "ok", count: templates.length })
}
