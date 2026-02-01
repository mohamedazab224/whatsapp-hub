import { Sidebar } from "@/components/dashboard/sidebar"
import { getSupabaseServer } from "@/lib/supabase"
import { AISettingsClient } from "./settings-client"

export default async function AISettingsPage() {
  const supabase = getSupabaseServer()
  const { data: projects } = await supabase.from("projects").select("id, name").order("created_at", { ascending: true })
  const project = projects?.[0]

  const { data: aiConfig } = project
    ? await supabase.from("ai_configurations").select("*").eq("project_id", project.id).maybeSingle()
    : { data: null }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <AISettingsClient project={project || null} aiConfig={aiConfig || null} />
      </main>
    </div>
  )
}
