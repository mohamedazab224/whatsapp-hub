"use server"

import { revalidatePath } from "next/cache"
import {
  getWhatsAppTemplates,
  sendWhatsAppMessage,
  createWhatsAppTemplate,
  getWhatsAppTemplateById,
} from "@/lib/whatsapp"
import { getSupabaseAdmin } from "@/lib/supabase"

const BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID

export async function syncTemplates(phoneNumberId: string) {
  if (!BUSINESS_ACCOUNT_ID) throw new Error("Missing WHATSAPP_BUSINESS_ACCOUNT_ID")

  const supabase = getSupabaseAdmin()
  
  // <CHANGE> Get UUID for phone number
  const { data: phoneNumber } = await supabase
    .from("whatsapp_numbers")
    .select("id")
    .eq("phone_number_id", phoneNumberId)
    .single()

  if (!phoneNumber) throw new Error("Phone number not found in database")

  const templates = await getWhatsAppTemplates(BUSINESS_ACCOUNT_ID)

  for (const template of templates) {
    const { error } = await supabase.from("message_templates").upsert(
      {
        template_id: template.id,
        name: template.name,
        category: template.category,
        language: template.language,
        status: template.status,
        content: template.components,
        whatsapp_number_id: phoneNumber.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "template_id" },
    )

    if (error) console.error("[app] Error syncing template:", error)
  }

  revalidatePath("/templates")
  return { success: true, count: templates.length }
}

// <CHANGE> Add function to create and submit template to Meta
export async function createAndSubmitTemplate(
  phoneNumberId: string,
  templateData: {
    name: string
    category: string
    language: string
    components: any[]
  },
) {
  if (!BUSINESS_ACCOUNT_ID) throw new Error("Missing WHATSAPP_BUSINESS_ACCOUNT_ID")

  const supabase = getSupabaseAdmin()

  // Get UUID for phone number
  const { data: phoneNumber } = await supabase
    .from("whatsapp_numbers")
    .select("id")
    .eq("phone_number_id", phoneNumberId)
    .single()

  if (!phoneNumber) throw new Error("Phone number not found in database")

  // Create template on Meta
  const metaResponse = await createWhatsAppTemplate(BUSINESS_ACCOUNT_ID, templateData)

  // Save to database
  const { error } = await supabase.from("message_templates").insert({
    template_id: metaResponse.id,
    name: templateData.name,
    category: templateData.category,
    language: templateData.language,
    status: metaResponse.status || "PENDING",
    content: templateData.components,
    whatsapp_number_id: phoneNumber.id,
  })

  if (error) throw new Error(`Database error: ${error.message}`)

  revalidatePath("/templates")
  return { success: true, templateId: metaResponse.id, status: metaResponse.status }
}

// <CHANGE> Add function to get templates from database
export async function getTemplatesFromDB(phoneNumberId: string) {
  const supabase = getSupabaseAdmin()

  const { data: phoneNumber } = await supabase
    .from("whatsapp_numbers")
    .select("id")
    .eq("phone_number_id", phoneNumberId)
    .single()

  if (!phoneNumber) return []

  const { data: templates, error } = await supabase
    .from("message_templates")
    .select("*")
    .eq("whatsapp_number_id", phoneNumber.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[app] Error fetching templates:", error)
    return []
  }

  return templates || []
}

export async function sendMessageAction(to: string, message: any, phoneNumberId: string) {
  const result = await sendWhatsAppMessage(phoneNumberId, to, message)
  // Logic to save message to DB would go here
  return result
}
