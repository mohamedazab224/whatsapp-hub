import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Globe, Lock, Bell } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="text-2xl font-bold mb-8">إعدادات المشروع</h1>

        <div className="grid gap-6 max-w-4xl">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">الإعدادات العامة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="project-name">اسم المشروع</Label>
                <Input id="project-name" defaultValue="أوبر فيكس" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timezone">المنطقة الزمنية</Label>
                <Input id="timezone" defaultValue="(GMT+02:00) Cairo" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">الإشعارات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>إشعارات الرسائل الواردة</Label>
                  <p className="text-xs text-muted-foreground">استقبل إشعارات فورية عند وصول رسالة جديدة.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>تنبيهات فشل الويبهوك</Label>
                  <p className="text-xs text-muted-foreground">تنبيه البريد الإلكتروني عند فشل تسليم البيانات.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">الأمان والخصوصية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>تشفير البيانات الطرفي</Label>
                  <p className="text-xs text-muted-foreground">تفعيل أعلى معايير التشفير لجميع المحادثات.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button
                variant="outline"
                className="w-full text-destructive border-destructive hover:bg-destructive/10 bg-transparent"
              >
                حذف المشروع نهائياً
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
