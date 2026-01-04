import { Sidebar } from "@/components/dashboard/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function LogsPage() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">سجلات النظام (Logs)</h1>
            <p className="text-sm text-muted-foreground mt-1">تتبع جميع العمليات التقنية واستدعاءات API اللحظية.</p>
          </div>
        </div>

        <div className="border rounded-lg bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-right">الوقت</TableHead>
                <TableHead className="text-right">العملية</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">المصدر</TableHead>
                <TableHead className="text-left">المعرف</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                {
                  time: "12:45:01",
                  op: "API Authentication",
                  status: "Success",
                  source: "192.168.1.1",
                  id: "req_8492",
                },
                { time: "12:44:58", op: "Webhook Delivery", status: "Failed", source: "System", id: "whk_2931" },
                { time: "12:44:30", op: "Message Send", status: "Success", source: "Dashboard", id: "msg_9201" },
              ].map((log, i) => (
                <TableRow key={i} className="font-mono text-xs">
                  <TableCell>{log.time}</TableCell>
                  <TableCell>{log.op}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-0.5 rounded ${log.status === "Success" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}
                    >
                      {log.status}
                    </span>
                  </TableCell>
                  <TableCell>{log.source}</TableCell>
                  <TableCell className="text-primary">{log.id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}
