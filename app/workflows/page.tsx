import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Plus, Play, MoreVertical } from "lucide-react"
import { getSupabaseServer } from "@/lib/supabase"

export default async function WorkflowsPage() {
  try {
    const supabase = getSupabaseServer()
    const result = await supabase
      .from("workflows")
      .select("id, name, trigger, is_active, last_run_at, run_count")
      .order("created_at", { ascending: false })

    const workflowData = (result as any).data || []

    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">سير العمل والأتمتة</h1>
              <p className="text-muted-foreground text-sm mt-1">إنشاء وإدارة سير عمل للأتمتة</p>
            </div>
            <Button className="gap-2"><Plus className="h-4 w-4" /> إنشاء سير عمل</Button>
          </div>
          {workflowData.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {workflowData.map((workflow: any) => (
                <Card key={workflow.id}>
                  <CardHeader className="flex-row items-center justify-between space-y-0">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-4 w-4" /> {workflow.name}
                    </CardTitle>
                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">المشغل: {workflow.trigger}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 border rounded-lg bg-card">
              <p className="text-muted-foreground">لا توجد سير عمل بعد. ابدأ بإنشاء واحد!</p>
            </div>
          )}
        </main>
      </div>
    )
  } catch (error) {
    console.error("[Workflows] Error loading page:", error)
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="text-center text-muted-foreground">
            <p>تعذر تحميل سير العمل. تأكد من تكوين قاعدة البيانات.</p>
          </div>
        </main>
      </div>
    )
  }
}
