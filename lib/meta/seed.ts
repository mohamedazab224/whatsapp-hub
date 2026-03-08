import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { WHATSAPP_NUMBERS, META_CONFIG } from "@/lib/meta/config"

/**
 * Seed WhatsApp numbers from Meta data into the database
 */
export async function seedWhatsAppNumbers(projectId: string) {
  try {
    const admin = createSupabaseAdminClient()

    // Check which numbers already exist
    const { data: existingNumbers } = await admin
      .from("whatsapp_numbers")
      .select("phone_number_id")
      .eq("project_id", projectId)

    const existingIds = new Set(existingNumbers?.map((n) => n.phone_number_id) || [])

    // Filter out numbers that already exist
    const numbersToAdd = WHATSAPP_NUMBERS.filter((num) => !existingIds.has(num.phoneNumberId))

    if (numbersToAdd.length === 0) {
      console.log(`[v0] All ${WHATSAPP_NUMBERS.length} numbers already seeded for project ${projectId}`)
      return { count: 0, message: "Numbers already seeded" }
    }

    // Insert new numbers
    const { error } = await admin
      .from("whatsapp_numbers")
      .insert(
        numbersToAdd.map((num) => ({
          project_id: projectId,
          phone_number_id: num.phoneNumberId,
          display_phone_number: num.displayPhoneNumber,
          verified_name: num.verifiedName,
          quality_rating: num.qualityRating,
          is_active: num.status === "CONNECTED",
        }))
      )

    if (error) {
      console.error("[v0] Error seeding numbers:", error)
      throw error
    }

    console.log(`[v0] Seeded ${numbersToAdd.length} WhatsApp numbers for project ${projectId}`)
    return { count: numbersToAdd.length, message: "Numbers seeded successfully" }
  } catch (error) {
    console.error("[v0] Error in seedWhatsAppNumbers:", error)
    throw error
  }
}

/**
 * Seed message templates from Meta data
 */
export async function seedMessageTemplates(projectId: string) {
  try {
    const admin = createSupabaseAdminClient()
    const templates = Object.values(META_CONFIG.templates)

    // Check existing templates
    const { data: existingTemplates } = await admin
      .from("message_templates")
      .select("name")
      .eq("project_id", projectId)

    const existingNames = new Set(existingTemplates?.map((t) => t.name) || [])

    // Filter out existing templates
    const templatesToAdd = templates.filter((t) => !existingNames.has(t.name))

    if (templatesToAdd.length === 0) {
      console.log(`[v0] All templates already seeded for project ${projectId}`)
      return { count: 0, message: "Templates already seeded" }
    }

    // Insert templates
    const { error } = await admin
      .from("message_templates")
      .insert(
        templatesToAdd.map((t) => ({
          project_id: projectId,
          name: t.name,
          channel: "whatsapp",
          status: t.status,
          is_active: true,
          content: t.name,
          variables: {},
        }))
      )

    if (error) {
      console.error("[v0] Error seeding templates:", error)
      throw error
    }

    console.log(`[v0] Seeded ${templatesToAdd.length} message templates for project ${projectId}`)
    return { count: templatesToAdd.length, message: "Templates seeded successfully" }
  } catch (error) {
    console.error("[v0] Error in seedMessageTemplates:", error)
    throw error
  }
}

/**
 * Get all Meta business info
 */
export function getMetaBusinessInfo() {
  return META_CONFIG.business
}

/**
 * Get all WABAs
 */
export function getWABAs() {
  return META_CONFIG.wabas
}

/**
 * Get all WhatsApp numbers
 */
export function getWhatsAppNumbers() {
  return WHATSAPP_NUMBERS
}
