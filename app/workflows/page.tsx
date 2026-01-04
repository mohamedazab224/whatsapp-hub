import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Plus, Play, MoreVertical } from "lucide-react"

const workflowData = [
  {
    id: 1,
    name: "إرسال فاتورة تلقائياً",
    trigger: "عند استلام رسالة تحتوى على 'فاتورة'",
    status: "نشط",
    lastRun: "منذ ١٠ دقائق",
    runs: 128,
  },
  {
    id: 2,
    name: "تذكير موعد الصيانة",
    trigger: "قبل ٢٤ ساعة من موعد الحجز",
    status: "نشط",
    lastRun: "منذ ساعة",
    runs: 45,
  },
  {
    id: 3,
    name: "ترحيب بالعملاء الجدد",
    trigger: "عند أول رسالة من رقم جديد",
    status: "متوقف",
    lastRun: "أمس",
    runs: 312,
  },
]

export default function WorkflowsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">سير العمل والأتمتة</h1>
            <p className="text-sm text-muted-foreground mt-1">قم ببناء مسارات عمل ذكية وأتمتة الردود والإشعارات.</p>
          </div>
          <Button className="bg-primary gap-2">
            <Plus className="h-4 w-4" /> إنشاء سير عمل
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">سير العمل النشط</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
              <p className="text-[10px] text-muted-foreground mt-1">تعمل حالياً دون أخطاء</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                العمليات المؤتمتة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">4.2k</div>
              <p className="text-[10px] text-muted-foreground mt-1">خلال آخر ٣٠ يوماً</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                توفير الوقت
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">158 ساعة</div>
              <p className="text-[10px] text-emerald-500 font-bold mt-1">بناءً على المهام اليدوية</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-lg mb-4">المسارات الحالية</h2>
          {workflowData.map((wf) => (
            <Card key={wf.id} className="group hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${wf.status === "نشط" ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"}`}
                  >
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{wf.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Play className="h-3 w-3" /> {wf.trigger}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">مرات التشغيل</p>
                    <p className="text-sm font-bold">{wf.runs}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">آخر تشغيل</p>
                    <p className="text-xs">{wf.lastRun}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${wf.status === "نشط" ? "bg-emerald-500 animate-pulse" : "bg-muted"}`}
                    />
                    <span className="text-xs font-medium">{wf.status}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
