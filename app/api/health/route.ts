import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const timestamp = new Date().toISOString()

    // Try to check database health
    const { error } = await supabase.from("projects").select("id", { head: true, count: "exact" })

    if (error) {
      // If no Supabase configured, return partial health
      if (error.message?.includes("Missing") || error.message?.includes("undefined")) {
        logger.warn("Supabase not configured, returning partial health status")
        return NextResponse.json({ status: "ok", supabase: "not-configured", timestamp })
      }
      logger.error("Health check failed", { error })
      return NextResponse.json({ status: "error", supabase: "error", timestamp }, { status: 503 })
    }

    return NextResponse.json({ status: "ok", supabase: "connected", timestamp })
  } catch (error) {
    const timestamp = new Date().toISOString()
    logger.error("Health check error", { error })
    // Return partial health on error
    return NextResponse.json({ status: "ok", supabase: "error", timestamp })
  }
}
