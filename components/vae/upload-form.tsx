"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Upload, Loader2 } from "lucide-react"

export function VAEUploadForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!file) {
      toast({ description: "من فضلك اختر صورة أو فيديو", variant: "destructive" })
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("work_item_id", (document.getElementById("work_item_id") as HTMLInputElement)?.value || "")
      formData.append("site_id", (document.getElementById("site_id") as HTMLInputElement)?.value || "")
      formData.append("photographer_name", (document.getElementById("photographer_name") as HTMLInputElement)?.value || "")
      formData.append("notes", (document.getElementById("notes") as HTMLTextAreaElement)?.value || "")

      const response = await fetch("/api/vae/media/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        toast({ description: data.error || "فشل الرفع", variant: "destructive" })
        return
      }

      toast({ description: "تم رفع الصورة بنجاح! جاري تحليلها بـ AI..." })

      // إعادة تعيين النموذج
      setFile(null)
      ;(document.getElementById("upload-form") as HTMLFormElement)?.reset()
    } catch (error) {
      toast({ description: "حدث خطأ أثناء الرفع", variant: "destructive" })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form id="upload-form" onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="site_id" className="block text-sm font-medium mb-1">
          معرف الموقع
        </label>
        <Input id="site_id" placeholder="مثال: SITE-001" required />
      </div>

      <div>
        <label htmlFor="work_item_id" className="block text-sm font-medium mb-1">
          معرف العمل
        </label>
        <Input id="work_item_id" placeholder="مثال: WORK-001" required />
      </div>

      <div>
        <label htmlFor="photographer_name" className="block text-sm font-medium mb-1">
          اسم المصور
        </label>
        <Input id="photographer_name" placeholder="اسم الشخص الذي التقط الصورة" />
      </div>

      <div>
        <label htmlFor="file-upload" className="block text-sm font-medium mb-1">
          الصورة أو الفيديو
        </label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition">
          <input
            id="file-upload"
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            {file ? (
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">اضغط لتغيير الملف</p>
              </div>
            ) : (
              <div>
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="font-medium">اضغط لرفع صورة أو فيديو</p>
                <p className="text-sm text-muted-foreground">أو اسحبها إلى هنا</p>
              </div>
            )}
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          ملاحظات
        </label>
        <Textarea id="notes" placeholder="أضف أي ملاحظات حول الصورة..." />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            جاري الرفع...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            رفع الصورة
          </>
        )}
      </Button>
    </form>
  )
}
