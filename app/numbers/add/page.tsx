import { Sidebar } from "@/components/dashboard/sidebar"
import { AddNumberFormClient } from "@/components/forms/add-number-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function AddNumberPage() {
  return (
    <div className="flex h-screen bg-background" dir="rtl">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة للوحة المعلومات
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">إضافة رقم واتساب جديد</h1>
            <p className="text-muted-foreground mt-2">أضف رقم واتساب جديد إلى نظامك لبدء الاستخدام</p>
          </div>

          <AddNumberFormClient />
        </div>
      </main>
    </div>
  )
}

