"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MoreVertical, Plus, RefreshCcw, ExternalLink, Search, Send } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TemplateForm } from "@/components/templates/template-form"
import { useToast } from "@/hooks/use-toast"

type PhoneNumber = {
  id: string
  name?: string | null
  phone_number?: string | null
  phone_number_id?: string | null
}

type TemplateRecord = {
  id: string
  wa_template_name: string
  wa_template_code: string
  status: string
  category: string
  language: string
  preview_text: string
  variables_count: number
}

const statusOptions = [
  { value: "ALL", label: "All statuses" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "PENDING", label: "Pending" },
]

const categoryOptions = [
  { value: "ALL", label: "All categories" },
  { value: "UTILITY", label: "UTILITY" },
  { value: "MARKETING", label: "MARKETING" },
  { value: "OTP", label: "OTP" },
  { value: "AUTHENTICATION", label: "AUTHENTICATION" },
]

const statusBadge = (status: string) => {
  const normalized = status?.toUpperCase()
  if (normalized === "APPROVED") {
    return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Approved</Badge>
  }
  if (normalized === "REJECTED") {
    return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Rejected</Badge>
  }
  return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Pending</Badge>
}

export function TemplatesClient({ numbers }: { numbers: PhoneNumber[] }) {
  const { toast } = useToast()
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(numbers[0] || null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [templates, setTemplates] = useState<TemplateRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const hasNumbers = numbers.length > 0

  const filteredUrl = useMemo(() => {
    if (!selectedNumber?.id) return ""
    const params = new URLSearchParams({ phone_number_id: selectedNumber.id })
    if (search) params.set("search", search)
    if (statusFilter !== "ALL") params.set("status", statusFilter)
    if (categoryFilter !== "ALL") params.set("category", categoryFilter)
    return `/api/templates?${params.toString()}`
  }, [selectedNumber, search, statusFilter, categoryFilter])

  const loadTemplates = async () => {
    if (!filteredUrl) return
    setIsLoading(true)
    const response = await fetch(filteredUrl)
    if (!response.ok) {
      setTemplates([])
      setIsLoading(false)
      toast({ title: "تعذر التحميل", description: "تعذر تحميل القوالب لهذا الرقم.", variant: "destructive" })
      return
    }
    const data = await response.json()
    setTemplates(Array.isArray(data) ? data : [])
    setIsLoading(false)
  }

  useEffect(() => {
    void loadTemplates()
  }, [filteredUrl])

  const handleSync = async () => {
    if (!selectedNumber?.id) return
    setIsSyncing(true)
    const response = await fetch("/api/templates/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number_id: selectedNumber.id }),
    })
    setIsSyncing(false)
    if (!response.ok) {
      toast({ title: "فشلت المزامنة", description: "تحقق من صلاحيات واتساب.", variant: "destructive" })
      return
    }
    toast({ title: "تمت المزامنة", description: "تم تحديث القوالب بنجاح." })
    await loadTemplates()
  }

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/templates/${id}`, { method: "DELETE" })
    if (!response.ok) {
      toast({ title: "تعذر الحذف", description: "لم يتم حذف القالب.", variant: "destructive" })
      return
    }
    toast({ title: "تم الحذف", description: "تم حذف القالب بنجاح." })
    await loadTemplates()
  }

  const handleCopy = async (template: TemplateRecord) => {
    await navigator.clipboard.writeText(`${template.wa_template_name} • ${template.wa_template_code}`)
    toast({ title: "تم النسخ", description: "تم نسخ تفاصيل القالب." })
  }

  const handleSendTest = async (template: TemplateRecord) => {
    const to = window.prompt("أدخل رقم الهاتف لإرسال الرسالة التجريبية:")
    if (!to || !selectedNumber?.id) return
    const response = await fetch("/api/templates/send-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template_id: template.id,
        phone_number_id: selectedNumber.id,
        to,
      }),
    })
    if (!response.ok) {
      toast({ title: "فشل الإرسال", description: "تعذر إرسال الرسالة التجريبية.", variant: "destructive" })
      return
    }
    toast({ title: "تم الإرسال", description: "تم إرسال الرسالة التجريبية بنجاح." })
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">WhatsApp Templates</h1>
        <a
          href="https://business.whatsapp.com/products/message-templates"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
          Manage message templates for WhatsApp
        </a>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-4 border rounded-lg p-4 bg-card">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Phone number</label>
            <Select
              value={selectedNumber?.id || ""}
              onValueChange={(value) => setSelectedNumber(numbers.find((item) => item.id === value) || null)}
              disabled={!hasNumbers}
            >
              <SelectTrigger>
                <SelectValue placeholder={hasNumbers ? "اختر رقم الهاتف" : "أضف رقم واتساب أولًا"} />
              </SelectTrigger>
              <SelectContent>
                {numbers.map((number) => (
                  <SelectItem key={number.id} value={number.id}>
                    {number.name || "WhatsApp"} {number.phone_number ? `- ${number.phone_number}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pr-9"
                disabled={!selectedNumber}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[170px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 ml-auto">
              <Button className="bg-primary gap-2" onClick={() => setShowCreateDialog(true)} disabled={!selectedNumber}>
                <Plus className="h-4 w-4" /> Create
              </Button>
              <Button
                variant="outline"
                className="gap-2 bg-transparent"
                onClick={handleSync}
                disabled={!selectedNumber || isSyncing}
              >
                <RefreshCcw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                Sync
              </Button>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_2fr_auto] gap-4 px-6 py-3 border-b text-xs font-medium text-muted-foreground">
            <div>Name</div>
            <div>Status</div>
            <div>Category</div>
            <div>Language</div>
            <div>Preview</div>
            <div>Action</div>
          </div>
          <div className="divide-y">
            {isLoading && (
              <div className="space-y-3 px-6 py-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 md:grid md:grid-cols-[2fr_1fr_1fr_1fr_2fr_auto] md:items-center"
                  >
                    <div className="space-y-2">
                      <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="h-6 w-20 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-10 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-full max-w-[240px] rounded bg-muted animate-pulse" />
                    <div className="h-8 w-20 rounded bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            )}
            {!isLoading && templates.length === 0 && (
              <div className="py-10 text-center text-sm text-muted-foreground">
                {selectedNumber
                  ? "لا توجد قوالب لهذا الرقم بعد. يمكنك إنشاء قالب جديد أو المزامنة من واتساب."
                  : "اختر رقم واتساب لعرض القوالب المتاحة."}
              </div>
            )}
            {!isLoading &&
              templates.map((template) => (
                <div
                  key={template.id}
                  className="flex flex-col gap-4 px-6 py-4 text-sm md:grid md:grid-cols-[2fr_1fr_1fr_1fr_2fr_auto] md:items-center"
                >
                  <div className="space-y-1">
                    <div className="font-semibold">{template.wa_template_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {template.variables_count} params • {template.wa_template_code}
                    </div>
                  </div>
                  <div>{statusBadge(template.status)}</div>
                  <div className="text-xs">{template.category}</div>
                  <div className="text-xs">{template.language}</div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{template.preview_text || "—"}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleSendTest(template)}>
                      <Send className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleSendTest(template)}>إرسال رسالة تجريبية</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopy(template)}>نسخ التفاصيل</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(template.id)}>حذف القالب</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>إنشاء قالب جديد</DialogTitle>
            <DialogDescription>قم بإنشاء قالب رسالة جديد وإرساله لميتا للموافقة عليه</DialogDescription>
          </DialogHeader>
          <TemplateForm
            phoneNumberId={selectedNumber?.id || ""}
            onSuccess={async () => {
              setShowCreateDialog(false)
              await loadTemplates()
            }}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
