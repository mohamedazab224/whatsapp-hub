"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Copy, Download, Trash2, Calendar } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function MediaPage() {
  const [period, setPeriod] = useState("today")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  // بيانات وهمية للعرض
  const mediaFiles = []
  const total = 1716

  return (
    <div className="flex h-screen bg-background text-right" dir="rtl">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold">واتساب ميديا</h1>
          </div>

          {/* Time filters */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={period === "today" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("today")}
            >
              اليوم
            </Button>
            <Button
              variant={period === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("week")}
            >
              هذا الأسبوع
            </Button>
            <Button
              variant={period === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("month")}
            >
              هذا الشهر
            </Button>
            <Button
              variant={period === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("all")}
            >
              الكل
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4" />
            </Button>
          </div>

          {/* Table */}
          <div className="border rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الزمن</TableHead>
                  <TableHead className="text-right">المحتوى</TableHead>
                  <TableHead className="text-right">الحجم</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">الاتصال</TableHead>
                  <TableHead className="text-right">الهاتف</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mediaFiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      لا توجد ملفات وسائط متاحة للفترة المحددة
                    </TableCell>
                  </TableRow>
                ) : (
                  mediaFiles.map((file: any) => (
                    <TableRow key={file.id}>
                      <TableCell className="text-sm">{file.time}</TableCell>
                      <TableCell className="font-mono text-xs">{file.name}</TableCell>
                      <TableCell className="text-sm">{file.size}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{file.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{file.contact}</TableCell>
                      <TableCell className="font-mono text-xs">{file.phone}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                          موافق
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                1 - 50 من حوالي {total} مشاركة
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled>
                    «
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    ‹
                  </Button>
                  <Button variant="default" size="sm">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <Button variant="outline" size="sm">
                    ...
                  </Button>
                  <Button variant="outline" size="sm">
                    16
                  </Button>
                  <Button variant="outline" size="sm">
                    ›
                  </Button>
                  <Button variant="outline" size="sm">
                    »
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
