'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface WhatsAppNumber {
  id: string
  phone_number_id: string
  display_phone_number: string
  verified_name: string
  quality_rating: string
  is_active: boolean
  created_at: string
}

export default function NumbersPage() {
  const [numbers, setNumbers] = useState<WhatsAppNumber[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingNumber, setIsAddingNumber] = useState(false)
  const { toast } = useToast()

  const fetchNumbers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/whatsapp/numbers')
      if (!response.ok) throw new Error('فشل جلب الأرقام')
      const data = await response.json()
      setNumbers(data)
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل جلب الأرقام',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNumbers()
  }, [])

  const handleAddNumber = async () => {
    setIsAddingNumber(true)
    try {
      // فتح واجهة إضافة رقم جديد
      const phoneId = prompt('أدخل معرف رقم WhatsApp:')
      if (!phoneId) return

      const response = await fetch('/api/whatsapp/numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number_id: phoneId }),
      })

      if (!response.ok) throw new Error('فشل إضافة الرقم')
      
      toast({
        title: 'نجح',
        description: 'تم إضافة الرقم بنجاح',
      })
      
      fetchNumbers()
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل إضافة الرقم',
        variant: 'destructive',
      })
    } finally {
      setIsAddingNumber(false)
    }
  }

  const handleDeleteNumber = async (id: string) => {
    if (!confirm('هل تريد حذف هذا الرقم؟')) return

    try {
      const response = await fetch(`/api/whatsapp/numbers/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('فشل حذف الرقم')
      
      toast({
        title: 'نجح',
        description: 'تم حذف الرقم بنجاح',
      })
      
      fetchNumbers()
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل حذف الرقم',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الأرقام</h1>
          <p className="text-gray-500 mt-1">أرقام WhatsApp المتصلة بحسابك</p>
        </div>
        <Button onClick={handleAddNumber} disabled={isAddingNumber}>
          {isAddingNumber ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          إضافة رقم جديد
        </Button>
      </div>

      {numbers.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">لا توجد أرقام مضافة حالياً</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {numbers.map((number) => (
            <Card key={number.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{number.display_phone_number}</CardTitle>
                    <CardDescription>{number.verified_name || 'بدون اسم تحقق'}</CardDescription>
                  </div>
                  {number.is_active ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="text-gray-500">معرف الرقم</p>
                  <p className="font-mono text-xs break-all">{number.phone_number_id}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-500">تصنيف الجودة</p>
                  <p className="font-semibold">{number.quality_rating || 'لم يتم التقييم'}</p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteNumber(number.id)}
                  className="w-full"
                >
                  حذف
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
