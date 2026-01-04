import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { RefreshCcw, Plus, Send } from "lucide-react"

export default function FlowsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex gap-8">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">تدفقات واتساب</h1>
                <span className="bg-muted px-2 py-0.5 rounded text-[10px] text-muted-foreground border">
                  الإصدار بيتا
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <RefreshCcw className="h-4 w-4" /> مزامنة من ميتا
                </Button>
                <Button className="gap-2 bg-primary">
                  <Plus className="h-4 w-4" /> إنشاء تدفق
                </Button>
              </div>
            </div>

            <p className="text-muted-foreground text-sm mb-8">
              يتيح لك تدفقات واتساب إنشاء نماذج تفاعلية وجمع بيانات منظمة من المستخدمين.
              <span className="text-primary cursor-pointer mr-1">تعرف على المزيد</span>
            </p>

            <div className="flex gap-4 mb-8">
              <Button variant="ghost" className="border-b-2 border-primary rounded-none px-0 h-auto pb-2 text-primary">
                الردود
              </Button>
              <Button variant="ghost" className="text-muted-foreground px-0 h-auto pb-2">
                التدفقات
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center py-20 border rounded-xl bg-muted/30 border-dashed">
              <p className="text-muted-foreground text-sm">لا توجد بيانات متاحة</p>
            </div>
          </div>

          <div className="w-80 border rounded-2xl bg-card overflow-hidden flex flex-col shadow-xl">
            <div className="p-6 flex flex-col items-center border-b">
              <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center mb-4 text-primary-foreground font-bold text-xl">
                A
              </div>
              <h3 className="font-bold text-lg mb-4">كيف يمكنني مساعدتك في تدفق الواتساب؟</h3>
              <div className="w-full relative">
                <input
                  type="text"
                  placeholder="اسأل عن تدفق الواتساب الخاص بك..."
                  className="w-full bg-muted border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 bg-primary rounded flex items-center justify-center text-white">
                  <Send className="h-3 w-3" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground">
                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                سونية 4.5
                <RefreshCcw className="h-3 w-3" />
                تدفقات واتسا...
              </div>
            </div>
            <div className="p-6 flex-1 bg-muted/10">
              <p className="text-[10px] font-bold text-muted-foreground text-center mb-4 uppercase tracking-widest">
                جرب واحدة من هذه:
              </p>
              <div className="space-y-2">
                {[
                  "ابن نموذج تغذية راجعة",
                  "بناء تدفق جدولة المواعيد",
                  "بناء نموذج لالتقاط الرصاص",
                  "بناء تدفق استقبال دعم العملاء",
                ].map((text, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    className="w-full justify-start text-[11px] h-auto py-2 text-muted-foreground hover:bg-muted/50 text-right"
                  >
                    {text}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
