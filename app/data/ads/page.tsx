import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Megaphone, ExternalLink, TrendingUp, Users, MousePointer2 } from "lucide-react"

export default function AdsPage() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">إعلانات (CTWA)</h1>
            <p className="text-sm text-muted-foreground mt-1">إعلانات النقر إلى واتساب (Click to WhatsApp).</p>
          </div>
          <Button className="gap-2">
            <Megaphone className="h-4 w-4" /> إنشاء حملة إعلانية
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي النقرات</CardTitle>
              <MousePointer2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,284</div>
              <p className="text-xs text-emerald-500 mt-1">+12% عن الشهر الماضي</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">المحادثات الجديدة</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">432</div>
              <p className="text-xs text-emerald-500 mt-1">+8% عن الشهر الماضي</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">معدل التحويل</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">33.6%</div>
              <p className="text-xs text-emerald-500 mt-1">+2.4% عن الشهر الماضي</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col items-center justify-center py-20 border rounded-lg bg-card text-center px-4">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Megaphone className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold mb-2">لا توجد حملات نشطة</h2>
          <p className="text-sm text-muted-foreground max-w-md mb-8">
            ابدأ بجلب المزيد من العملاء عبر ربط حساب فيسبوك للأعمال وإطلاق حملات "النقر إلى واتساب" مباشرة من هنا.
          </p>
          <Button variant="outline" className="gap-2 bg-transparent">
            <ExternalLink className="h-4 w-4" /> ربط مدير أعمال ميتا
          </Button>
        </div>
      </main>
    </div>
  )
}
