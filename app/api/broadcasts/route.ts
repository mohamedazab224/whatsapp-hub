import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let query = supabase
      .from("broadcasts")
      .select(`
        *,
        template:message_templates(id, name),
        creator:users!broadcasts_created_by_fkey(id, full_name)
      `)
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: broadcasts, error, count } = await query.range(from, to)

    if (error) throw error

    return NextResponse.json({
      broadcasts: broadcasts || [],
      total: count || 0,
      page,
      limit,
    })
  } catch (error) {
    console.error("[v0] Error fetching broadcasts:", error)
    return NextResponse.json(
      { error: "Failed to fetch broadcasts" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from("broadcasts")
      .insert({
        project_id: body.project_id,
        name: body.name,
        message_template_id: body.template_id,
        status: "draft",
        created_by: user.id,
      })
      .select("id")
      .single()

    if (error || !data) throw error || new Error("Failed to create broadcast")

    // إضافة المستلمين
    if (body.recipients && body.recipients.length > 0 && data && typeof data === "object" && "id" in data) {
      const broadcastId = (data as { id: string }).id
      const recipients = body.recipients.map((contact_id: string) => ({
        broadcast_id: broadcastId,
        contact_id,
        status: "pending",
      }))

      const { error: recipientsError } = await supabase
        .from("broadcast_recipients")
        .insert(recipients)

      if (recipientsError) throw recipientsError

      // تحديث إجمالي المستلمين
      await supabase
        .from("broadcasts")
        .update({ total_recipients: body.recipients.length })
        .eq("id", broadcastId)
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating broadcast:", error)
    return NextResponse.json(
      { error: "Failed to create broadcast" },
      { status: 500 }
    )
  }
}
