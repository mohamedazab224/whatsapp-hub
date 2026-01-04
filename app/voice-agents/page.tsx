import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Plus, Settings2, Play, Activity } from "lucide-react"

export default function VoiceAgentsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">وكلاء الصوت (Voice Agents)</h1>
            <p className="text-sm text-muted-foreground mt-1">
              أتمتة المكالمات الصوتية وتحويل الصوت إلى نص وتفاعل ذكي.
            </p>
          </div>
          <Button className="bg-primary gap-2">
            <Plus className="h-4 w-4" /> إنشاء وكيل صوتي
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white">
                  <Mic className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">مساعد الصيانة الصوتي</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">اللغة: العربية (مصرية)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium">نشط</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-card border rounded-lg p-4 mb-4">
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest">توجيه الوكيل</p>
                <p className="text-sm italic">
                  "أهلاً بك في أوبر فيكس، أنا مساعدك الرقمي. كيف يمكنني مساعدتك في طلب الصيانة اليوم؟"
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="gap-2 flex-1">
                  <Play className="h-3 w-3" /> تجربة الصوت
                </Button>
                <Button size="sm" variant="outline" className="gap-2 flex-1 bg-transparent">
                  <Settings2 className="h-3 w-3" /> الإعدادات
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col items-center justify-center border-dashed">
            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="font-bold mb-1">لا توجد سجلات مكالمات</h3>
            <p className="text-xs text-muted-foreground">سوف تظهر تقارير الوكلاء الصوتيين هنا بمجرد بدء التشغيل.</p>
          </Card>
        </div>
      </main>
    </div>
  )
}
