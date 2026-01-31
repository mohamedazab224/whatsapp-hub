"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Brain, Save, Bot, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Project = { id: string; name: string }
type AiConfig = {
  provider?: string | null
  model?: string | null
  system_prompt?: string | null
  temperature?: number | null
  max_tokens?: number | null
  timeout_ms?: number | null
  is_active?: boolean | null
}

export function AISettingsClient({ project, aiConfig }: { project: Project | null; aiConfig: AiConfig | null }) {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isActive, setIsActive] = useState(aiConfig?.is_active ?? false)
  const [provider, setProvider] = useState(aiConfig?.provider || "openai")
  const [model, setModel] = useState(aiConfig?.model || "gpt-4o-mini")
  const [temperature, setTemperature] = useState(String(aiConfig?.temperature ?? 0.7))
  const [maxTokens, setMaxTokens] = useState(String(aiConfig?.max_tokens ?? 500))
  const [timeoutMs, setTimeoutMs] = useState(String(aiConfig?.timeout_ms ?? 15000))
  const [systemPrompt, setSystemPrompt] = useState(
    aiConfig?.system_prompt ||
      `أنت مساعد ذكي لخدمة العملاء في منصة "العزب هاب".\nمهمتك هي الرد على استفسارات العملاء بلباقة.`,
  )

  const handleSave = async () => {
    if (!project) {
      toast({ title: "تعذر الحفظ", description: "لا يوجد مشروع محدد." })
      return
    }
    setIsSaving(true)
    const response = await fetch("/api/settings/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: project.id,
        is_active: isActive,
        provider,
        model,
        temperature: Number(temperature),
        max_tokens: Number(maxTokens),
        timeout_ms: Number(timeoutMs),
        system_prompt: systemPrompt,
      }),
    })
    setIsSaving(false)
    if (!response.ok) {
      toast({ title: "خطأ", description: "تعذر حفظ إعدادات الذكاء الاصطناعي." })
      return
    }
    toast({ title: "تم الحفظ", description: "تم تحديث إعدادات الذكاء الاصطناعي بنجاح." })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">إعدادات الذكاء الاصطناعي</h1>
        <p className="text-muted-foreground mt-2">تخصيص سلوك الشات بوت ونماذج الذكاء الاصطناعي للمشروع الحالي.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-emerald-100 shadow-sm">
          <CardHeader className="border-b bg-emerald-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-emerald-600" />
                <CardTitle>حالة المساعد الذكي</CardTitle>
              </div>
              <Switch id="ai-status" checked={isActive} onCheckedChange={setIsActive} />
            </div>
            <CardDescription className="mt-1">تفعيل أو تعطيل الرد التلقائي عبر الذكاء الاصطناعي لهذا المشروع.</CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <CardTitle>نموذج الذكاء الاصطناعي</CardTitle>
              </div>
              <CardDescription>اختر المزود والنموذج الذي تفضله.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>مزود الخدمة</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المزود" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="xai">xAI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>النموذج (Model)</Label>
                <Input value={model} onChange={(event) => setModel(event.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <CardTitle>معايير الاستجابة</CardTitle>
              </div>
              <CardDescription>ضبط المعايير التقنية للمخرجات.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>درجة الإبداع (Temperature)</Label>
                <Input type="number" step="0.1" min="0" max="1" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>أقصى عدد للكلمات</Label>
                <Input type="number" value={maxTokens} onChange={(e) => setMaxTokens(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>المهلة الزمنية (ms)</Label>
                <Input type="number" value={timeoutMs} onChange={(e) => setTimeoutMs(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>التعليمات البرمجية (System Prompt)</CardTitle>
            <CardDescription>حدد هوية وطريقة رد الشات بوت.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="مثال: أنت مساعد ذكي..."
              className="min-h-[200px] leading-relaxed"
              value={systemPrompt}
              onChange={(event) => setSystemPrompt(event.target.value)}
            />
          </CardContent>
          <CardFooter className="border-t bg-muted/50 justify-end py-4">
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSave} disabled={isSaving}>
              <Save className="ml-2 h-4 w-4" />
              {isSaving ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
