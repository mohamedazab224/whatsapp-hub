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
      .limit(1)
      .single()

    if (projectError) {
      logError("API:GET /api/project/check", projectError)
      return NextResponse.json({ hasProject: false, error: projectError.message }, { status: 500 })
    }

    const projectData = project as unknown as { id: string; name: string } | null
    logInfo("API:GET /api/project/check", projectData ? "Project found" : "No project found")

    return NextResponse.json({
      hasProject: !!projectData,
      projectId: projectData?.id,
      projectName: projectData?.name,
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
