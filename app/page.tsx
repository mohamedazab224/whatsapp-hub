import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smartphone, Zap, Calendar, ChevronLeft, Code2, Webhook, ExternalLink } from "lucide-react"
import { DailyMessagesChart } from "@/components/dashboard/charts"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export const metadata = {
  title: "لوحة المعلومات",
  description: "لوحة التحكم الرئيسية",
}

export default async function Dashboard() {
  return (
    <div className="flex h-screen bg-background text-right" dir="rtl">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">لوحة المعلومات</h1>
            <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full">
              <span className="text-xs text-muted-foreground">الترقية</span>
              <span className="text-xs font-medium bg-background px-2 py-0.5 rounded-full">مجاني</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-card border rounded-md px-3 py-1.5 gap-2 cursor-pointer">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">29 ديسمبر - 4 يناير 2026</span>
            </div>
            <div className="flex bg-muted p-1 rounded-md">
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                اليوم
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs bg-background shadow-sm">
                هذا الأسبوع
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                هذا الشهر
              </Button>
            </div>
          </div>
        </div>

        <DashboardContent />
      </main>
    </div>
  )
}
