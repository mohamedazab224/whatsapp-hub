import { Sidebar } from "@/components/dashboard/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, Download, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Suspense } from "react"
import { getSupabaseServer } from "@/lib/supabase"

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

async function MessagesContent() {
  const supabase = getSupabaseServer()
  const { data: messages } = await supabase
    .from("messages")
    .select("id, whatsapp_message_id, contact_id, whatsapp_number_id, direction, body, created_at")
    .order("created_at", { ascending: false })
    .limit(50)

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
              <TableHead className="text-right">جهة الاتصال</TableHead>
              <TableHead className="text-right">رقم واتساب</TableHead>
              <TableHead className="text-right">المحتوى</TableHead>
              <TableHead className="text-right">الاتجاه</TableHead>
              <TableHead className="text-right">الوقت</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(messages || []).map((msg) => (
              <TableRow key={msg.id}>
                <TableCell className="font-mono text-[10px] text-primary">{msg.whatsapp_message_id || msg.id}</TableCell>
                <TableCell dir="ltr" className="text-right text-xs">
                  {msg.contact_id || "—"}
                </TableCell>
                <TableCell dir="ltr" className="text-right text-xs">
                  {msg.whatsapp_number_id || "—"}
                </TableCell>
                <TableCell className="text-sm max-w-xs truncate">{msg.body || "—"}</TableCell>
                <TableCell>
                  <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-muted text-muted-foreground">
                    {msg.direction || "—"}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {msg.created_at ? new Date(msg.created_at).toLocaleString("ar-EG") : "—"}
                </TableCell>
              </TableRow>
            ))}
            {!messages?.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                  لا توجد رسائل بعد.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
