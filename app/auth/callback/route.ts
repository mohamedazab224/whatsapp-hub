import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
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

  try {
    const admin = createSupabaseAdminClient()

    // Step 1: Ensure user exists in users table
    const { data: existingUser, error: checkError } = await admin
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle()

    if (!existingUser) {
      // Create user in users table
      const { error: createUserError } = await admin
        .from("users")
        .insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          avatar_url: user.user_metadata?.avatar_url || null,
        })

      if (createUserError) {
        console.error("[v0] Failed to create user record:", createUserError)
        return NextResponse.redirect(new URL(`/login?error=user_creation_failed`, request.url))
      }
      console.log("[v0] User record created")
    } else {
      console.log("[v0] User record already exists")
    }

    // Step 2: Create default project for user
    const { data: existingProject } = await admin
      .from("projects")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()

    if (!existingProject) {
      const { data: newProject, error: projectError } = await admin
        .from("projects")
        .insert({
          owner_id: user.id,
          name: "My First Project",
          description: "Default project created on first login",
        })
        .select("id")
        .single() as { data: { id: string } | null; error: any }

      if (projectError) {
        console.error("[v0] Failed to create project:", projectError)
        // Don't fail auth if project creation fails - user can still login
      } else {
        console.log("[v0] Project created:", newProject?.id)
      }
    } else {
      console.log("[v0] Project already exists")
    }
  } catch (error) {
    console.error("[v0] Auth setup error:", error)
    // Don't fail auth callback even if setup fails
  }

  return response
}

