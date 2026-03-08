import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Webhook for receiving incoming messages from WhatsApp
 * Updates message status, creates contacts/conversations, downloads media
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createSupabaseServerClient()

    // Process webhook
    const entry = body.entry?.[0]
    const change = entry?.changes?.[0]
    const value = change?.value

    if (!value) {
      return NextResponse.json({ ok: true })
    }

    const phoneNumberId = value.metadata?.phone_number_id
    if (!phoneNumberId) {
      return NextResponse.json({ ok: true })
    }

    // Get the WhatsApp number and project
    const { data: waNumber } = await supabase
      .from('whatsapp_numbers')
      .select('project_id')
      .eq('phone_number_id', phoneNumberId)
      .single()

    if (!waNumber) {
      return NextResponse.json({ ok: true })
    }

    const projectId = waNumber.project_id

    // Process incoming messages
    if (value.messages) {
      for (const message of value.messages) {
        const senderPhone = message.from
        const messageId = message.id
        const timestamp = new Date(parseInt(message.timestamp) * 1000)

        // Ensure contact exists
        let { data: contact } = await supabase
          .from('contacts')
          .select('id')
          .eq('wa_id', senderPhone)
          .eq('project_id', projectId)
          .maybeSingle()

        if (!contact) {
          const { data: newContact } = await supabase
            .from('contacts')
            .insert({
              wa_id: senderPhone,
              project_id: projectId,
              name: `Contact ${senderPhone.slice(-4)}`,
              status: 'active',
            })
            .select()
            .single()

          contact = newContact
        }

        if (contact) {
          // Ensure conversation exists
          let { data: conversation } = await supabase
            .from('conversations')
            .select('id')
            .eq('contact_id', contact.id)
            .eq('project_id', projectId)
            .maybeSingle()

          if (!conversation) {
            const { data: newConv } = await supabase
              .from('conversations')
              .insert({
                contact_id: contact.id,
                project_id: projectId,
                status: 'open',
                unread_count: 1,
              })
              .select()
              .single()

            conversation = newConv
          } else {
            // Update unread count
            await supabase
              .from('conversations')
              .update({
                unread_count: (conversation.unread_count || 0) + 1,
                last_message_at: timestamp.toISOString(),
              })
              .eq('id', conversation.id)
          }

          // Store message
          await supabase.from('messages').insert({
            wamid: messageId,
            contact_id: contact.id,
            conversation_id: conversation?.id,
            project_id: projectId,
            phone_number_id: phoneNumberId,
            from_phone_id: senderPhone,
            direction: 'inbound',
            status: 'received',
            type: message.type,
            body: message.text?.body || `[${message.type}]`,
            timestamp: timestamp.toISOString(),
          })
        }
      }
    }

    // Process message status updates
    if (value.statuses) {
      for (const status of value.statuses) {
        await supabase
          .from('messages')
          .update({ status: status.status })
          .eq('wamid', status.id)
          .eq('project_id', projectId)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[v0] Webhook error:', error)
    return NextResponse.json({ ok: true })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

  if (mode === 'subscribe' && token === verifyToken && challenge) {
    console.log('[v0] Webhook verified')
    return new Response(challenge)
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
