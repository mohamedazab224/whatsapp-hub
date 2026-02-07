import { Sidebar } from "@/components/dashboard/sidebar"
import { getSupabaseServer } from "@/lib/supabase"
import { AISettingsClient } from "./settings-client"

export default async function AISettingsPage() {
  try {
    const supabase = getSupabaseServer()
    const projectResult = await supabase.from("projects").select("id, name").order("created_at", { ascending: true })
    const projects = (projectResult as any).data || []
    const project = projects?.[0]

    let aiConfig = null
    if (project) {
      const configResult = await supabase.from("ai_configurations").select("*").eq("project_id", project.id).maybeSingle()
      aiConfig = (configResult as any).data
    }

    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <AISettingsClient project={project || null} aiConfig={aiConfig || null} />
        </main>
      </div>
    )
  } catch (error) {
    console.error("[AI Settings] Error loading page:", error)
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="text-center text-muted-foreground">
            <p>تعذر تحميل إعدادات الذكاء الاصطناعي. تأكد من تكوين قاعدة البيانات.</p>
          </div>
          <AISettingsClient project={null} aiConfig={null} />
        </main>
      </div>
    )
  }
}
