import { Sidebar } from "@/components/dashboard/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, Mail, Phone, Tag, MoreHorizontal } from "lucide-react"

const customers = [
  { name: "محمد العزب", phone: "201004006620", email: "m@alazab.com", tags: ["VIP", "صيانة"], lastSeen: "منذ ساعة" },
  { name: "أحمد حسن", phone: "201223344556", email: "ahmed@example.com", tags: ["جديد"], lastSeen: "أمس" },
  { name: "شركة الأمل", phone: "201155667788", email: "info@alamal.com", tags: ["مؤسسة"], lastSeen: "منذ ٣ أيام" },
]

export default function CustomersPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">إدارة العملاء</h1>
            <p className="text-sm text-muted-foreground mt-1">
              قاعدة بيانات مركزية لجميع جهات الاتصال المتفاعلة عبر واتساب.
            </p>
          </div>
          <Button className="bg-primary gap-2">
            <UserPlus className="h-4 w-4" /> إضافة عميل
          </Button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث بالاسم، الرقم، أو البريد..." className="pr-10" />
          </div>
        </div>

        <div className="border rounded-xl bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">التواصل</TableHead>
                <TableHead className="text-right">التصنيفات</TableHead>
                <TableHead className="text-right">آخر ظهور</TableHead>
                <TableHead className="text-left">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c, i) => (
                <TableRow key={i}>
                  <TableCell className="font-bold">{c.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Phone className="h-3 w-3 text-muted-foreground" /> {c.phone}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" /> {c.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {c.tags.map((tag, j) => (
                        <span
                          key={j}
                          className="bg-muted px-2 py-0.5 rounded text-[10px] font-medium border flex items-center gap-1"
                        >
                          <Tag className="h-2 w-2" /> {tag}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.lastSeen}</TableCell>
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
