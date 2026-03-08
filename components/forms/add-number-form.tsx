"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react"
import { useNumbers } from "@/hooks/use-data"

export function AddNumberForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { mutate } = useNumbers()
  
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    type: "connected",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add number")
      }

      await response.json()
      
      // Reset form and show success
      setFormData({ name: "", phone_number: "", type: "connected" })
      setSuccess(true)
      
      // Revalidate numbers list
      await mutate()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
      
      onSuccess?.()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred"
      setError(errorMsg)
      console.error("[AddNumberForm]", errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>إضافة رقم واتساب جديد</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">تم إضافة الرقم بنجاح وهو قيد التفعيل</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">اسم الرقم *</Label>
            <Input
              id="name"
              placeholder="مثال: رقم المبيعات"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isLoading}
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="201234567890"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              required
              disabled={isLoading}
              pattern="[0-9+]+"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">نوع الرقم *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger disabled={isLoading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="connected">متصل (SIM)</SelectItem>
                <SelectItem value="digital">رقمي (API)</SelectItem>
                <SelectItem value="sandbox">اختبار (Sandbox)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !formData.name || !formData.phone_number}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                جاري الإضافة...
              </>
            ) : (
              "إضافة الرقم"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Export with client alias for server component imports
export const AddNumberFormClient = AddNumberForm
