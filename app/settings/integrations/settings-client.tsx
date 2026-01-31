"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

type Project = { id: string; name: string }

type IntegrationRecord = {
  id: string
  type: string
  is_active: boolean
  config: { api_url?: string; api_key?: string } | null
}

const defaultTypes = ["erp", "crm", "helpdesk"]

export function IntegrationsSettingsClient({
  project,
  integrations,
}: {
  project: Project | null
  integrations: IntegrationRecord[]
}) {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const configs = defaultTypes.map((type) => {
    const existing = integrations.find((item) => item.type === type)
    return {
      type,
      is_active: existing?.is_active ?? false,
      api_url: existing?.config?.api_url || "",
      api_key: existing?.config?.api_key || "",
    }
  })

  const [state, setState] = useState(configs)

  const updateState = (type: string, updates: Partial<(typeof state)[number]>) => {
    setState((prev) => prev.map((item) => (item.type === type ? { ...item, ...updates } : item)))
  }

  const handleSave = async () => {
    if (!project) {
      toast({ title: "تعذر الحفظ", description: "لا يوجد مشروع محدد." })
      return
    }
    setIsSaving(true)
    const response = await fetch("/api/settings/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: project.id, integrations: state }),
    })
    setIsSaving(false)
    if (!response.ok) {
      toast({ title: "خطأ", description: "تعذر حفظ إعدادات التكامل." })
      return
    }
    toast({ title: "تم الحفظ", description: "تم تحديث إعدادات التكامل بنجاح." })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">إعدادات التكامل</h1>
        <p className="text-muted-foreground mt-2">تفعيل وإدارة تكاملات ERP/CRM/Helpdesk لكل مشروع.</p>
      </div>

      <div className="grid gap-6">
        {state.map((item) => (
          <Card key={item.type}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="uppercase">{item.type}</CardTitle>
                <Switch checked={item.is_active} onCheckedChange={(value) => updateState(item.type, { is_active: value })} />
              </div>
              <CardDescription>قم بإعداد عنوان الـ API والمفتاح للتكامل.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API URL</Label>
                <Input value={item.api_url} onChange={(event) => updateState(item.type, { api_url: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input value={item.api_key} onChange={(event) => updateState(item.type, { api_key: event.target.value })} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CardFooter className="justify-end py-4">
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </Button>
      </CardFooter>
    </div>
  )
}
