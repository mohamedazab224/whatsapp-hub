import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Set up Server-Sent Events (SSE)
    const encoder = new TextEncoder()
    let controller: ReadableStreamDefaultController<Uint8Array> | null = null

    const stream = new ReadableStream({
      async start(c) {
        controller = c
      },
    })

    // Simulate notifications (replace with real Supabase real-time subscription)
    ;(async () => {
      try {
        // Subscribe to new messages
        const subscription = supabase
          .channel(`user:${user.id}:messages`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
            },
            (payload) => {
              if (controller) {
                const notification = {
                  title: 'رسالة جديدة',
                  message: `رسالة من ${payload.new.sender_phone}`,
                  type: 'message',
                }
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(notification)}\n\n`)
                )
              }
            }
          )
          .subscribe()

        // Keep connection alive
        while (true) {
          await new Promise((resolve) => setTimeout(resolve, 30000))
          if (controller) {
            controller.enqueue(encoder.encode(': keepalive\n\n'))
          }
        }
      } catch (error) {
        console.error('[v0] Subscription error:', error)
        if (controller) {
          controller.close()
        }
      }
    })()

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[v0] Error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
