import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { sendWhatsAppMessage } from "@/lib/whatsapp"

type TemplatePayload = {
  phone: string
  templateName: string
  variables?: Record<string, string | number | boolean>
  projectId?: string
  language?: string
}

type WhatsAppNumberRow = {
  phone_number_id?: string | null
}

export class WhatsAppService {
  private static instance: WhatsAppService | null = null

  static getInstance() {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService()
    }
    return WhatsAppService.instance
  }

  async sendTemplateMessage({ phone, templateName, variables = {}, projectId, language = "ar" }: TemplatePayload) {
    const phoneNumberId = await this.resolvePhoneNumberId(projectId)
    if (!phoneNumberId) {
      throw new Error("Missing WhatsApp phone number id for template message.")
    }

    const components =
      Object.keys(variables).length > 0
        ? [
            {
              type: "body",
              parameters: Object.values(variables).map((value) => ({
                type: "text",
                text: String(value),
              })),
            },
          ]
        : []

    return sendWhatsAppMessage(phoneNumberId, phone, {
      type: "template",
      template: {
        name: templateName,
        language: { code: language },
        ...(components.length ? { components } : {}),
      },
    })
  }

  private async resolvePhoneNumberId(projectId?: string) {
    if (!projectId) {
      return process.env.WHATSAPP_PHONE_NUMBER_ID ?? null
    }

    const supabase = createSupabaseAdminClient()
    const { data } = await supabase
      .from("whatsapp_numbers")
      .select("phone_number_id")
      .eq("project_id", projectId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    return (data as WhatsAppNumberRow | null)?.phone_number_id ?? process.env.WHATSAPP_PHONE_NUMBER_ID ?? null
  }
}
