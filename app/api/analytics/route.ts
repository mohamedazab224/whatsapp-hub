import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logError, logInfo, logWarn, UnauthorizedError } from "@/lib/errors"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") || "7")
    
    logInfo("API:GET /api/analytics", `Fetching analytics for ${days} days`)
    
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      logWarn("API:GET /api/analytics", "Unauthorized access")
      throw new UnauthorizedError()
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get daily message counts
    const { data: dailyMessages, error: messagesError } = await supabase
      .from("messages")
      .select("direction, timestamp")
      .eq("project_id", user.id)
      .gte("timestamp", startDate.toISOString())
      .lte("timestamp", endDate.toISOString())

    if (messagesError) throw messagesError

    // Group by date and direction
    const messagesByDate: Record<string, { inbound: number; outbound: number }> = {}
    
    dailyMessages?.forEach((msg: any) => {
      const date = new Date(msg.timestamp).toISOString().split('T')[0]
      if (!messagesByDate[date]) {
        messagesByDate[date] = { inbound: 0, outbound: 0 }
      }
      if (msg.direction === 'inbound') {
        messagesByDate[date].inbound++
      } else {
        messagesByDate[date].outbound++
      }
    })

    // Format for chart
    const chartData = Object.entries(messagesByDate).map(([date, counts]) => ({
      date,
      inbound: counts.inbound,
      outbound: counts.outbound,
    }))

    logInfo("API:GET /api/analytics", `Retrieved ${chartData.length} data points`)

    return NextResponse.json({
      chartData,
      summary: {
        totalInbound: dailyMessages?.filter((m: any) => m.direction === 'inbound').length || 0,
        totalOutbound: dailyMessages?.filter((m: any) => m.direction === 'outbound').length || 0,
      },
    })
  } catch (error) {
    logError("API:GET /api/analytics", error)
    
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
