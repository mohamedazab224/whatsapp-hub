import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logError, logInfo, logWarn, UnauthorizedError } from "@/lib/errors"

export async function GET() {
  try {
    logInfo("API:GET /api/stats", "Fetching dashboard statistics")
    
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      logWarn("API:GET /api/stats", "Unauthorized access")
      throw new UnauthorizedError()
    }

    // Get user's project by email
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("owner_email", user.email || "")
      .maybeSingle()

    if (projectError || !project) {
      logWarn("API:GET /api/stats", "Project not found")
      return NextResponse.json({ 
        stats: { contacts: 0, messages: 0, numbers: 0 } 
      })
    }

    // Get dashboard stats
    const [contactsResult, messagesResult, numbersResult] = await Promise.all([
      supabase.from("contacts").select("*", { count: "exact", head: true }).eq("project_id", project.id),
      supabase.from("messages").select("*", { count: "exact", head: true }).eq("project_id", project.id),
      supabase.from("whatsapp_numbers").select("*", { count: "exact", head: true }).eq("project_id", project.id),
    ])

    const stats = {
      contacts: contactsResult.count || 0,
      messages: messagesResult.count || 0,
      numbers: numbersResult.count || 0,
    }

    logInfo("API:GET /api/stats", `Stats retrieved: ${JSON.stringify(stats)}`)

    return NextResponse.json({ stats })
  } catch (error) {
    logError("API:GET /api/stats", error)
    
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
