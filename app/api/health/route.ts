import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { logger } from "@/lib/logger"

export async function GET() {
  const supabase = getSupabaseAdmin()
  const timestamp = new Date().toISOString()

  const { error } = await supabase.from("projects").select("id", { head: true, count: "exact" })

  if (error) {
    logger.error("Health check failed", { error })
    return NextResponse.json({ status: "error", supabase: "error", timestamp }, { status: 503 })
  }

  return NextResponse.json({ status: "ok", supabase: "connected", timestamp })
}
