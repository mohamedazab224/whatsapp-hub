import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logError, logInfo, logWarn, UnauthorizedError, ValidationError } from "@/lib/errors"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    
    logInfo("API:GET /api/flows", "Fetching WhatsApp flows")
    
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      logWarn("API:GET /api/flows", "Unauthorized access")
      throw new UnauthorizedError()
    }

    // Get flows from workflows table
    let query = supabase
      .from("workflows")
      .select("*")
      .eq("project_id", user.id)

    if (search) {
      query = query.ilike("name", `%${search}%`)
    }

    const { data: flows, error: flowsError } = await query.order("created_at", { ascending: false })

    const { count: totalFlows } = await supabase
      .from("workflows")
      .select("*", { count: "exact", head: true })
      .eq("project_id", user.id)

    if (flowsError) throw flowsError

    logInfo("API:GET /api/flows", `Retrieved ${flows?.length || 0} flows`)

    return NextResponse.json({
      flows: flows || [],
      total: totalFlows || 0,
    })
  } catch (error) {
    logError("API:GET /api/flows", error)
    
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    
    return NextResponse.json(
      { error: "Failed to fetch flows" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validation
    if (!body.name) {
      throw new ValidationError("Flow name is required")
    }

    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new UnauthorizedError()
    }

    logInfo("API:POST /api/flows", `Creating flow for user ${user.id}`)

    const { data, error } = await supabase
      .from("workflows")
      .insert({
        project_id: user.id,
        name: body.name,
        is_active: body.is_active ?? true,
        ai_enabled: body.ai_enabled ?? false,
        is_default: body.is_default ?? false,
      })
      .select()

    if (error) throw error

    logInfo("API:POST /api/flows", "Flow created successfully")

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    logError("API:POST /api/flows", error)
    
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    
    return NextResponse.json(
      { error: "Failed to create flow" },
      { status: 500 }
    )
  }
}
