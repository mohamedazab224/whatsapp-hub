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
    const conversationId = request.nextUrl.searchParams.get("conversationId")
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50")
    const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0")

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      )
    }

    let query = supabase
      .from("messages")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })

    if (conversationId) {
      const { data: conversation } = await supabase
        .from("conversations")
        .select("contact_id")
        .eq("id", conversationId)
        .single()

      if (conversation) {
        query = query.eq("contact_id", conversation.contact_id)
      }
    }

    const { data: messages, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      messages: messages || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}
