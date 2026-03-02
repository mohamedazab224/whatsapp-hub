import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { meta, business, wabas } = body

    if (!meta || !business || !wabas) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // حفظ معلومات Business
    const { error: businessError } = await supabase
      .from('meta_business_accounts')
      .upsert({
        business_id: business.id,
        business_name: business.name,
        verification_status: business.verification_status,
        created_time: business.created_time,
        meta_data: business,
        last_synced: new Date().toISOString(),
      }, { onConflict: 'business_id' })

    if (businessError) throw businessError

    // حفظ معلومات Meta App
    const { error: metaError } = await supabase
      .from('meta_app_info')
      .upsert({
        app_id: meta.app_id,
        app_type: meta.type,
        user_id: meta.user_id,
        is_valid: meta.is_valid,
        scopes: meta.scopes,
        granular_scopes: meta.granular_scopes,
        meta_data: meta,
        last_synced: new Date().toISOString(),
      }, { onConflict: 'app_id' })

    if (metaError) throw metaError

    // حفظ WABAs والأرقام والقوالب
    let wabasCount = 0
    let phonesCount = 0
    let templatesCount = 0

    for (const waba of wabas) {
      // حفظ WABA
      const { error: wabaError } = await supabase
        .from('meta_wabas')
        .upsert({
          waba_id: waba.id,
          business_id: business.id,
          waba_name: waba.info.name,
          timezone_id: waba.info.timezone_id,
          currency: waba.info.currency || 'USD',
          template_namespace: waba.info.message_template_namespace,
          meta_data: waba.info,
          last_synced: new Date().toISOString(),
        }, { onConflict: 'waba_id' })

      if (wabaError) throw wabaError
      wabasCount++

      // حفظ الأرقام
      if (waba.phones && Array.isArray(waba.phones)) {
        for (const phone of waba.phones) {
          const { error: phoneError } = await supabase
            .from('meta_phone_numbers')
            .upsert({
              phone_id: phone.id,
              waba_id: waba.id,
              display_phone_number: phone.display_phone_number,
              verified_name: phone.verified_name,
              quality_rating: phone.quality_rating,
              status: phone.status,
              account_mode: phone.account_mode,
              meta_data: phone,
              last_synced: new Date().toISOString(),
            }, { onConflict: 'phone_id' })

          if (phoneError) throw phoneError
          phonesCount++
        }
      }

      // حفظ القوالب
      if (waba.templates && Array.isArray(waba.templates)) {
        for (const template of waba.templates) {
          const { error: templateError } = await supabase
            .from('meta_templates')
            .upsert({
              template_id: template.id,
              waba_id: waba.id,
              template_name: template.name,
              language: template.language,
              status: template.status,
              category: template.category,
              components: template.components,
              parameter_format: template.parameter_format,
              meta_data: template,
              last_synced: new Date().toISOString(),
            }, { onConflict: 'template_id' })

          if (templateError) throw templateError
          templatesCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'تم مزامنة بيانات Meta بنجاح',
      stats: {
        wabas: wabasCount,
        phone_numbers: phonesCount,
        templates: templatesCount,
      },
    })
  } catch (error) {
    console.error('POST /api/meta/sync:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 })
  }
}
