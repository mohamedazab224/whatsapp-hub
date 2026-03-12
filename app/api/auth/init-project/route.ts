import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { seedWhatsAppNumbers, seedMessageTemplates } from "@/lib/meta/seed"

interface Project {
  id: string
  owner_id: string
  name: string
  created_at: string
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const admin = createSupabaseAdminClient()

    // Check if user already has a project
    const { data: existing, error: checkError } = await admin
      .from("projects")
      .select("id, owner_id, name, created_at")
      .eq("owner_id", userId)
      .maybeSingle() as { data: Project | null; error: any }

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("[v0] Project check failed:", checkError)
      return NextResponse.json({ error: "Failed to check project" }, { status: 500 })
    }

    if (existing) {
      console.log("[v0] User already has project:", existing.id)
      return NextResponse.json({
        success: true,
        project: { id: existing.id },
      })
    }

    // Create default project
    const { data: newProject, error: createError } = await admin
      .from("projects")
      .insert({
        owner_id: userId,
        name: "My First Project",
        description: "Default project created on first login",
      })
      .select("id")
      .single() as { data: { id: string } | null; error: any }

    if (createError) {
      console.error("[v0] Project creation failed:", createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    const newProjectId = newProject?.id
    console.log("[v0] Project created:", newProjectId)

    // Seed Meta data for the project
    if (newProjectId) {
      try {
        const numbersResult = await seedWhatsAppNumbers(newProjectId)
        const templatesResult = await seedMessageTemplates(newProjectId)
        console.log("[v0] Meta data seeded - Numbers:", numbersResult.count, "Templates:", templatesResult.count)
      } catch (seedError) {
        console.warn("[v0] Meta data seeding warning:", seedError)
      }
    }

    return NextResponse.json({
      success: true,
      project: { id: newProjectId },
    })
  } catch (error) {
    console.error("[v0] Project initialization error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
