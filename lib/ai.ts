import { generateText } from "ai"
import { supabase } from "./supabase"

/**
 * Generates an AI response for a specific project based on its configuration
 */
export async function generateAIResponse(projectId: string, userMessage: string) {
  try {
    // 1. Fetch AI Configuration for the project
    const { data: config, error } = await supabase
      .from("ai_configurations")
      .select("*")
      .eq("project_id", projectId)
      .single()

    if (error || !config || !config.is_enabled) {
      console.log("[app] AI disabled or config not found for project:", projectId)
      return null
    }

    // 2. Map provider/model strings to AI Gateway format
    // Default to openai/gpt-4o if not specified
    const modelString = `${config.provider}/${config.model}`

    // 3. Generate response using AI SDK
    const { text } = await generateText({
      model: modelString as any, // AI SDK handles providers via model string
      system: config.system_prompt,
      prompt: userMessage,
      temperature: config.temperature,
    })

    return text
  } catch (error) {
    console.error("[app] Error generating AI response:", error)
    return null
  }
}
