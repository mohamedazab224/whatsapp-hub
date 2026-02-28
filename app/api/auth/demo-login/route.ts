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

    // محاولة تسجيل دخول المستخدم التجريبي
    let { error, data } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    })

    // إذا كان الحساب غير موجود، حاول إنشاء حساب جديد
    if (error && (error.message.includes("Invalid login credentials") || error.message.includes("User not found"))) {
      console.log("[v0] Demo account not found, attempting to create...")
      
      const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        options: {
          data: {
            full_name: "مستخدم تجريبي",
            is_demo: true,
          },
        },
      })

      if (signUpError) {
        console.error("[v0] Demo account creation error:", signUpError)
        return NextResponse.json({ error: `فشل إنشاء حساب تجريبي: ${signUpError.message}` }, { status: 400 })
      }

      // بعد الإنشاء، حاول تسجيل الدخول مرة أخرى
      const { error: retryError, data: retryData } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      })

      if (retryError) {
        console.error("[v0] Demo login retry error:", retryError)
        return NextResponse.json({ error: `فشل تسجيل الدخول: ${retryError.message}` }, { status: 401 })
      }

      data = retryData
      error = null
    }

    if (error) {
      console.error("[v0] Demo login error:", error)
      return NextResponse.json({ error: `فشل تسجيل الدخول: ${error.message}` }, { status: 401 })
    }

    console.log("[v0] Demo login successful")
    return response
  } catch (err) {
    console.error("[v0] Demo login exception:", err)
    const errorMsg = err instanceof Error ? err.message : "حدث خطأ غير متوقع"
    return NextResponse.json({ error: `خطأ في تسجيل الدخول التجريبي: ${errorMsg}` }, { status: 500 })
  }
}
