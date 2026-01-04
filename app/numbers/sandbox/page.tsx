import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { MessageSquare, ExternalLink } from "lucide-react"
import { Plus } from "@/components/icons/plus"

export default function SandboxPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">رقم صندوق الرمل</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md border">
            <MessageSquare className="h-4 w-4" />
            <span>اختبر رسائل واتساب في بيئة صندوق رمل</span>
            <div className="h-4 w-4 border rounded-sm ml-2" />
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white rounded-lg border flex items-center justify-center text-emerald-500">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-700 font-medium">رسالة على واتساب</span>
                <span className="text-emerald-400">|</span>
                <span className="text-emerald-700 font-bold">صندوق الرمل: +56920403095</span>
                <ExternalLink className="h-3 w-3 text-emerald-400" />
              </div>
              <p className="text-emerald-600/80 text-xs">
                أضف رقم هاتفك أدناه لتبدأ في إرسال الرسائل النصية برقم صندوق الرمل
              </p>
            </div>
          </div>
        </div>

        <Button className="bg-primary gap-2 mb-12">
          <Plus className="h-4 w-4" /> ابدأ جلسة الاختبار
        </Button>

        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground text-sm text-center max-w-lg leading-relaxed">
            لم يتم العثور على جلسات صندوق مفتوح. أضف رقم هاتفك لتبدأ في إرسال الرسائل النصية برقم صندوق الرمل الخاص
            بالعزب هاب.
          </p>
        </div>
      </main>
    </div>
  )
}
