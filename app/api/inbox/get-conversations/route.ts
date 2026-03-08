import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's project
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (!project) {
      return NextResponse.json(
        { error: 'No project found' },
        { status: 404 }
      )
    }

    // Get conversations with latest message
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(
        `
        id,
        contact_id,
        status,
        unread_count,
        last_message_at,
        contacts(id, name, wa_id),
        messages(body, created_at)
      `
      )
      .eq('project_id', project.id)
      .order('last_message_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[v0] Error fetching conversations:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const formattedConversations = conversations.map((conv: any) => ({
      id: conv.id,
      contact_id: conv.contact_id,
      contact_name: conv.contacts?.name || 'Unknown',
      contact_phone: conv.contacts?.wa_id || '',
      last_message: conv.messages?.[0]?.body || 'No messages',
      last_message_at: conv.last_message_at,
      unread_count: conv.unread_count || 0,
      status: conv.status,
    }))

    return NextResponse.json({ conversations: formattedConversations })
  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
