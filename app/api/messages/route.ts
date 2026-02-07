import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logError, logInfo, logWarn, UnauthorizedError, ValidationError } from "@/lib/errors"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get("contact_id")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    
    logInfo("API:GET /api/messages", "Fetching messages")
    
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      logWarn("API:GET /api/messages", "Unauthorized access")
      throw new UnauthorizedError()
    }

    let query = supabase
      .from("messages")
      .select("*, contacts(name, wa_id), media_files(public_url, mime_type)")
      .eq("project_id", user.id)

    if (contactId) {
      query = query.eq("contact_id", contactId)
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: messages, error: messagesError } = await query
      .order("timestamp", { ascending: false })
      .range(from, to)

    const { count: totalMessages } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("project_id", user.id)

    if (messagesError) throw messagesError

    logInfo("API:GET /api/messages", `Retrieved ${messages?.length || 0} messages`)

    return NextResponse.json({
      messages: messages || [],
      total: totalMessages || 0,
      page,
      limit,
      totalPages: Math.ceil((totalMessages || 0) / limit),
    })
  } catch (error) {
    logError("API:GET /api/messages", error)
    
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validation
    if (!body.contact_id || !body.body) {
      throw new ValidationError("Contact ID and message body are required")
    }

    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new UnauthorizedError()
    }

    logInfo("API:POST /api/messages", `Creating message for user ${user.id}`)

    const { data, error } = await supabase
      .from("messages")
      .insert({
        project_id: user.id,
        contact_id: body.contact_id,
        whatsapp_number_id: body.whatsapp_number_id,
        to_phone_id: body.to_phone_id,
        from_phone_id: body.from_phone_id,
        body: body.body,
        type: body.type || "text",
        direction: "outbound",
        status: "pending",
      })
      .select()

    if (error) throw error

    logInfo("API:POST /api/messages", "Message created successfully")

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    logError("API:POST /api/messages", error)
    
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    )
  }
}

