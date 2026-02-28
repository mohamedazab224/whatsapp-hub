import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const DEMO_EMAIL = "demo@alazab.com"
const DEMO_PASSWORD = "Demo@12345678"
const DEMO_NAME = "مستخدم تجريبي"

async function setupDemoUser() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ متغيرات البيئة مفقودة:")
    console.error("- NEXT_PUBLIC_SUPABASE_URL:", SUPABASE_URL ? "✓" : "✗")
    console.error("- SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? "✓" : "✗")
    process.exit(1)
  }

  console.log("🚀 جارٍ إعداد حساب تجريبي...")
  console.log("================================")
  console.log(`📧 البريد الإلكتروني: ${DEMO_EMAIL}`)
  console.log(`🔑 كلمة المرور: ${DEMO_PASSWORD}`)
  console.log("")

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  try {
    // التحقق من وجود المستخدم
    console.log("🔍 التحقق من وجود المستخدم التجريبي...")
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const demoUserExists = existingUsers?.users.some((u) => u.email === DEMO_EMAIL)

    if (demoUserExists) {
      console.log("✅ حساب تجريبي موجود بالفعل!")
      return
    }

    // إنشاء المستخدم
    console.log("📝 جارٍ إنشاء المستخدم التجريبي...")
    const { data, error } = await supabase.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
    })

    if (error) {
      console.error("❌ خطأ في إنشاء المستخدم:", error.message)
      process.exit(1)
    }

    console.log("✅ تم إنشاء المستخدم بنجاح!")
    console.log(`👤 معرف المستخدم: ${data.user.id}`)

    // إضافة بيانات المستخدم في جدول users
    console.log("📊 جارٍ إضافة بيانات المستخدم...")
    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      email: DEMO_EMAIL,
      full_name: DEMO_NAME,
      avatar_url: null,
    })

    if (profileError) {
      console.warn("⚠️ تحذير: خطأ في إضافة بيانات المستخدم:", profileError.message)
      // لا نتوقف عند الخطأ هنا لأنه قد يكون بسبب RLS
    } else {
      console.log("✅ تمت إضافة بيانات المستخدم بنجاح")
    }

    console.log("")
    console.log("🎉 تم إعداد حساب تجريبي بنجاح!")
    console.log("")
    console.log("بيانات الدخول التجريبية:")
    console.log(`  البريد: ${DEMO_EMAIL}`)
    console.log(`  كلمة المرور: ${DEMO_PASSWORD}`)
    console.log("")
  } catch (error) {
    console.error("❌ حدث خطأ:", error)
    process.exit(1)
  }
}

setupDemoUser()
