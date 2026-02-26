"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Download, Loader2 } from "lucide-react"

export function VAEReportsClient() {
  const [isLoading, setIsLoading] = useState(false)
  const [report, setReport] = useState<any>(null)
  const { toast } = useToast()

  const handleGenerateReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const siteId = (document.getElementById("site_id") as HTMLInputElement)?.value
    const reportType = (document.getElementById("report_type") as HTMLSelectElement)?.value || "daily"
    const reportDate = (document.getElementById("report_date") as HTMLInputElement)?.value

    if (!siteId) {
      toast({ description: "من فضلك أدخل معرف الموقع", variant: "destructive" })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/vae/reports/generate", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      // تمرير المعاملات كـ query parameters
      const url = new URL("/api/vae/reports/generate", window.location.origin)
      url.searchParams.append("site_id", siteId)
      url.searchParams.append("type", reportType)
      if (reportDate) {
        url.searchParams.append("date", reportDate)
      }

      const reportResponse = await fetch(url.toString())
      const reportData = await reportResponse.json()

      if (!reportResponse.ok) {
        toast({ description: reportData.error || "فشل إنشاء التقرير", variant: "destructive" })
        return
      }

      setReport(reportData)
      toast({ description: "تم إنشاء التقرير بنجاح" })
    } catch (error) {
      toast({ description: "حدث خطأ أثناء إنشاء التقرير", variant: "destructive" })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadReport = () => {
    if (!report) return

    const reportContent = formatReportAsText(report)
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(reportContent))
    element.setAttribute("download", `report-${report.report_date}.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleGenerateReport} className="space-y-4 p-4 border rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="site_id" className="block text-sm font-medium mb-1">
              معرف الموقع
            </label>
            <Input id="site_id" placeholder="مثال: SITE-001" required />
          </div>

          <div>
            <label htmlFor="report_type" className="block text-sm font-medium mb-1">
              نوع التقرير
            </label>
            <select
              id="report_type"
              className="w-full px-3 py-2 border rounded-md border-input bg-background"
              defaultValue="daily"
            >
              <option value="daily">يومي</option>
              <option value="weekly">أسبوعي</option>
              <option value="monthly">شهري</option>
            </select>
          </div>

          <div>
            <label htmlFor="report_date" className="block text-sm font-medium mb-1">
              التاريخ
            </label>
            <Input id="report_date" type="date" />
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              جاري إنشاء التقرير...
            </>
          ) : (
            "إنشاء التقرير"
          )}
        </Button>
      </form>

      {report && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">التقرير المُنشأ</h3>
            <Button onClick={handleDownloadReport} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              تحميل
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي الصور</p>
              <p className="text-2xl font-bold">{report.media_count}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">متوسط الجودة</p>
              <p className="text-2xl font-bold">{report.average_quality_score}%</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">التقدم المتوقع</p>
              <p className="text-2xl font-bold">{report.statistics?.averageProgress}%</p>
            </div>

            {report.statistics?.wasteIncidents !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">حوادث الهدر</p>
                <p className="text-2xl font-bold text-orange-600">{report.statistics.wasteIncidents}</p>
              </div>
            )}

            {report.statistics?.safetyIssues !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">مشاكل الأمان</p>
                <p className="text-2xl font-bold text-red-600">{report.statistics.safetyIssues}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium mb-2">الملخص</p>
            <p className="text-sm text-muted-foreground">{report.progress_summary}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function formatReportAsText(report: any): string {
  return `
تقرير تحليل الأعمال الميدانية
================================

التاريخ: ${report.report_date}
نوع التقرير: ${report.report_type}
معرف الموقع: ${report.site_id}

الإحصائيات الأساسية:
-------------------
إجمالي الصور: ${report.media_count}
متوسط جودة الصور: ${report.average_quality_score}%
متوسط التقدم: ${report.statistics?.averageProgress}%

إحصائيات الأمان والجودة:
------------------------
حوادث الهدر: ${report.statistics?.wasteIncidents}
مشاكل الأمان: ${report.statistics?.safetyIssues}

توزيع الجودة:
-----------
ممتاز (80+): ${report.statistics?.quality_distribution?.excellent}
جيد (60-79): ${report.statistics?.quality_distribution?.good}
ضعيف (<60): ${report.statistics?.quality_distribution?.fair}

الملخص:
------
${report.progress_summary}
  `.trim()
}
