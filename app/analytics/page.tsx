import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Download, TrendingUp, Users, MessageSquare, Clock } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">التحليلات والتقارير</h1>
            <p className="text-sm text-muted-foreground mt-1">تتبع أداء التواصل، سرعة الاستجابة، وتفاعل العملاء.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Calendar className="h-4 w-4" /> هذا الشهر
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" /> تحميل التقرير
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-emerald-50/50 border-emerald-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-emerald-700">معدل التفاعل</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">84.2%</div>
              <p className="text-xs text-emerald-600 mt-1">+2.4% عن الأسبوع الماضي</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">عملاء جدد</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">152</div>
              <p className="text-xs text-emerald-500 mt-1">+18 منذ الأمس</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الرسائل</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14.5k</div>
              <p className="text-xs text-muted-foreground mt-1">منها 2.1k رسائل قوالب</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">وقت الاستجابة</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.5m</div>
              <p className="text-xs text-emerald-500 mt-1">تحسن بنسبة 15%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>توزيع الرسائل حسب الساعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-end gap-2 px-2 pb-6">
                {[40, 25, 30, 45, 60, 80, 70, 50, 40, 30, 20, 15].map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary/20 hover:bg-primary transition-colors rounded-t-sm relative group"
                  >
                    <div style={{ height: `${val}%` }} className="bg-primary rounded-t-sm" />
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap">
                      {i * 2} ص
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>القوالب الأكثر استخداماً</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { name: "تاكيد_موعد_الصيانة", use: 452, rate: 98 },
                { name: "اشعار_فاتورة_جديدة", use: 312, rate: 85 },
                { name: "ترحيب_عميل_جديد", use: 245, rate: 92 },
                { name: "تذكير_دفع_متأخر", use: 124, rate: 76 },
              ].map((template, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold font-mono">{template.name}</span>
                    <span className="text-muted-foreground">{template.use} استخدام</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div style={{ width: `${template.rate}%` }} className="h-full bg-primary" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
