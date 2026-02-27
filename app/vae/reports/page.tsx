import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VAEReportsClient } from "@/components/vae/reports-client"

export const metadata = {
  title: "التقارير - VAE",
  description: "تقارير تحليل الأعمال الميدانية",
}

export default function VAEReportsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">التقارير والإحصائيات</h1>
        <p className="text-muted-foreground mt-2">تحليلات شاملة للأعمال الميدانية</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تقارير الموقع</CardTitle>
        </CardHeader>
        <CardContent>
          <VAEReportsClient />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المعلومات المتضمنة في التقرير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">إحصائيات الجودة</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>متوسط جودة الصور</li>
                <li>توزيع الجودة (ممتاز/جيد/ضعيف)</li>
                <li>مشاكل الجودة المكتشفة</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">إحصائيات الأمان</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>عدد مشاكل الأمان المكتشفة</li>
                <li>أنواع المشاكل</li>
                <li>التوصيات الأمنية</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">إحصائيات الهدر</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>عدد حوادث الهدر المكتشفة</li>
                <li>أنواع الهدر</li>
                <li>التوصيات لتقليل الهدر</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">إحصائيات التقدم</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>متوسط نسبة التقدم</li>
                <li>الكائنات المكتشفة</li>
                <li>المراحل المكتملة</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
