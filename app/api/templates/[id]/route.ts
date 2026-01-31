import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { deleteWhatsAppTemplate } from "@/lib/whatsapp"
import { logger } from "@/lib/logger"

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin()
  const { data: template, error } = await supabase
    .from("templates")
    .select("id, wa_template_code")
    .eq("id", params.id)
    .maybeSingle()

  if (error || !template) {
    logger.error("Template not found", { error, templateId: params.id })
    return new Response("Not Found", { status: 404 })
  }

  const deleteResult = await deleteWhatsAppTemplate(template.wa_template_code)
  if (!deleteResult) {
    logger.error("Failed to delete template in WhatsApp", { templateId: params.id })
    return new Response("Failed to delete template", { status: 400 })
  }

  const { error: deleteError } = await supabase.from("templates").delete().eq("id", params.id)
  if (deleteError) {
    logger.error("Failed to delete template record", { error: deleteError, templateId: params.id })
    return new Response("Failed to delete template", { status: 500 })
  }

  logger.info("Template deleted", { templateId: params.id })
  return NextResponse.json({ status: "ok" })
}
