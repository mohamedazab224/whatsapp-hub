import { Sidebar } from "@/components/dashboard/sidebar"
import { getSupabaseAdmin } from "@/lib/supabase"
import { IntegrationsSettingsClient } from "./settings-client"

export default async function IntegrationsSettingsPage() {
  const supabase = getSupabaseAdmin()
  const { data: projects } = await supabase.from("projects").select("id, name").order("created_at", { ascending: true })
  const project = projects?.[0]

  const { data: integrations } = project
    ? await supabase
        .from("integrations")
        .select("id, type, is_active, config")
        .eq("project_id", project.id)
    : { data: [] }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <IntegrationsSettingsClient project={project || null} integrations={integrations || []} />
      </main>
    </div>
  )
}
