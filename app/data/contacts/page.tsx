import { Sidebar } from "@/components/dashboard/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, UserPlus, MoreVertical, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Suspense } from "react"

const contacts = [
  { name: "محمد عزاب", phone: "201004006620", email: "admin@alazab.com", status: "نشط", lastSeen: "منذ دقيقتين" },
  { name: "أحمد علي", phone: "201234567890", email: "ahmed@example.com", status: "نشط", lastSeen: "أمس" },
  { name: "سارة محمود", phone: "201112223334", email: "sara@example.com", status: "غير نشط", lastSeen: "منذ أسبوع" },
]

function ContactsContent() {
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">جهات الاتصال</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة جميع جهات الاتصال المرتبطة بواتساب.</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" /> إضافة جهة اتصال
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pr-10" placeholder="البحث في جهات الاتصال..." />
        </div>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">الهاتف</TableHead>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">آخر ظهور</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell dir="ltr" className="text-right font-mono text-sm">
                  {contact.phone}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{contact.email}</TableCell>
                <TableCell>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      contact.status === "نشط" ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {contact.status}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{contact.lastSeen}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

export default function ContactsPage() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Suspense fallback={null}>
          <ContactsContent />
        </Suspense>
      </main>
    </div>
  )
}
