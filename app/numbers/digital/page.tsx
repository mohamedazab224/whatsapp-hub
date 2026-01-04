import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"

export default function DigitalNumbersPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">أرقام الهواتف الرقمية</h1>
            <p className="text-sm text-muted-foreground mt-1">الأرقام التي توفرها العزب هاب مشمولة في خطتك.</p>
          </div>
          <Button className="bg-primary gap-2">
            <Plus className="h-4 w-4" /> أضف رقم الهاتف
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="ابحث عن أرقام الهواتف..."
            className="w-full bg-card border rounded-lg px-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="border rounded-xl bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-xl font-bold tracking-tight">379-9564 (208) 1+</div>
              <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-0.5 rounded font-medium">
                نشط
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              متصل بـ "محمد عزاب" • أضيف في 4 يناير 2026 الساعة 1:02 صباحا
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
