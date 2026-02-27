import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
})

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get("projectId")
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50")
    const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0")

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      )
    }

    // جلب المحادثات مع معلومات جهات الاتصال
    const { data: conversations, error: convError, count } = await supabase
      .from("conversations")
      .select(
        `
        *,
        contacts:contact_id(
          id,
          wa_id,
          name,
          profile_picture_url,
          last_message_at
        )
      `
      )
      .eq("project_id", projectId)
      .order("last_message_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (convError) {
      return NextResponse.json({ error: convError.message }, { status: 500 })
    }

    return NextResponse.json({
      conversations: conversations || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}
