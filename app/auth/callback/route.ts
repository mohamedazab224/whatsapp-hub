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

  // Initialize project for user by calling the init-project API
  try {
    const initResponse = await fetch(
      new URL("/api/auth/init-project", request.url),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      }
    )

    if (initResponse.ok) {
      const result = await initResponse.json()
      console.log("[v0] Project initialized:", result.project?.id)
    } else {
      const error = await initResponse.json()
      console.error("[v0] Failed to initialize project:", error)
    }
  } catch (error) {
    console.error("[v0] Project initialization error:", error)
  }

  return response
}


