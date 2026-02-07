import { Sidebar } from "@/components/dashboard/sidebar"
import { getSupabaseServer } from "@/lib/supabase"
import { TemplatesClient } from "./templates-client"

export default async function TemplatesPage() {
  try {
    const supabase = getSupabaseServer()
    const result = await supabase
      .from("whatsapp_numbers")
      .select("id, name, phone_number, phone_number_id")
      .order("created_at", { ascending: true })

    const numbers = (result as any).data || []

    return (
      <div className="flex h-screen bg-background text-right" dir="rtl">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <TemplatesClient numbers={numbers} />
        </main>
      </div>
    )
  } catch (error) {
    console.error("[Templates] Error loading page:", error)
    return (
      <div className="flex h-screen bg-background text-right" dir="rtl">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="text-center text-muted-foreground">
            <p>تعذر تحميل القوالب. تأكد من تكوين قاعدة البيانات.</p>
          </div>
          <TemplatesClient numbers={[]} />
        </main>
      </div>
    )
  }
}
