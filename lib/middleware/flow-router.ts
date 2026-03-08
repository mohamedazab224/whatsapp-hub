import { createSupabaseAdminClient } from "@/lib/supabase/admin"

/**
 * Flow & Routing Manager
 * Routes incoming WhatsApp messages to appropriate flows/handlers within VAE
 * Supports dynamic routing rules based on sender, keywords, and patterns
 */

export interface RoutingRule {
  id: string
  project_id: string
  pattern: string // Regex pattern to match
  flow_type: "keyword_trigger" | "contact_based" | "intent_based"
  target_flow: string
  priority: number
  is_active: boolean
}

export interface MessageContext {
  projectId: string
  contactId: string
  phoneNumberId: string
  messageBody: string
  messageType: "text" | "image" | "video" | "document"
  senderPhone: string
}

export async function routeMessage(context: MessageContext): Promise<{
  shouldRoute: boolean
  targetFlow?: string
  flowParams?: Record<string, any>
  error?: string
}> {
  try {
    const admin = createSupabaseAdminClient()

    // Get all active routing rules for the project
    const { data: rules, error: rulesError } = await admin
      .from("workflows") // Using workflows as routing rules table
      .select("*")
      .eq("project_id", context.projectId)
      .eq("is_active", true)
      .order("trigger_type", { ascending: true })

    if (rulesError) {
      console.error("[v0] Failed to load routing rules:", rulesError)
      return { shouldRoute: false, error: rulesError.message }
    }

    // Evaluate rules in priority order
    for (const rule of rules || []) {
      const matched = matchRule(rule, context)

      if (matched) {
        console.log(`[v0] Message matched rule: ${rule.name}`)

        return {
          shouldRoute: true,
          targetFlow: rule.id,
          flowParams: {
            contact_id: context.contactId,
            message_body: context.messageBody,
            message_type: context.messageType,
            sender_phone: context.senderPhone,
          },
        }
      }
    }

    // No rule matched - use default flow
    console.log("[v0] No routing rule matched, using default flow")
    return {
      shouldRoute: true,
      targetFlow: "default",
      flowParams: {
        contact_id: context.contactId,
        message_body: context.messageBody,
        message_type: context.messageType,
      },
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[v0] Routing error: ${msg}`)
    return { shouldRoute: false, error: msg }
  }
}

function matchRule(rule: any, context: MessageContext): boolean {
  try {
    const triggerType = rule.trigger_type

    if (triggerType === "keyword" || triggerType === "keyword_trigger") {
      // Match keywords in message body
      const keywords = rule.name?.toLowerCase().split("|") || []
      const message = context.messageBody.toLowerCase()
      return keywords.some((kw) => message.includes(kw.trim()))
    }

    if (triggerType === "pattern" || triggerType === "intent_based") {
      // Regex pattern matching
      try {
        const regex = new RegExp(rule.name || "", "i")
        return regex.test(context.messageBody)
      } catch {
        return false
      }
    }

    if (triggerType === "contact" || triggerType === "contact_based") {
      // Contact-specific routing
      return context.senderPhone === rule.name
    }

    return false
  } catch (error) {
    console.error("[v0] Error matching rule:", error)
    return false
  }
}

export async function createRoutingRule(
  projectId: string,
  pattern: string,
  flowType: string,
  targetFlow: string
): Promise<{ success: boolean; ruleId?: string; error?: string }> {
  try {
    const admin = createSupabaseAdminClient()

    const { data, error } = await admin
      .from("workflows")
      .insert({
        project_id: projectId,
        name: pattern,
        trigger_type: flowType,
        is_active: true,
        description: `Routing rule: ${pattern} -> ${targetFlow}`,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, ruleId: data.id }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg }
  }
}

export async function updateRoutingRule(
  ruleId: string,
  updates: Partial<RoutingRule>
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createSupabaseAdminClient()

    const { error } = await admin.from("workflows").update(updates).eq("id", ruleId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg }
  }
}

export async function deleteRoutingRule(ruleId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createSupabaseAdminClient()

    const { error } = await admin.from("workflows").delete().eq("id", ruleId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg }
  }
}
