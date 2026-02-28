import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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

    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!project) return NextResponse.json({ error: 'No project found' }, { status: 404 })

    const { data: numbers, error } = await supabase
      .from('whatsapp_numbers')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(numbers || [])
  } catch (error) {
    console.error('GET /api/whatsapp/numbers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phone_number_id } = await request.json()
    if (!phone_number_id) {
      return NextResponse.json({ error: 'phone_number_id is required' }, { status: 400 })
    }

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

    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!project) return NextResponse.json({ error: 'No project found' }, { status: 404 })

    const { data: number, error } = await supabase
      .from('whatsapp_numbers')
      .insert({
        project_id: project.id,
        phone_number_id,
        display_phone_number: phone_number_id,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(number, { status: 201 })
  } catch (error) {
    console.error('POST /api/whatsapp/numbers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
