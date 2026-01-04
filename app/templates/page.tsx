import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCcw, MessageSquare, ExternalLink } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TemplatesPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">قوالب واتساب</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>إدارة قوالب الرسائل على واتساب</span>
            <div className="h-4 w-4 border rounded-sm" />
          </div>
        </div>

        <div className="flex items-center justify-between mb-8 bg-card p-4 rounded-lg border">
          <div className="flex-1 max-w-md">
            <p className="text-xs font-medium text-muted-foreground mb-2">تكوين واتساب</p>
            <Select defaultValue="mohamed">
              <SelectTrigger>
                <SelectValue placeholder="اختر رقم الهاتف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mohamed">محمد عزاب +1 9564-379-208</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-transparent">
              <RefreshCcw className="h-4 w-4" /> قوالب التزامن
            </Button>
            <Button className="gap-2 bg-primary">
              <Plus className="h-4 w-4" /> إنشاء قالب
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-20 border rounded-lg bg-card">
          <div className="h-16 w-16 bg-muted rounded-xl flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold mb-2">لم يتم العثور على قوالب</h2>
          <p className="text-sm text-muted-foreground mb-8">
            أنشئ قوالب مباشرة هنا أو قم بمزامنة القوالب الموجودة من Meta WhatsApp Manager.
          </p>

          <div className="flex gap-4">
            <Button className="bg-primary gap-2">
              <Plus className="h-4 w-4" /> إنشاء قالب
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <RefreshCcw className="h-4 w-4" /> المزامنة من واتساب
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <ExternalLink className="h-4 w-4" /> الإدارة في مدير واتساب ميتا
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
