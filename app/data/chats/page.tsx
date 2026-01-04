import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, Download, MoreHorizontal, User, MessageSquare } from "lucide-react"

const chatData = [
  {
    id: "CH-12345",
    customer: "محمد أحمد",
    phone: "201004006620",
    status: "نشط",
    lastActivity: "منذ دقيقتين",
    messages: 24,
    project: "أوبر فيكس",
  },
  {
    id: "CH-12346",
    customer: "سارة محمود",
    phone: "201234567890",
    status: "مغلق",
    lastActivity: "منذ ساعة",
    messages: 12,
    project: "إدارة المشاريع",
  },
  {
    id: "CH-12347",
    customer: "أحمد علي",
    phone: "201112223334",
    status: "انتظار",
    lastActivity: "منذ ٥ دقائق",
    messages: 5,
    project: "أوبر فيكس",
  },
]

export default function ChatsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">إدارة المحادثات</h1>
            <p className="text-sm text-muted-foreground mt-1">عرض وتحليل جميع محادثات واتساب النشطة والمؤرشفة.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" /> تصدير البيانات
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المحادثات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,284</div>
              <p className="text-xs text-emerald-500 font-medium mt-1">+12% منذ الشهر الماضي</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">متوسط وقت الرد</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2 دقيقة</div>
              <p className="text-xs text-emerald-500 font-medium mt-1">-8% تحسن في الأداء</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">معدل الإغلاق</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-emerald-500 font-medium mt-1">+5% زيادة في الكفاءة</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="البحث بالاسم أو الرقم أو المعرف..." className="h-9" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 gap-2 bg-transparent">
                <Filter className="h-4 w-4" /> تصفية
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المحادثة</TableHead>
                <TableHead className="text-right">المشروع</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">آخر نشاط</TableHead>
                <TableHead className="text-right">الرسائل</TableHead>
                <TableHead className="text-left">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chatData.map((chat) => (
                <TableRow key={chat.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{chat.customer}</div>
                        <div className="text-[10px] text-muted-foreground">{chat.phone}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded border">{chat.project}</span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        chat.status === "نشط"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : chat.status === "مغلق"
                            ? "bg-slate-200 text-slate-600"
                            : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      {chat.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{chat.lastActivity}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs">
                      <MessageSquare className="h-3 w-3 text-muted-foreground" />
                      {chat.messages}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}
