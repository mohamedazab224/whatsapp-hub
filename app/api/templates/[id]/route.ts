import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { deleteWhatsAppTemplate } from "@/lib/whatsapp"
import { logger } from "@/lib/logger"

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = getSupabaseAdmin()
  const { data: template, error } = await supabase
    .from("templates")
    .select("id, wa_template_code")
    .eq("id", id)
    .maybeSingle()

  if (error || !template || !template.wa_template_code) {
    logger.error("Template not found", { error, templateId: id })
    return new Response("Not Found", { status: 404 })
  }

  const deleteResult = await deleteWhatsAppTemplate(template.wa_template_code)
  if (!deleteResult) {
    logger.error("Failed to delete template in WhatsApp", { templateId: id })
    return new Response("Failed to delete template", { status: 400 })
  }

  const { error: deleteError } = await supabase.from("templates").delete().eq("id", id)
  if (deleteError) {
    logger.error("Failed to delete template record", { error: deleteError, templateId: id })
    return new Response("Failed to delete template", { status: 500 })
  }

  logger.info("Template deleted", { templateId: id })
  return NextResponse.json({ status: "ok" })
}
