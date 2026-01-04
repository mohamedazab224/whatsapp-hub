import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { Eye, Copy, Download, Trash2, Calendar } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const mediaItems = Array(10).fill({
  id: "6a395b49",
  phone: "201004006620",
  file: "image_570df9698289.jpeg",
  size: "57.0 كيلوبايت",
  type: "صورة",
  receivedAt: "1:14:53 ص ٢٠٢٥/١/٤",
})

export default function MediaPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">واتساب ميديا</h1>
            <p className="text-sm text-muted-foreground mt-1">
              تصفح المرفقات الإعلامية عبر جميع المحادثات. قم بتنزيل أو إزالة الوسائط دون حذف الرسالة الأصلية.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">وكيل العزب</span>
            <div className="h-6 w-6 bg-primary rounded" />
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex bg-muted p-1 rounded-md">
            <Button variant="ghost" size="sm" className="h-8 text-xs bg-background shadow-sm">
              كل الزمن
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              اليوم
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              آخر 7 أيام
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              آخر 30 يوما
            </Button>
          </div>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Calendar className="h-4 w-4" /> مجموعة مخصصة
          </Button>
          <div className="w-48">
            <Select defaultValue="all">
              <SelectTrigger size="sm">
                <SelectValue placeholder="جميع الأنواع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="image">صور</SelectItem>
                <SelectItem value="video">فيديو</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-lg bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الرسالة</TableHead>
                <TableHead className="text-right">الملف</TableHead>
                <TableHead className="text-right">الحجم</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">تم الاستلام</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mediaItems.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="font-medium text-primary">{item.id}</div>
                    <div className="text-xs text-muted-foreground">{item.phone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{item.file}</div>
                    <div className="text-xs text-muted-foreground">صورة/JPEG</div>
                  </TableCell>
                  <TableCell className="text-sm">{item.size}</TableCell>
                  <TableCell>
                    <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-0.5 rounded font-medium">
                      صورة
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.receivedAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
