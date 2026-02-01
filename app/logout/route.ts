import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { getPublicEnv } from "@/lib/env.public"

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url))
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

  await supabase.auth.signOut()
  return response
}
