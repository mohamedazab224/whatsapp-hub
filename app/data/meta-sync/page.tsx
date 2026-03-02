import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Button } from '@/components/ui/button'
import { RefreshCcw, Download, Eye } from 'lucide-react'

export default async function MetaSyncPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: business } = await supabase.from('meta_business_accounts').select('*').single()
  const { data: app } = await supabase.from('meta_app_info').select('*').single()
  const { data: wabas } = await supabase.from('meta_wabas').select('*')
  const { data: phones } = await supabase.from('meta_phone_numbers').select('*')
  const { data: templates } = await supabase.from('meta_templates').select('*')

  return (
    <div className="flex h-screen bg-background" dir="rtl">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">مزامنة بيانات Meta</h1>
              <p className="text-sm text-muted-foreground">
                عرض وإدارة بيانات حساب Meta والتطبيق المتزامنة
              </p>
            </div>
            <Button className="gap-2">
              <RefreshCcw className="h-4 w-4" /> مزامنة الآن
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Business Info */}
            {business && (
              <div className="border rounded-lg p-6">
                <h3 className="font-bold mb-4">معلومات العمل</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">الاسم:</span> {business.business_name}</p>
                  <p><span className="font-medium">ID:</span> {business.business_id}</p>
                  <p><span className="font-medium">الحالة:</span> {business.verification_status}</p>
                  <p className="text-xs text-muted-foreground">
                    آخر تحديث: {new Date(business.last_synced).toLocaleString('ar-EG')}
                  </p>
                </div>
              </div>
            )}

            {/* App Info */}
            {app && (
              <div className="border rounded-lg p-6">
                <h3 className="font-bold mb-4">معلومات التطبيق</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">App ID:</span> {app.app_id}</p>
                  <p><span className="font-medium">النوع:</span> {app.app_type}</p>
                  <p><span className="font-medium">الحالة:</span> {app.is_valid ? '✅ صالح' : '❌ غير صالح'}</p>
                  <p className="text-xs text-muted-foreground">
                    الـ Scopes: {app.scopes?.length || 0}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="border rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-primary">{wabas?.length || 0}</div>
              <p className="text-sm text-muted-foreground">حسابات WABA</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-primary">{phones?.length || 0}</div>
              <p className="text-sm text-muted-foreground">أرقام الهواتف</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-primary">{templates?.length || 0}</div>
              <p className="text-sm text-muted-foreground">القوالب المعتمدة</p>
            </div>
          </div>

          {/* WABAs Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted p-4 border-b">
              <h3 className="font-bold">حسابات WABA</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="p-3 text-right">الاسم</th>
                    <th className="p-3 text-right">WABA ID</th>
                    <th className="p-3 text-right">المنطقة الزمنية</th>
                    <th className="p-3 text-right">العملة</th>
                    <th className="p-3 text-right">آخر تحديث</th>
                  </tr>
                </thead>
                <tbody>
                  {wabas?.map((waba) => (
                    <tr key={waba.id} className="border-b hover:bg-muted/30">
                      <td className="p-3">{waba.waba_name}</td>
                      <td className="p-3 font-mono text-xs">{waba.waba_id}</td>
                      <td className="p-3">{waba.timezone_id}</td>
                      <td className="p-3">{waba.currency}</td>
                      <td className="p-3 text-xs">
                        {new Date(waba.last_synced).toLocaleString('ar-EG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
