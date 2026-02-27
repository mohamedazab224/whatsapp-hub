import { Suspense } from "react"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { VAEDashboardContent } from "@/components/vae/dashboard-content"
import { VAEHeader } from "@/components/vae/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "VAE Dashboard - لوحة المراقبة",
  description: "لوحة تحكم نظام توثيق الأعمال الميدانية",
}

export default async function VAEDashboardPage() {
  const supabase = await createSupabaseServerClient()

  // جلب بيانات المشاريع
  const { data: projects, error: projectsError } = await supabase
    .from("vae_projects")
    .select("*")
    .order("created_at", { ascending: false })

  // جلب آخر الصور المرفوعة
  const { data: recentMedia, error: mediaError } = await supabase
    .from("vae_media")
    .select("*")
    .eq("processing_status", "completed")
    .order("capture_time", { ascending: false })
    .limit(5)

  // جلب آخر تحليلات AI
  const { data: recentAnalysis, error: analysisError } = await supabase
    .from("vae_ai_analysis")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6 p-6">
      <VAEHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشاريع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">الصور المحللة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentAnalysis?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">جودة المتوسط</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentAnalysis && recentAnalysis.length > 0
                ? (recentAnalysis.reduce((sum, a) => sum + (a.quality_score || 0), 0) / recentAnalysis.length).toFixed(1)
                : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">مشاكل الأمان</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {recentAnalysis?.filter((a) => a.safety_issues && a.safety_issues.length > 0).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={<div>جاري التحميل...</div>}>
        <VAEDashboardContent projects={projects} recentMedia={recentMedia} recentAnalysis={recentAnalysis} />
      </Suspense>
    </div>
  )
}
