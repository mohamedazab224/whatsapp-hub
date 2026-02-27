import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
})

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get("projectId")

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      )
    }

    // عدد جهات الاتصال
    const { count: contactsCount } = await supabase
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId)

    // عدد الرسائل
    const { count: messagesCount } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId)

    // عدد المحادثات
    const { count: conversationsCount } = await supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId)

    // عدد الأرقام النشطة
    const { count: numbersCount } = await supabase
      .from("whatsapp_numbers")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId)
      .eq("is_active", true)

    // الرسائل اليومية (آخر 7 أيام)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: dailyMessages } = await supabase
      .from("messages")
      .select("created_at, direction")
      .eq("project_id", projectId)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true })

    // معالجة بيانات الرسائل اليومية
    const messagesByDay: Record<string, { sent: number; received: number }> = {}

    dailyMessages?.forEach((msg: any) => {
      const date = new Date(msg.created_at).toLocaleDateString("ar-EG")
      if (!messagesByDay[date]) {
        messagesByDay[date] = { sent: 0, received: 0 }
      }
      if (msg.direction === "outbound") {
        messagesByDay[date].sent++
      } else {
        messagesByDay[date].received++
      }
    })

    // أحدث الرسائل
    const { data: recentMessages } = await supabase
      .from("messages")
      .select(
        `
        *,
        contacts:contact_id(name, wa_id)
      `
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(10)

    // حساب معدل الاستجابة
    const { data: responseTimes } = await supabase
      .from("messages")
      .select("created_at, direction")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true })

    let averageResponseTime = 0
    if (responseTimes && responseTimes.length > 1) {
      let totalTime = 0
      let responseCount = 0

      for (let i = 1; i < responseTimes.length; i++) {
        if (
          responseTimes[i].direction === "outbound" &&
          responseTimes[i - 1].direction === "inbound"
        ) {
          const time =
            new Date(responseTimes[i].created_at).getTime() -
            new Date(responseTimes[i - 1].created_at).getTime()
          totalTime += time
          responseCount++
        }
      }

      averageResponseTime =
        responseCount > 0 ? Math.round(totalTime / responseCount / 1000 / 60) : 0 // بالدقائق
    }

    return NextResponse.json({
      stats: {
        totalContacts: contactsCount || 0,
        totalMessages: messagesCount || 0,
        totalConversations: conversationsCount || 0,
        activeNumbers: numbersCount || 0,
        averageResponseTimeMinutes: averageResponseTime,
      },
      messagesByDay: Object.entries(messagesByDay).map(([date, data]) => ({
        date,
        sent: data.sent,
        received: data.received,
      })),
      recentMessages: recentMessages || [],
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
