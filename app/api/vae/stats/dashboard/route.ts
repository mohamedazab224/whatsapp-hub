import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"
import type { DashboardStats } from "@/lib/types/vae"

export async function GET(request: NextRequest) {
  try {
    const siteId = request.nextUrl.searchParams.get("site_id")

    if (!siteId) {
      return NextResponse.json({ error: "Missing site_id" }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()

    // الحصول على إجمالي الميديا
    const { count: totalMedia } = await supabase
      .from("vae_media")
      .select("*", { count: "exact" })
      .eq("site_id", siteId)

    // الحصول على متوسط جودة الصور
    const { data: qualityData } = await supabase
      .from("vae_ai_analysis")
      .select("quality_score")
      .eq("media_id", (await supabase.from("vae_media").select("id").eq("site_id", siteId)).data?.[0]?.id)

    const averageQuality =
      qualityData && qualityData.length > 0
        ? qualityData.reduce((sum, item) => sum + (item.quality_score || 0), 0) / qualityData.length
        : 0

    // الحصول على عدد المواقع النشطة
    const { count: activeSites } = await supabase
      .from("vae_sites")
      .select("*", { count: "exact" })
      .eq("status", "active")

    // الحصول على المهام المكتملة
    const { count: completedTasks } = await supabase
      .from("vae_work_items")
      .select("*", { count: "exact" })
      .eq("status", "completed")
      .eq("site_id", siteId)

    // عدد حوادث الهدر
    const { count: wasteIncidents } = await supabase
      .from("vae_ai_analysis")
      .select("*", { count: "exact" })
      .eq("waste_detected", true)

    // عدد مشاكل السلامة
    const { data: safetyData } = await supabase
      .from("vae_ai_analysis")
      .select("safety_issues")
      .not("safety_issues", "is", null)

    const safetyIncidents = safetyData ? safetyData.filter((item) => item.safety_issues?.length).length : 0

    // متوسط التقدم اليومي
    const { data: progressData } = await supabase
      .from("vae_ai_analysis")
      .select("estimated_progress")
      .eq("media_id", (await supabase.from("vae_media").select("id").eq("site_id", siteId)).data?.[0]?.id)

    const dailyProgress =
      progressData && progressData.length > 0
        ? progressData.reduce((sum, item) => sum + (item.estimated_progress || 0), 0) / progressData.length
        : 0

    const stats: DashboardStats = {
      total_media: totalMedia || 0,
      average_quality: Math.round(averageQuality * 100) / 100,
      sites_active: activeSites || 0,
      tasks_completed: completedTasks || 0,
      waste_incidents: wasteIncidents || 0,
      safety_incidents: safetyIncidents,
      daily_progress_percent: Math.round(dailyProgress * 100) / 100,
    }

    logger.info("Dashboard stats retrieved", { site_id: siteId, stats })

    return NextResponse.json(stats)
  } catch (error) {
    logger.error("Error retrieving dashboard stats", { error })
    return NextResponse.json({ error: "Failed to retrieve stats" }, { status: 500 })
  }
}
