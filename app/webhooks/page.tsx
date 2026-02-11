import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Webhook, Plus, ArrowUpRight, MoreVertical, CheckCircle2, AlertCircle } from "lucide-react"
import { getSupabaseServer } from "@/lib/supabase"

export default async function WebhooksPage() {
  try {
    const supabase = getSupabaseServer()
    const result = await supabase
      .from("webhooks")
      .select("id, url, events, is_active")
      .order("created_at", { ascending: false })

    const endpoints = (result as any).data || []

    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">الويبهوكس (Webhooks)</h1>
              <p className="text-sm text-muted-foreground mt-1">استقبل التحديثات الفورية للرسائل والوسائط على نظامك.</p>
            </div>
            <Button className="bg-primary gap-2">
              <Plus className="h-4 w-4" /> إضافة Webhook
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">نجاح التسليم</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.8%</div>
                <p className="text-xs text-muted-foreground mt-1">إجمالي 1,420 استدعاء اليوم</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">فشل التسليم</CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.2%</div>
                <p className="text-xs text-muted-foreground mt-1">تنبيه: ٣ استدعاءات فشلت مؤخراً</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">نقاط النهاية (Endpoints)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {endpoints.map((wh: any) => {
                const events = Array.isArray(wh.events) ? wh.events : wh.events ? [wh.events] : []
                return (
                  <div
                    key={wh.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-card group hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-muted rounded border flex items-center justify-center">
                        <Webhook className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-mono text-xs font-bold">{wh.url}</h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          {events.map((event: any, j: number) => (
                            <span
                              key={j}
                              className="text-[9px] bg-muted px-1.5 py-0.5 rounded border text-muted-foreground font-mono"
                            >
                              {event}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${wh.is_active ? "bg-emerald-500" : "bg-muted"}`} />
                        <span className="text-xs font-medium">{wh.is_active ? "نشط" : "متوقف"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
              {!endpoints?.length && (
                <div className="text-sm text-muted-foreground text-center py-6">لا توجد نقاط نهاية مسجلة.</div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    )
  } catch (error) {
    console.error("[Webhooks] Error loading page:", error)
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="text-center text-muted-foreground">
            <p>تعذر تحميل الويبهوكس. تأكد من تكوين قاعدة البيانات.</p>
          </div>
        </main>
      </div>
    )
  }
}
