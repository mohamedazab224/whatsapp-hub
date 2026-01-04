import { Sidebar } from "@/components/dashboard/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Phone, PhoneIncoming, PhoneOutgoing } from "lucide-react"

const calls = [
  { phone: "201004006620", type: "صادرة", status: "مكتملة", duration: "5:30", time: "اليوم، 11:00 ص" },
  { phone: "201234567890", type: "واردة", status: "لم يرد", duration: "0:00", time: "أمس، 09:15 م" },
  { phone: "201112223334", type: "صادرة", status: "مكتملة", duration: "12:45", time: "2 يناير، 04:30 م" },
]

export default function CallsPage() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">النداءات</h1>
            <p className="text-sm text-muted-foreground mt-1">سجل مكالمات واتساب الصوتية والمرئية.</p>
          </div>
          <Button variant="outline" className="gap-2 bg-transparent text-destructive hover:text-destructive">
            مسح السجل
          </Button>
        </div>

        <div className="border rounded-lg bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الهاتف</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">المدة</TableHead>
                <TableHead className="text-right">الوقت</TableHead>
                <TableHead className="text-left">إجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.map((call, i) => (
                <TableRow key={i}>
                  <TableCell dir="ltr" className="text-right font-medium">
                    {call.phone}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {call.type === "واردة" ? (
                        <PhoneIncoming className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <PhoneOutgoing className="h-3 w-3 text-primary" />
                      )}
                      <span className="text-sm">{call.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        call.status === "لم يرد"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-emerald-500/10 text-emerald-500"
                      }`}
                    >
                      {call.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm font-mono">{call.duration}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{call.time}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Phone className="h-4 w-4" />
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
