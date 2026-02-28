import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { getPublicEnv } from "@/lib/env.public"

const DEMO_EMAIL = "demo@alazab.com"
const DEMO_PASSWORD = "Demo@12345678"

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true, redirectTo: "/" })
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

    // تسجيل دخول المستخدم التجريبي
    const { error } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return response
  } catch (err) {
    console.error("[v0] Demo login error:", err)
    return NextResponse.json({ error: "Failed to login with demo account" }, { status: 500 })
  }
}
