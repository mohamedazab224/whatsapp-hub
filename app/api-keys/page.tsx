import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Key, Plus, Copy, RefreshCcw, ShieldCheck, Eye } from "lucide-react"

export default function ApiKeysPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">مفاتيح واجهة برمجة التطبيقات (API Keys)</h1>
            <p className="text-sm text-muted-foreground mt-1">
              استخدم هذه المفاتيح لربط نظامك الخاص بالعزب هاب عبر API.
            </p>
          </div>
          <Button className="bg-primary gap-2">
            <Plus className="h-4 w-4" /> إنشاء مفتاح جديد
          </Button>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg flex gap-4 mb-8">
          <div className="h-10 w-10 bg-white rounded-lg border flex items-center justify-center text-amber-500 flex-shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-amber-800 text-sm">تنبيه أمني هام</h3>
            <p className="text-amber-700/80 text-xs mt-1 leading-relaxed">
              لا تشارك مفاتيح الـ API الخاصة بك مع أي شخص. أي شخص يمتلك هذه المفاتيح يمكنه الوصول إلى رسائلك وبيانات
              عملائك. نحن نوصي بتدوير المفاتيح بشكل دوري لزيادة الأمان.
            </p>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">مفاتيحك الحالية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "UberFix Production", key: "ka_live_xxxxxxxxxxxx4b8c", created: "٢٠٢٦/١/١" },
              { name: "Staging Environment", key: "ka_test_xxxxxxxxxxxx9a2f", created: "٢٠٢٦/١/٤" },
            ].map((apiKey, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-background rounded border flex items-center justify-center">
                    <Key className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{apiKey.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">تاريخ الإنشاء: {apiKey.created}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <code className="bg-background px-3 py-1.5 rounded border text-xs font-mono select-all">
                    {apiKey.key}
                  </code>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="نسخ المفتاح">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="إظهار المفتاح">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="حذف">
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
