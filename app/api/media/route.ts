import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logError, logInfo, logWarn, UnauthorizedError } from "@/lib/errors"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "all"
    const contactId = searchParams.get("contact_id")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    
    logInfo("API:GET /api/media", `Fetching media files - period: ${period}`)
    
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      logWarn("API:GET /api/media", "Unauthorized access")
      throw new UnauthorizedError()
    }

    let query = supabase
      .from("media_files")
      .select("*, contacts(name, wa_id), messages(body, timestamp)")
      .eq("project_id", user.id)

    // Filter by time period
    if (period !== "all") {
      const now = new Date()
      let startDate: Date

      switch (period) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7))
          break
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1))
          break
        default:
          startDate = new Date(0)
      }

      query = query.gte("created_at", startDate.toISOString())
    }

    // Filter by contact
    if (contactId) {
      query = query.eq("contact_id", contactId)
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: mediaFiles, error: mediaError } = await query
      .order("created_at", { ascending: false })
      .range(from, to)

    const { count: totalMedia } = await supabase
      .from("media_files")
      .select("*", { count: "exact", head: true })
      .eq("project_id", user.id)

    if (mediaError) throw mediaError

    logInfo("API:GET /api/media", `Retrieved ${mediaFiles?.length || 0} media files`)

    return NextResponse.json({
      media: mediaFiles || [],
      total: totalMedia || 0,
      page,
      limit,
      totalPages: Math.ceil((totalMedia || 0) / limit),
    })
  } catch (error) {
    logError("API:GET /api/media", error)
    
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    
    return NextResponse.json(
      { error: "Failed to fetch media files" },
      { status: 500 }
    )
  }
}
