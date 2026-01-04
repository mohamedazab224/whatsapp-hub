import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { ChevronRight, Smartphone, PhoneIncoming, ArrowRight } from "lucide-react"

export default function ConnectNumberPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div className="h-2 w-2 rounded-full bg-muted" />
            </div>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold mb-2">رقم الاتصال بواتساب</h1>
            <p className="text-muted-foreground text-sm">اختر كيف تريد ربط واتساب بالعزب هاب</p>
          </div>

          <div className="space-y-4">
            <div className="group relative bg-card border rounded-xl p-6 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">إعداد فوري باستخدام رقم رقمي أمريكي</h3>
                      <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-0.5 rounded font-medium">
                        موصى به
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">لا حاجة لشريحة SIM أو رمز تحقق</p>
                  </div>
                </div>
                <div className="text-primary text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  تعرف على المزيد <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </div>

            <div className="group relative bg-card border rounded-xl p-6 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                    <div className="relative">
                      <Smartphone className="h-6 w-6" />
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-card border rounded-sm flex items-center justify-center">
                        <div className="h-1.5 w-1.5 bg-foreground rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold">وصل شريحة SIM الخاصة بي</h3>
                    <p className="text-xs text-muted-foreground mt-1">استخدم رقمك وتحقق من ذلك برمز نصي</p>
                  </div>
                </div>
                <div className="text-primary text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  تعرف على المزيد <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </div>

            <div className="group relative bg-card border rounded-xl p-6 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                    <PhoneIncoming className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-muted-foreground">تطبيق Connect WhatsApp Business</h3>
                      <span className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5 rounded font-medium">
                        غير مستقر
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">استخدم رقم هاتفك الحالي لتطبيق واتساب بيزنس.</p>
                  </div>
                </div>
                <div className="text-primary text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  تعرف على المزيد <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
