import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Users, MessageSquare, History, Plus } from "lucide-react"

export default function BroadcastPage() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">بث واتساب (Broadcast)</h1>
            <p className="text-sm text-muted-foreground mt-1">أرسل رسائل جماعية لآلاف العملاء بضغطة واحدة.</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> حملة جديدة
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المستلمين</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45,289</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">نسبة التسليم</CardTitle>
              <Send className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.2%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">معدل التفاعل</CardTitle>
              <MessageSquare className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24.5%</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col items-center justify-center py-20 border rounded-lg bg-card text-center px-4">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <History className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold mb-2">لا توجد حملات سابقة</h2>
          <p className="text-sm text-muted-foreground max-w-md mb-8">
            ابدأ حملتك الأولى للوصول إلى عملائك بفعالية. يمكنك استهداف مجموعات محددة أو جميع جهات الاتصال.
          </p>
          <Button variant="outline" className="gap-2 bg-transparent">
            عرض الدليل التعليمي
          </Button>
        </div>
      </main>
    </div>
  )
}
