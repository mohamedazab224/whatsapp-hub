import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseAdmin } from "@/lib/supabase"
import { logger } from "@/lib/logger"

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return "—"
  const units = ["ب", "ك.ب", "م.ب", "ج.ب"]
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "—"
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
}

const getFileName = (path?: string | null) => {
  if (!path) return "—"
  const segments = path.split("/")
  return segments[segments.length - 1] || "—"
}

export default async function MediaPage() {
  const supabase = getSupabaseAdmin()
  const { data: mediaItems, error } = await supabase
    .from("media_files")
    .select("id, media_id, mime_type, file_size, public_url, storage_path, created_at, contact:contact_id(wa_id)")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    logger.error("Failed to load media files", { error })
  }

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
          {mediaItems?.length ? (
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
                {mediaItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium text-primary">{item.media_id || item.id}</div>
                      <div className="text-xs text-muted-foreground">{item.contact?.wa_id || "—"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{getFileName(item.storage_path)}</div>
                      <div className="text-xs text-muted-foreground">{item.mime_type || "—"}</div>
                    </TableCell>
                    <TableCell className="text-sm">{formatBytes(item.file_size)}</TableCell>
                    <TableCell>
                      <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-0.5 rounded font-medium">
                        {item.mime_type?.split("/")[0] || "ملف"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(item.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={item.public_url || "#"} target="_blank" rel="noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={item.public_url || "#"} download>
                            <Download className="h-4 w-4" />
                          </a>
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
          ) : (
            <div className="p-12 text-center text-sm text-muted-foreground">لا توجد وسائط متاحة حالياً.</div>
          )}
        </div>
      </main>
    </div>
  )
}
