"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { X, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TemplateVariable {
  name: string
  example: string
}

export function TemplateForm({
  phoneNumberId,
  onSuccess,
  onCancel,
}: {
  phoneNumberId: string
  onSuccess?: () => void
  onCancel?: () => void
}) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("UTILITY")
  const [language, setLanguage] = useState("ar")
  const [bodyText, setBodyText] = useState("")
  const [variables, setVariables] = useState<TemplateVariable[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const addVariable = () => {
    const match = bodyText.match(/\{\{(\w+)\}\}/g)
    if (!match) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "لم يتم العثور على متغيرات في النص. استخدم {{variable_name}}",
      })
      return
    }

    const varNames = match.map((v) => v.replace(/[{}]/g, ""))
    const newVars: TemplateVariable[] = varNames.map((name) => ({
      name,
      example: "",
    }))
    setVariables(newVars)
  }

  const handleSubmit = async () => {
    if (!phoneNumberId) {
      toast({
        variant: "destructive",
        title: "رقم غير محدد",
        description: "يرجى اختيار رقم واتساب قبل إنشاء القالب.",
      })
      return
    }

    if (!name || !bodyText) {
      toast({
        variant: "destructive",
        title: "بيانات ناقصة",
        description: "يرجى إدخال اسم القالب والمحتوى",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Build components
      const components: any[] = [
        {
          type: "BODY",
          text: bodyText,
        },
      ]

      // Add examples if variables exist
      if (variables.length > 0) {
        const exampleParams = variables.map((v) => v.example || "example")
        components[0].example = {
          body_text: [exampleParams],
        }
      }

      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number_id: phoneNumberId,
          name: name.toLowerCase().replace(/\s+/g, "_"),
          category,
          language,
          components,
          body_text: bodyText,
        }),
      })
      if (!response.ok) {
        throw new Error("فشل إنشاء القالب")
      }

      toast({
        title: "تم الإرسال بنجاح",
        description: "تم إرسال القالب لميتا للمراجعة",
      })

      onSuccess?.()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "فشل الإرسال",
        description: error.message || "حدث خطأ أثناء إرسال القالب",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6 space-y-6" dir="rtl">
      <div className="space-y-2">
        <Label htmlFor="template-name">اسم القالب</Label>
        <Input id="template-name" placeholder="order_created" value={name} onChange={(e) => setName(e.target.value)} />
        <p className="text-xs text-muted-foreground">يجب أن يكون بالإنجليزية وبدون مسافات</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">الفئة</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTILITY">خدمي (UTILITY)</SelectItem>
              <SelectItem value="MARKETING">تسويقي (MARKETING)</SelectItem>
              <SelectItem value="AUTHENTICATION">مصادقة (AUTHENTICATION)</SelectItem>
              <SelectItem value="OTP">OTP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">اللغة</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ar">العربية (ar)</SelectItem>
              <SelectItem value="en">الإنجليزية (en)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="body-text">نص الرسالة</Label>
        <Textarea
          id="body-text"
          placeholder="مرحباً {{customer_name}}، تم استلام طلبك رقم {{order_id}} بنجاح."
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          rows={6}
          className="font-sans"
        />
        <p className="text-xs text-muted-foreground">
          استخدم {`{{variable_name}}`} لإضافة متغيرات. لا تضع المتغير في بداية أو نهاية النص.
        </p>
      </div>

      {variables.length === 0 && (
        <Button type="button" variant="outline" onClick={addVariable} className="w-full bg-transparent">
          <Plus className="h-4 w-4 ml-2" />
          استخراج المتغيرات
        </Button>
      )}

      {variables.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>أمثلة المتغيرات</Label>
            <Button type="button" variant="ghost" size="sm" onClick={() => setVariables([])} className="h-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          {variables.map((variable, index) => (
            <div key={index} className="flex gap-2">
              <Input value={variable.name} disabled className="flex-1" />
              <Input
                placeholder="مثال"
                value={variable.example}
                onChange={(e) => {
                  const newVars = [...variables]
                  newVars[index].example = e.target.value
                  setVariables(newVars)
                }}
                className="flex-1"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-primary">
          {isSubmitting ? "جاري الإرسال..." : "إرسال للموافقة"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 bg-transparent"
        >
          إلغاء
        </Button>
      </div>
    </Card>
  )
}
