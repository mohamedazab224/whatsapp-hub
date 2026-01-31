import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { logger } from "@/lib/logger"

export async function POST(request: Request) {
  const payload = await request.json()
  const supabase = getSupabaseAdmin()

  const { error } = await supabase.from("ai_configurations").upsert(
    {
      project_id: payload.projectId,
      provider: payload.provider,
      model: payload.model,
      system_prompt: payload.system_prompt,
      temperature: payload.temperature,
      max_tokens: payload.max_tokens,
      timeout_ms: payload.timeout_ms,
      is_active: payload.is_active,
    },
    { onConflict: "project_id" },
  )

  if (error) {
    logger.error("Failed to update AI configuration", { error, projectId: payload.projectId })
    return new Response("Failed to update AI configuration", { status: 500 })
  }

  return NextResponse.json({ status: "ok" })
}
