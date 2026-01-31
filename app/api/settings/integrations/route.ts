import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { logger } from "@/lib/logger"

export async function POST(request: Request) {
  const payload = await request.json()
  const supabase = getSupabaseAdmin()

  const integrations = Array.isArray(payload.integrations) ? payload.integrations : []
  const projectId = payload.projectId as string

  for (const integration of integrations) {
    const { error } = await supabase.from("integrations").upsert(
      {
        project_id: projectId,
        type: integration.type,
        is_active: integration.is_active,
        config: {
          api_url: integration.api_url,
          api_key: integration.api_key,
        },
      },
      { onConflict: "project_id,type" },
    )

    if (error) {
      logger.error("Failed to update integration", { error, projectId, type: integration.type })
      return new Response("Failed to update integrations", { status: 500 })
    }
  }

  return NextResponse.json({ status: "ok" })
}
