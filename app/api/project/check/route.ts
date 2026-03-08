import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logInfo, logError } from "@/lib/errors"

/**
 * Check if user has a project
 * GET /api/project/check
 */
export async function GET() {
  try {
    logInfo("API:GET /api/project/check", "Checking user project")

    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      logInfo("API:GET /api/project/check", "User not authenticated")
      return NextResponse.json({ hasProject: false, authenticated: false })
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, name")
      .eq("owner_id", user.id)
      .maybeSingle()

    if (projectError) {
      logError("API:GET /api/project/check", projectError)
      return NextResponse.json({ hasProject: false, error: projectError.message }, { status: 500 })
    }

    logInfo("API:GET /api/project/check", project ? "Project found" : "No project found")

    return NextResponse.json({
      hasProject: !!project,
      projectId: project?.id,
      projectName: project?.name,
      authenticated: true,
    })
  } catch (error) {
    logError("API:GET /api/project/check", error)
    return NextResponse.json(
      { hasProject: false, error: "Server error" },
      { status: 500 }
    )
  }
}
