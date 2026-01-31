import { Sidebar } from "@/components/dashboard/sidebar"
import { getSupabaseAdmin } from "@/lib/supabase"
import { TemplatesClient } from "./templates-client"

export default async function TemplatesPage() {
  const supabase = getSupabaseAdmin()
  const { data: numbers } = await supabase
    .from("whatsapp_numbers")
    .select("id, name, phone_number, phone_number_id")
    .order("created_at", { ascending: true })

  return (
    <div className="flex h-screen bg-background text-right" dir="rtl">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <TemplatesClient numbers={numbers || []} />
      </main>
    </div>
  )
}
