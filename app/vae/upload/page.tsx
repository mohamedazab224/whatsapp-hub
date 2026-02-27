import { VAEUploadForm } from "@/components/vae/upload-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "رفع صورة - VAE",
  description: "رفع صورة أو فيديو للموقع",
}

export default function VAEUploadPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">رفع صورة أو فيديو</h1>
        <p className="text-muted-foreground mt-2">يتم تحليل الصورة تلقائياً بواسطة AI</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>معلومات الرفع</CardTitle>
        </CardHeader>
        <CardContent>
          <VAEUploadForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>معلومات إضافية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>تم رفع الصور يتم معالجتها تلقائياً باستخدام:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>تحليل جودة الصورة</li>
            <li>كشف الكائنات والمواد</li>
            <li>كشف مشاكل الأمان</li>
            <li>كشف الهدر والمخلفات</li>
            <li>تحديد التقدم المتوقع</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
