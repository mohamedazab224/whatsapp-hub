import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

const DEMO_EMAIL = "demo@alazab.com"
const DEMO_PASSWORD = "Demo@12345678"

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true, redirectTo: "/" })

    // الحصول على متغيرات البيئة
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[v0] Missing Supabase configuration")
      return NextResponse.json(
        { error: "تكوين Supabase غير مكتمل. يرجى التحقق من متغيرات البيئة." },
        { status: 500 }
      )
    }

    // إنشاء عميل Supabase
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    console.log("[v0] Attempting demo login with email:", DEMO_EMAIL)

    // محاولة تسجيل الدخول
    const { error, data } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    })

    if (!error && data?.user) {
      console.log("[v0] Demo login successful for user:", data.user.id)
      return response
    }

    // إذا كان الخطأ "Invalid login credentials"، حاول إنشاء حساب جديد
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
        console.error("[v0] Signup error:", signUpError)
        return NextResponse.json(
          { error: `فشل في إنشاء الحساب: ${signUpError.message}` },
          { status: 400 }
        )
      }

      console.log("[v0] Demo account created, attempting login...")

      // حاول تسجيل الدخول مرة أخرى
      const { error: retryError } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      })

      if (retryError) {
        console.error("[v0] Retry login error:", retryError)
        return NextResponse.json(
          { error: `فشل تسجيل الدخول بعد الإنشاء: ${retryError.message}` },
          { status: 401 }
        )
      }

      console.log("[v0] Demo login successful after creation")
      return response
    }

    // خطأ عام
    console.error("[v0] Demo login error:", error)
    return NextResponse.json(
      { error: error ? error.message : "فشل تسجيل الدخول التجريبي" },
      { status: 401 }
    )
  } catch (err) {
    console.error("[v0] Demo login exception:", err)
    const message = err instanceof Error ? err.message : "خطأ غير متوقع"
    return NextResponse.json({ error: `خطأ السيرفر: ${message}` }, { status: 500 })
  }
}
