import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, message, type } = body

    if (!phone || !message || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseServer()
    
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          phone_number: phone,
          message: message,
          type: type,
          status: 'pending',
          created_at: new Date().toISOString(),
        }
      ])
      .select()

    if (error) {
      console.error('[Notifications] Error:', error)
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    console.error('[Notifications Send] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
