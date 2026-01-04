import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, BookOpen } from "lucide-react"

export default function SupportPage() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="text-2xl font-bold mb-8">مركز الدعم والمساعدة</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center text-primary mb-2">
                <MessageSquare className="h-6 w-6" />
              </div>
              <CardTitle>تحدث مع فريقنا</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">فريق الدعم الفني متواجد لمساعدتك عبر واتساب مباشرة.</p>
              <Button className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600">بدء محادثة واتساب</Button>
            </CardContent>
          </Card>

          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center text-primary mb-2">
                <BookOpen className="h-6 w-6" />
              </div>
              <CardTitle>قاعدة المعرفة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">دروس تعليمية وشروحات لكيفية استخدام جميع ميزات العزب هاب.</p>
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                زيارة الوثائق
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
