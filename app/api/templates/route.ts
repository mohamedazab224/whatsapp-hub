import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { createWhatsAppTemplate } from "@/lib/whatsapp"
import { logger } from "@/lib/logger"

const extractPreview = (components: any[]) => {
  const body = components?.find((component) => component.type === "BODY")
  return body?.text || ""
}

const countVariables = (text: string) => {
  const matches = text.match(/\{\{[^}]+\}\}/g)
  return matches ? matches.length : 0
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const phoneNumberId = searchParams.get("phone_number_id")
  const status = searchParams.get("status")
  const category = searchParams.get("category")
  const search = searchParams.get("search")

  if (!phoneNumberId) {
    return NextResponse.json([])
  }

  const supabase = getSupabaseAdmin()
  let query = supabase.from("templates").select("*").eq("phone_number_id", phoneNumberId)

  if (status) {
    query = query.eq("status", status)
  }
  if (category) {
    query = query.eq("category", category)
  }
  if (search) {
    query = query.or(`wa_template_name.ilike.%${search}%,preview_text.ilike.%${search}%`)
  }

  const { data, error } = await query.order("created_at", { ascending: false })
  if (error) {
    logger.error("Failed to fetch templates", { error })
    return new Response("Failed to fetch templates", { status: 500 })
  }

  return NextResponse.json(data || [])
}

export async function POST(request: Request) {
  const payload = await request.json()
  const supabase = getSupabaseAdmin()

  const { data: phoneNumber, error } = await supabase
    .from("whatsapp_numbers")
    .select("id, phone_number_id, business_account_id")
    .eq("id", payload.phone_number_id)
    .maybeSingle()

  if (error || !phoneNumber || !phoneNumber.business_account_id) {
    logger.error("Missing business account ID for template creation", { error, phoneNumberId: payload.phone_number_id })
    return new Response("Missing business account ID", { status: 400 })
  }

  const category = payload.category === "OTP" ? "AUTHENTICATION" : payload.category

  let metaResponse: { id: string; status?: string }
  try {
    metaResponse = await createWhatsAppTemplate(phoneNumber.business_account_id, {
      name: payload.name,
      category,
      language: payload.language,
      components: payload.components || [],
    })
  } catch (error) {
    logger.error("Failed to create template in WhatsApp", { error, phoneNumberId: phoneNumber.id })
    return new Response("Failed to create template", { status: 502 })
  }

  const previewText = extractPreview(payload.components || [])
  const { error: insertError } = await supabase.from("templates").insert({
    wa_template_name: payload.name,
    wa_template_code: metaResponse.id,
    phone_number_id: phoneNumber.id,
    status: metaResponse.status || "PENDING",
    category,
    language: payload.language,
    preview_text: previewText,
    variables_count: countVariables(previewText),
  })

  if (insertError) {
    logger.error("Failed to store template", { error: insertError })
    return new Response("Failed to store template", { status: 500 })
  }

  logger.info("Template created", { templateId: metaResponse.id, phoneNumberId: phoneNumber.id })
  return NextResponse.json({ status: "ok" })
}
