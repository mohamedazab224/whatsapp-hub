import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { logError, logInfo } from "@/lib/errors"

/**
 * Initialize user's project with WhatsApp data
 * POST /api/init/setup
 * Body: { meta_data: {...} }
 */
export async function POST(request: NextRequest) {
  try {
    logInfo("API:POST /api/init/setup", "Starting project initialization")

    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      logError("API:POST /api/init/setup", "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { meta_data } = body

    if (!meta_data) {
      return NextResponse.json(
        { error: "meta_data is required" },
        { status: 400 }
      )
    }

    // 1. Create project if it doesn't exist
    const { data: existingProject } = await supabase
      .from("projects")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()

    let projectId: string
    const existingProjectData = existingProject as unknown as { id: string } | null

    if (existingProjectData) {
      projectId = existingProjectData.id
      logInfo("API:POST /api/init/setup", `Using existing project: ${projectId}`)
    } else {
      const { data: newProject, error: projectError } = await supabase
        .from("projects")
        .insert({
          owner_id: user.id,
          name: `${meta_data.business?.name || "My"} WhatsApp Hub`,
          description: "Auto-initialized from Meta data",
        })
        .select("id")
        .single()

      if (projectError || !newProject) {
        logError("API:POST /api/init/setup", projectError || "Failed to create project")
        throw projectError || new Error("Failed to create project")
      }

      const newProjectData = newProject as unknown as { id: string }
      projectId = newProjectData.id
      logInfo("API:POST /api/init/setup", `Created new project: ${projectId}`)
    }

    // 2. Import WhatsApp numbers from WABAs
    let numbersCount = 0
    if (meta_data.wabas && Array.isArray(meta_data.wabas)) {
      for (const waba of meta_data.wabas) {
        if (waba.phones && Array.isArray(waba.phones)) {
          for (const phone of waba.phones) {
            const { error: numberError } = await supabase
              .from("whatsapp_numbers")
              .upsert(
                {
                  project_id: projectId,
                  phone_number_id: phone.id,
                  display_phone_number: phone.display_phone_number,
                  verified_name: phone.verified_name || phone.display_phone_number,
                  quality_rating: phone.quality_rating || "UNKNOWN",
                  is_active: phone.status === "CONNECTED",
                },
                { onConflict: "phone_number_id" }
              )

            if (!numberError) {
              numbersCount++
            }
          }
        }

        // Import templates
        if (waba.templates && Array.isArray(waba.templates)) {
          for (const template of waba.templates) {
            await supabase.from("whatsapp_templates").upsert(
              {
                whatsapp_template_name: template.name,
                language: template.language || "en",
                category: template.category || "MARKETING",
                status: template.status || "PENDING",
                components: template.components || [],
              },
              { onConflict: "whatsapp_template_name" }
            )
          }
        }
      }
    }

    logInfo("API:POST /api/init/setup", `Imported ${numbersCount} WhatsApp numbers`)

    return NextResponse.json({
      success: true,
      projectId,
      numbersImported: numbersCount,
      message: "Project initialized successfully",
    })
  } catch (error) {
    logError("API:POST /api/init/setup", error)

    const errorMsg = error instanceof Error ? error.message : "Failed to initialize project"
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    )
  }
}
