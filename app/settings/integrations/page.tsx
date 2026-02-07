import { Sidebar } from "@/components/dashboard/sidebar"
import { getSupabaseServer } from "@/lib/supabase"
import { IntegrationsSettingsClient } from "./settings-client"

export default async function IntegrationsSettingsPage() {
  try {
    const supabase = getSupabaseServer()
    const projectResult = await supabase.from("projects").select("id, name").order("created_at", { ascending: true })
    const projects = (projectResult as any).data || []
    const project = projects?.[0]

    let integrations = []
    if (project) {
      const intResult = await supabase
        .from("integrations")
        .select("id, type, is_active, config")
        .eq("project_id", project.id)
      integrations = (intResult as any).data || []
    }

    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <IntegrationsSettingsClient project={project || null} integrations={integrations} />
        </main>
      </div>
    )
  } catch (error) {
    console.error("[Integrations] Error loading page:", error)
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="text-center text-muted-foreground">
            <p>تعذر تحميل إعدادات التكاملات. تأكد من تكوين قاعدة البيانات.</p>
          </div>
          <IntegrationsSettingsClient project={null} integrations={[]} />
        </main>
      </div>
    )
  }
}
