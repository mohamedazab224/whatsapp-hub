import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"
import type { VAEReport } from "@/lib/types/vae"

export async function GET(request: NextRequest) {
  try {
    const siteId = request.nextUrl.searchParams.get("site_id")
    const reportType = request.nextUrl.searchParams.get("type") || "daily"
    const reportDate = request.nextUrl.searchParams.get("date") || new Date().toISOString().split("T")[0]

    if (!siteId) {
      return NextResponse.json({ error: "Missing site_id" }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()

    // جلب الميديا للفترة المطلوبة
    const startDate = getDateRange(reportType, new Date(reportDate)).start
    const endDate = getDateRange(reportType, new Date(reportDate)).end

    const { data: mediaData } = await supabase
      .from("vae_media")
      .select("*, vae_ai_analysis(*)")
      .eq("site_id", siteId)
      .gte("capture_time", startDate.toISOString())
      .lte("capture_time", endDate.toISOString())

    // حساب الإحصائيات
    const statistics = calculateStatistics(mediaData || [])

    // جلب أو إنشاء التقرير
    const { data: existingReport } = await supabase
      .from("vae_reports")
      .select("*")
      .eq("site_id", siteId)
      .eq("report_type", reportType)
      .eq("report_date", reportDate)
      .single()

    let report: VAEReport

    if (existingReport) {
      // تحديث التقرير الموجود
      const { data: updatedReport } = await supabase
        .from("vae_reports")
        .update({
          statistics,
          media_count: mediaData?.length || 0,
          average_quality_score: statistics.averageQuality,
          progress_summary: generateProgressSummary(statistics),
        })
        .eq("id", existingReport.id)
        .select()
        .single()

      report = updatedReport as VAEReport
    } else {
      // إنشاء تقرير جديد
      const { data: newReport } = await supabase
        .from("vae_reports")
        .insert({
          site_id: siteId,
          report_type: reportType,
          report_date: reportDate,
          statistics,
          media_count: mediaData?.length || 0,
          average_quality_score: statistics.averageQuality,
          progress_summary: generateProgressSummary(statistics),
        })
        .select()
        .single()

      report = newReport as VAEReport
    }

    logger.info("Report generated", { site_id: siteId, report_type: reportType })

    return NextResponse.json(report)
  } catch (error) {
    logger.error("Error generating report", { error })
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}

function getDateRange(reportType: string, baseDate: Date) {
  const start = new Date(baseDate)
  const end = new Date(baseDate)

  switch (reportType) {
    case "daily":
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case "weekly":
      const day = start.getDay()
      const diff = start.getDate() - day
      start.setDate(diff)
      start.setHours(0, 0, 0, 0)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      break
    case "monthly":
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(end.getMonth() + 1)
      end.setDate(0)
      end.setHours(23, 59, 59, 999)
      break
  }

  return { start, end }
}

function calculateStatistics(mediaData: any[]) {
  const analyses = mediaData.filter((m) => m.vae_ai_analysis && m.vae_ai_analysis.length > 0)

  const qualityScores = analyses.flatMap((m) => m.vae_ai_analysis.map((a: any) => a.quality_score || 0))
  const averageQuality = qualityScores.length > 0 ? qualityScores.reduce((a, b) => a + b) / qualityScores.length : 0

  const wasteDetected = analyses.filter((m) => m.vae_ai_analysis.some((a: any) => a.waste_detected))
  const safetyIssues = analyses.flatMap((m) => m.vae_ai_analysis.flatMap((a: any) => a.safety_issues || []))

  const progressValues = analyses.flatMap((m) => m.vae_ai_analysis.map((a: any) => a.estimated_progress || 0))
  const averageProgress = progressValues.length > 0 ? progressValues.reduce((a, b) => a + b) / progressValues.length : 0

  return {
    totalMedia: mediaData.length,
    analyzedMedia: analyses.length,
    averageQuality: Math.round(averageQuality * 100) / 100,
    wasteIncidents: wasteDetected.length,
    safetyIssues: safetyIssues.length,
    averageProgress: Math.round(averageProgress * 100) / 100,
    quality_distribution: {
      excellent: qualityScores.filter((q) => q >= 80).length,
      good: qualityScores.filter((q) => q >= 60 && q < 80).length,
      fair: qualityScores.filter((q) => q < 60).length,
    },
  }
}

function generateProgressSummary(statistics: any): string {
  const { averageQuality, wasteIncidents, safetyIssues, averageProgress } = statistics

  const qualityStatus = averageQuality >= 80 ? "ممتاز" : averageQuality >= 60 ? "جيد" : "يحتاج تحسين"
  const safetyStatus = safetyIssues === 0 ? "آمن" : `${safetyIssues} مشكلة أمان`
  const wasteStatus = wasteIncidents === 0 ? "لا يوجد هدر" : `${wasteIncidents} حادثة هدر`

  return `جودة الصور: ${qualityStatus} | الأمان: ${safetyStatus} | الهدر: ${wasteStatus} | التقدم: ${averageProgress}%`
}
