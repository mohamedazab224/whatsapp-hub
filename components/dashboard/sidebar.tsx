import { getSupabaseAdmin } from "@/lib/supabase"
import { SidebarClient } from "./sidebar-client"

export async function Sidebar() {
  const supabase = getSupabaseAdmin()
  const { data: projects } = await supabase.from("projects").select("id, name").order("created_at", { ascending: true })
  const { data: numbers } = await supabase
    .from("whatsapp_numbers")
    .select("id, project_id")
    .order("created_at", { ascending: true })

  return <SidebarClient projects={projects || []} numbers={numbers || []} />
}
