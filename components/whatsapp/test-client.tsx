"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, AlertCircle, Loader2, Settings, TestTube } from "lucide-react"

interface ApiCredentials {
  accessToken: string
  phoneNumberId: string
  businessAccountId: string
  appSecret: string
}

interface TestResult {
  name: string
  status: "success" | "error" | "pending"
  message: string
  timestamp: string
}

export function WhatsAppTestClient() {
  const [credentials, setCredentials] = useState<ApiCredentials>({
    accessToken: process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN || "",
    phoneNumberId: process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID || "",
    businessAccountId: process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_ACCOUNT_ID || "",
    appSecret: "",
  })

  const [showDialog, setShowDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [localCreds, setLocalCreds] = useState<ApiCredentials>(credentials)

  const handleSaveCredentials = () => {
    setCredentials(localCreds)
    setShowDialog(false)
    alert("تم حفظ البيانات في الجلسة الحالية")
  }

  const testAccessToken = async () => {
    setIsLoading(true)
    setResults((prev) => [...prev, { name: "اختبار التوكن", status: "pending", message: "جارٍ الاختبار...", timestamp: new Date().toLocaleString("ar-SA") }])

    try {
      const response = await fetch(`https://graph.instagram.com/v24.0/me?access_token=${credentials.accessToken}`)
      const data = await response.json()

      if (response.ok && data.id) {
        setResults((prev) => [
          ...prev.slice(0, -1),
          { name: "اختبار التوكن", status: "success", message: `توكن صحيح - معرف المستخدم: ${data.id}`, timestamp: new Date().toLocaleString("ar-SA") },
        ])
      } else {
        throw new Error(data.error?.message || "فشل التحقق من التوكن")
      }
    } catch (error) {
      setResults((prev) => [
        ...prev.slice(0, -1),
        {
          name: "اختبار التوكن",
          status: "error",
          message: error instanceof Error ? error.message : "حدث خطأ في الاختبار",
          timestamp: new Date().toLocaleString("ar-SA"),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const testPhoneNumber = async () => {
    setIsLoading(true)
    setResults((prev) => [...prev, { name: "اختبار رقم الهاتف", status: "pending", message: "جارٍ الاختبار...", timestamp: new Date().toLocaleString("ar-SA") }])

    try {
      const response = await fetch(`https://graph.instagram.com/v24.0/${credentials.phoneNumberId}?access_token=${credentials.accessToken}`)
      const data = await response.json()

      if (response.ok) {
        setResults((prev) => [
          ...prev.slice(0, -1),
          {
            name: "اختبار رقم الهاتف",
            status: "success",
            message: `الرقم صحيح - الحالة: ${data.status || "نشط"}`,
            timestamp: new Date().toLocaleString("ar-SA"),
          },
        ])
      } else {
        throw new Error(data.error?.message || "فشل التحقق من رقم الهاتف")
      }
    } catch (error) {
      setResults((prev) => [
        ...prev.slice(0, -1),
        {
          name: "اختبار رقم الهاتف",
          status: "error",
          message: error instanceof Error ? error.message : "حدث خطأ في الاختبار",
          timestamp: new Date().toLocaleString("ar-SA"),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const testWebhook = async () => {
    setIsLoading(true)
    setResults((prev) => [...prev, { name: "اختبار Webhook", status: "pending", message: "جارٍ الاختبار...", timestamp: new Date().toLocaleString("ar-SA") }])

    try {
      const response = await fetch("/api/webhook", { method: "GET" })

      if (response.ok || response.status === 403) {
        setResults((prev) => [
          ...prev.slice(0, -1),
          {
            name: "اختبار Webhook",
            status: "success",
            message: "الـ Webhook يستجيب بشكل صحيح",
            timestamp: new Date().toLocaleString("ar-SA"),
          },
        ])
      } else {
        throw new Error("الـ Webhook لا يستجيب")
      }
    } catch (error) {
      setResults((prev) => [
        ...prev.slice(0, -1),
        {
          name: "اختبار Webhook",
          status: "error",
          message: error instanceof Error ? error.message : "حدث خطأ في الاختبار",
          timestamp: new Date().toLocaleString("ar-SA"),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const testMetaApp = async () => {
    setIsLoading(true)
    setResults((prev) => [...prev, { name: "اختبار تطبيق Meta", status: "pending", message: "جارٍ الاختبار...", timestamp: new Date().toLocaleString("ar-SA") }])

    try {
      const response = await fetch(`https://graph.instagram.com/v24.0/${credentials.businessAccountId}?access_token=${credentials.accessToken}`)
      const data = await response.json()

      if (response.ok) {
        setResults((prev) => [
          ...prev.slice(0, -1),
          {
            name: "اختبار تطبيق Meta",
            status: "success",
            message: `حساب Meta صحيح - المعرف: ${data.id || credentials.businessAccountId}`,
            timestamp: new Date().toLocaleString("ar-SA"),
          },
        ])
      } else {
        throw new Error(data.error?.message || "فشل التحقق من حساب Meta")
      }
    } catch (error) {
      setResults((prev) => [
        ...prev.slice(0, -1),
        {
          name: "اختبار تطبيق Meta",
          status: "error",
          message: error instanceof Error ? error.message : "حدث خطأ في الاختبار",
          timestamp: new Date().toLocaleString("ar-SA"),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const runAllTests = async () => {
    setResults([])
    await testAccessToken()
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await testPhoneNumber()
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await testMetaApp()
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await testWebhook()
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">اختبار WhatsApp API</h1>
          <p className="text-muted-foreground mt-2">اختبر التوكن والأرقام وحالة تطبيق Meta</p>
        </div>
        <Button onClick={() => setShowDialog(true)} variant="outline" gap-2>
          <Settings className="h-4 w-4" /> إعدادات البيانات
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">حالة التوكن</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-mono bg-muted p-2 rounded truncate mb-3">
              {credentials.accessToken.substring(0, 20)}...
            </div>
            <Button onClick={testAccessToken} disabled={isLoading || !credentials.accessToken} className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />} اختبر التوكن
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">رقم الهاتف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-mono bg-muted p-2 rounded mb-3">{credentials.phoneNumberId}</div>
            <Button onClick={testPhoneNumber} disabled={isLoading || !credentials.phoneNumberId} className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />} اختبر الرقم
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">حساب Meta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-mono bg-muted p-2 rounded mb-3">{credentials.businessAccountId}</div>
            <Button onClick={testMetaApp} disabled={isLoading || !credentials.businessAccountId} className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />} اختبر الحساب
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Webhook</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground p-2 rounded mb-3">اختبر اتصال الـ Webhook</div>
            <Button onClick={testWebhook} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />} اختبر الـ Webhook
            </Button>
          </CardContent>
        </Card>
      </div>

      <Button onClick={runAllTests} disabled={isLoading} size="lg" className="w-full mb-8">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TestTube className="h-4 w-4 mr-2" />}
        تشغيل جميع الاختبارات
      </Button>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>نتائج الاختبارات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.map((result, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 border rounded-lg bg-muted/30">
                {result.status === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />}
                {result.status === "error" && <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />}
                {result.status === "pending" && <Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{result.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{result.message}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{result.timestamp}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إعدادات بيانات WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>التوكن</Label>
              <Input
                type="password"
                value={localCreds.accessToken}
                onChange={(e) => setLocalCreds({ ...localCreds, accessToken: e.target.value })}
                placeholder="أدخل التوكن"
              />
            </div>
            <div>
              <Label>رقم الهاتف</Label>
              <Input
                value={localCreds.phoneNumberId}
                onChange={(e) => setLocalCreds({ ...localCreds, phoneNumberId: e.target.value })}
                placeholder="أدخل رقم الهاتف"
              />
            </div>
            <div>
              <Label>معرف حساب Meta</Label>
              <Input
                value={localCreds.businessAccountId}
                onChange={(e) => setLocalCreds({ ...localCreds, businessAccountId: e.target.value })}
                placeholder="أدخل معرف الحساب"
              />
            </div>
            <div>
              <Label>سر التطبيق</Label>
              <Input
                type="password"
                value={localCreds.appSecret}
                onChange={(e) => setLocalCreds({ ...localCreds, appSecret: e.target.value })}
                placeholder="أدخل سر التطبيق"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveCredentials} className="flex-1">
                حفظ
              </Button>
              <Button onClick={() => setShowDialog(false)} variant="outline" className="flex-1">
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
