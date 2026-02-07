"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smartphone, Zap, Calendar, ChevronLeft, Code2, Webhook, ExternalLink } from "lucide-react"
import { DailyMessagesChart } from "@/components/dashboard/charts"
import { useDashboardStats, useMessages } from "@/hooks/use-data"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function Dashboard() {
  const { stats, isLoading, error } = useDashboardStats()
  const { messages: recentMessages } = useMessages({ limit: 10 })

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">جهات الاتصال</span>
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold">{isLoading ? "..." : stats.contacts}</div>
              <p className="text-xs text-muted-foreground mt-1">إجمالي العملاء</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">الرسائل</span>
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold">{isLoading ? "..." : stats.messages}</div>
              <p className="text-xs text-muted-foreground mt-1">نشاط المنصة الحالي</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">الأرقام</span>
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold">{isLoading ? "..." : stats.numbers}</div>
              <p className="text-xs text-muted-foreground mt-1">الأرقام المفعلة</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">سير العمل</span>
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold">0 نقاط</div>
              <p className="text-xs text-muted-foreground mt-1">جميعها ناجحة</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">الرسائل اليومية</CardTitle>
                <span className="text-xs text-muted-foreground">إحصائيات سريعة</span>
              </div>
            </CardHeader>
            <CardContent>
              <DailyMessagesChart />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">الرسائل الحديثة</CardTitle>
                  <Link href="/inbox">
                    <Button variant="ghost" size="sm" className="text-primary">
                      عرض صندوق الوارد
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الزمن</TableHead>
                      <TableHead className="text-right">المحتوى</TableHead>
                      <TableHead className="text-right">الإعراض</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الاتصال</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentMessages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          لا توجد رسائل حديثة
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentMessages.map((message: any) => (
                        <TableRow key={message.id}>
                          <TableCell className="text-sm text-muted-foreground">
                            {message.timestamp ? formatDistanceToNow(new Date(message.timestamp), {
                              locale: ar,
                              addSuffix: true,
                            }) : '-'}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm truncate">{message.body || '-'}</p>
                          </TableCell>
                          <TableCell>—</TableCell>
                          <TableCell>
                            <Badge variant={message.direction === 'inbound' ? 'secondary' : 'default'}>
                              {message.direction === 'inbound' ? 'الوارد' : 'الخارج'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {message.contacts?.name || message.contacts?.wa_id || '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col items-center justify-center gap-2 bg-transparent">
                  <Smartphone className="h-5 w-5" />
                  <span className="text-xs">أضف رقم هاتف</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col items-center justify-center gap-2 bg-transparent">
                  <Code2 className="h-5 w-5" />
                  <span className="text-xs">إنشاء مفتاح API</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col items-center justify-center gap-2 bg-transparent">
                  <Webhook className="h-5 w-5" />
                  <span className="text-xs">إنشاء webhook</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col items-center justify-center gap-2 bg-transparent">
                  <Zap className="h-5 w-5" />
                  <span className="text-xs">إنشاء سير العمل</span>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">الوثائق</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-primary hover:underline cursor-pointer">
                  <span>whatsapp.alazab.com/docs</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
                <p className="text-xs text-muted-foreground">
                  بالنسبة للوكلاء الذكاء الاصطناعي، مرر alazab.com/llms.txt أو الاتصال عبر MCP:
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                    المؤشر
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                    شيفرة كلود
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                    كود VS
                  </Button>
                </div>
                <div className="bg-muted p-3 rounded-md font-mono text-[10px] break-all">
                  {`{ "mcpServers": { "alazab": { "url": "https://whatsapp.alazab.com/mcp" } } }`}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
