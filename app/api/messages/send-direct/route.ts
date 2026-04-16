import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'

/**
 * Send WhatsApp Message Endpoint
 * Handles text messages, media, and template messages
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { phone_number_id, recipient, message, template_name } =
      await request.json()

    if (!phone_number_id || !recipient) {
      return NextResponse.json(
        { error: 'phone_number_id and recipient required' },
        { status: 400 }
      )
    }

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json(
        { error: 'WHATSAPP_ACCESS_TOKEN not configured' },
        { status: 500 }
      )
    }

    // Verify user owns this number
    const { data: whatsappNumber } = await supabase
      .from('whatsapp_numbers')
      .select('*')
      .eq('phone_number_id', phone_number_id)
      .single()

    if (!whatsappNumber) {
      return NextResponse.json(
        { error: 'WhatsApp number not found' },
        { status: 404 }
      )
    }

    let payload: any = {
      messaging_product: 'whatsapp',
      to: recipient.replace(/\D/g, ''),
      type: template_name ? 'template' : 'text',
    }

    if (template_name) {
      payload.template = {
        name: template_name,
      }
    } else if (message) {
      payload.text = {
        body: message,
      }
    }

    const sendRes = await fetch(
      `https://graph.instagram.com/v24.0/${phone_number_id}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'WhatsApp-Hub/1.0',
        },
        body: JSON.stringify(payload),
      }
    )

    if (!sendRes.ok) {
      const error = await sendRes.json()
      console.error('[v0] Meta API error:', error)
      return NextResponse.json(
        {
          error: 'Failed to send message',
          details: error.error?.message,
        },
        { status: 400 }
      )
    }

    const result = await sendRes.json()

    // Store message in database
    const { data: projectData } = await supabase
      .from('projects')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (projectData) {
      const project = projectData as unknown as { id: string }
      await supabase.from('messages').insert({
        project_id: project.id,
        phone_number_id,
        to_phone_id: recipient,
        direction: 'outbound',
        type: template_name ? 'template' : 'text',
        body: template_name || message,
        wamid: result.messages[0].id,
        status: 'sent',
      })
    }

    return NextResponse.json({
      success: true,
      message_id: result.messages[0].id,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Send message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
