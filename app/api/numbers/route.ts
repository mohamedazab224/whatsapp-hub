import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logError, logInfo, logWarn, UnauthorizedError, ValidationError } from "@/lib/errors"
import { handleSupabaseError } from "@/lib/supabase/error-handler"

export async function GET() {
  try {
    logInfo("API:GET /api/numbers", "Fetching numbers")
    
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      logWarn("API:GET /api/numbers", "Unauthorized access")
      throw new UnauthorizedError()
    }

    // Get the user's project ID
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("owner_email", user.email || "")
      .maybeSingle()

    if (projectError || !project) {
      logError("API:GET /api/numbers", projectError || "No project found")
      throw projectError || new Error("No project found for user")
    }

    const { data: numbers, error: numbersError } = await supabase
      .from("whatsapp_numbers")
      .select("id, phone_number, name, status, type")
      .eq("project_id", project.id)

    const { count: totalNumbers, error: countError } = await supabase
      .from("whatsapp_numbers")
      .select("*", { count: "exact", head: true })
      .eq("project_id", project.id)

    if (numbersError) {
      logError("API:GET /api/numbers", numbersError)
      throw numbersError
    }

    if (countError) {
      logError("API:GET /api/numbers", countError)
      throw countError
    }

    logInfo("API:GET /api/numbers", `Retrieved ${numbers?.length || 0} numbers`)

    return NextResponse.json({
      numbers,
      total: totalNumbers,
    })
  } catch (error) {
    logError("API:GET /api/numbers", error)
    
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    const errorMsg = error instanceof Error ? error.message : handleSupabaseError(error, "GET /api/numbers")
    return NextResponse.json(
      { error: errorMsg || "Failed to fetch numbers" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validation
    if (!body.phone_number || !body.name) {
      throw new ValidationError("Phone number and name are required")
    }

    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new UnauthorizedError()
    }

    // Get the user's project ID
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("owner_email", user.email || "")
      .maybeSingle()

    if (projectError || !project) {
      logError("API:POST /api/numbers", projectError || "No project found")
      throw projectError || new Error("No project found for user")
    }

    logInfo("API:POST /api/numbers", `Adding number for user ${user.id}`)

    const { data, error } = await supabase
      .from("whatsapp_numbers")
      .insert({
        project_id: project.id,
        phone_number: body.phone_number,
        name: body.name,
        status: "pending",
        type: body.type || "connected",
      })
      .select()

    if (error) {
      logError("API:POST /api/numbers", error)
      throw error
    }

    logInfo("API:POST /api/numbers", "Number added successfully")

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    logError("API:POST /api/numbers", error)
    
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    const errorMsg = error instanceof Error ? error.message : handleSupabaseError(error, "POST /api/numbers")
    return NextResponse.json(
      { error: errorMsg || "Failed to add number" },
      { status: 500 }
    )
  }
}

