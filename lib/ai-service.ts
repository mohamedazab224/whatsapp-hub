import { getSupabaseAdmin } from "./supabase"
import { generateText } from "ai"

export class AIService {
  private projectId: string
  private config: any

  constructor(projectId: string, config: any) {
    this.projectId = projectId
    this.config = config
  }

  static async fromProjectId(projectId: string) {
    const supabase = getSupabaseAdmin()
    const { data: config } = await supabase.from("ai_configurations").select("*").eq("project_id", projectId).single()

    if (!config || !config.is_active) return null

    return new AIService(projectId, config)
  }

  async generateResponse(messages: { role: "user" | "assistant"; content: string }[]) {
    try {
      const provider = this.config.provider || "openai"
      const modelName = this.config.model || "gpt-4o-mini"

      // Ensure we use the correct AI SDK provider format
      const { text } = await generateText({
        model: `${provider}:${modelName}` as any, // Standard AI SDK format
        system: this.config.system_prompt || "أنت مساعد ذكي لشركة العزب، رد بلباقة واحترافية.",
        messages: messages,
      })

      return text
    } catch (error) {
      console.error("[app] AI Processing Error:", error)
      return "عذراً، أواجه مشكلة تقنية حالياً. سأرد عليك في أقرب وقت ممكن."
    }
  }
}
