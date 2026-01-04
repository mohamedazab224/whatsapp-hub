import { Sidebar } from "@/components/dashboard/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, Download, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Suspense } from "react"

const messages = [
  {
    id: "msg_12345",
    from: "201004006620",
    to: "201000000000",
    content: "مرحباً بك في العزب هاب!",
    status: "تم التسليم",
    time: "10:30 ص",
  },
  {
    id: "msg_12346",
    from: "201000000000",
    to: "201004006620",
    content: "شكراً لك، كيف يمكنني البدء؟",
    status: "تمت القراءة",
    time: "10:32 ص",
  },
  {
    id: "msg_12347",
    from: "201004006620",
    to: "201000000000",
    content: "يمكنك البدء بإنشاء أول قالب رسالة.",
    status: "تم الإرسال",
    time: "10:35 ص",
  },
]

export default function MessagesPage() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Suspense fallback={null}>
          <MessagesContent />
        </Suspense>
      </main>
    </div>
  )
}

function MessagesContent() {
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">الرسائل</h1>
          <p className="text-sm text-muted-foreground mt-1">سجل كامل بجميع الرسائل المرسلة والمستقبلة.</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" /> تصدير السجل
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pr-10" placeholder="البحث في الرسائل..." />
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Filter className="h-4 w-4" /> تصفية
        </Button>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المعرف</TableHead>
              <TableHead className="text-right">من</TableHead>
              <TableHead className="text-right">إلى</TableHead>
              <TableHead className="text-right">المحتوى</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الوقت</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((msg, i) => (
              <TableRow key={i}>
                <TableCell className="font-mono text-[10px] text-primary">{msg.id}</TableCell>
                <TableCell dir="ltr" className="text-right text-xs">
                  {msg.from}
                </TableCell>
                <TableCell dir="ltr" className="text-right text-xs">
                  {msg.to}
                </TableCell>
                <TableCell className="text-sm max-w-xs truncate">{msg.content}</TableCell>
                <TableCell>
                  <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-emerald-500/10 text-emerald-500">
                    {msg.status}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{msg.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
