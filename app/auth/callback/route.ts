import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { getPublicEnv } from "@/lib/env.public"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=missing_code`, request.url))
  }

  const response = NextResponse.redirect(new URL(next, request.url))
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getPublicEnv()

  const supabase = createServerClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(new URL(`/login?error=oauth_failed`, request.url))
  }

  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.redirect(new URL(`/login?error=user_not_found`, request.url))
  }

  console.log("[v0] Auth callback - User:", user.id)

  // Use admin client for project creation (has permission to create)
  const adminClient = createSupabaseAdminClient()

  // Check if user has a project
  const { data: existingProject, error: checkError } = await adminClient
    .from("projects")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (checkError) {
    console.error("[v0] Error checking project:", checkError)
  }

  if (!existingProject) {
    // Create a default project for the user using admin client
    console.log("[v0] Creating default project for user:", user.id)
    const { data: newProject, error: projectError } = await adminClient
      .from("projects")
      .insert({
        owner_id: user.id,
        name: "My Project",
        description: "Default project created on first login",
      })
      .select()
      .single()

    if (projectError) {
      console.error("[v0] Failed to create project:", projectError)
    } else {
      console.log("[v0] Project created successfully:", newProject?.id)
    }
  } else {
    console.log("[v0] User already has a project:", existingProject.id)
  }

  return response
}


