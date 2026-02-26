import type { VAEProject, VAEMedia, VAEAIAnalysis } from "@/lib/types/vae"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Image, AlertTriangle, TrendingUp } from "lucide-react"

interface VAEDashboardContentProps {
  projects: VAEProject[] | null
  recentMedia: VAEMedia[] | null
  recentAnalysis: VAEAIAnalysis[] | null
}

export function VAEDashboardContent({ projects, recentMedia, recentAnalysis }: VAEDashboardContentProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recent Media */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              آخر الصور المرفوعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMedia && recentMedia.length > 0 ? (
                recentMedia.map((media) => (
                  <div key={media.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted">
                    <div>
                      <p className="font-medium">{media.original_filename}</p>
                      <p className="text-sm text-muted-foreground">{media.photographer_name || "مجهول"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(media.capture_time).toLocaleString("ar-SA")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                          media.processing_status === "completed"
                            ? "bg-green-100 text-green-800"
                            : media.processing_status === "processing"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {media.processing_status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">لا توجد صور حالياً</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Safety Issues & Issues */}
      <div className="space-y-6">
        {/* Safety Issues */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              مشاكل الأمان
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentAnalysis
                ?.filter((a) => a.safety_issues && a.safety_issues.length > 0)
                .slice(0, 3)
                .map((analysis) => (
                  <div key={analysis.id} className="text-sm">
                    {analysis.safety_issues?.map((issue, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-red-600">●</span>
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                ))}
              {!recentAnalysis?.some((a) => a.safety_issues && a.safety_issues.length > 0) && (
                <p className="text-sm text-green-600">لا توجد مشاكل أمان مكتشفة</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quality Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              متوسط الجودة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {recentAnalysis && recentAnalysis.length > 0
                ? (recentAnalysis.reduce((sum, a) => sum + (a.quality_score || 0), 0) / recentAnalysis.length).toFixed(1)
                : "N/A"}
              %
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              بناءً على {recentAnalysis?.length || 0} تحليل
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>المشاريع النشطة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">كود المشروع</th>
                    <th className="text-left py-2 px-4">اسم المشروع</th>
                    <th className="text-left py-2 px-4">الحالة</th>
                    <th className="text-left py-2 px-4">تاريخ البدء</th>
                  </tr>
                </thead>
                <tbody>
                  {projects && projects.length > 0 ? (
                    projects.slice(0, 5).map((project) => (
                      <tr key={project.id} className="border-b hover:bg-muted">
                        <td className="py-2 px-4 font-mono text-xs">{project.project_code}</td>
                        <td className="py-2 px-4">{project.project_name}</td>
                        <td className="py-2 px-4">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              project.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {project.status}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          {project.start_date ? new Date(project.start_date).toLocaleDateString("ar-SA") : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-muted-foreground">
                        لا توجد مشاريع
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
