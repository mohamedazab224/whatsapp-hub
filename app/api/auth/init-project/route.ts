import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { seedWhatsAppNumbers, seedMessageTemplates } from "@/lib/meta/seed"

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const admin = createSupabaseAdminClient()

    // Check if user already has a project
    const { data: existing } = await admin
      .from("projects")
      .select("id")
      .eq("owner_id", userId)
      .maybeSingle()

    let projectId = existing?.id

    if (!existing) {
      // Create default project
      const { data: newProject, error: createError } = await admin
        .from("projects")
        .insert({
          owner_id: userId,
          name: "My First Project",
          description: "Default project created on first login",
        })
        .select()
        .single()

      if (createError) {
        console.error("[v0] Project creation failed:", createError)
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }

      projectId = newProject?.id
      console.log("[v0] Project created:", projectId)
    } else {
      console.log("[v0] User already has project:", projectId)
    }

    // Seed Meta data for the project
    if (projectId) {
      try {
        const numbersResult = await seedWhatsAppNumbers(projectId)
        const templatesResult = await seedMessageTemplates(projectId)
        console.log("[v0] Meta data seeded - Numbers:", numbersResult.count, "Templates:", templatesResult.count)
      } catch (seedError) {
        console.warn("[v0] Meta data seeding warning:", seedError)
        // Don't fail if seeding fails, project is still created
      }
    }

    return NextResponse.json({
      success: true,
      project: {
        id: projectId,
      },
    })
  } catch (error) {
    console.error("[v0] Project initialization error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
