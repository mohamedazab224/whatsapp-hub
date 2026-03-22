import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' })
    }

    console.log('[v0] Notifications stream started for user:', user.id)

    // Set up Server-Sent Events (SSE) with proper stream handling
    const encoder = new TextEncoder()
    let controller: ReadableStreamDefaultController<Uint8Array> | null = null
    let isStreamClosed = false

    const stream = new ReadableStream({
      async start(c) {
        controller = c

        // Send initial connection message
        c.enqueue(encoder.encode(': connected\n\n'))

        // Subscribe to new messages
        try {
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
                if (!isStreamClosed && controller) {
                  const notification = {
                    title: 'رسالة جديدة',
                    message: `رسالة من ${payload.new.sender_phone || 'مرسل'}`,
                    type: 'message',
                  }
                  try {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify(notification)}\n\n`)
                    )
                  } catch (e) {
                    console.error('[v0] Error enqueuing notification:', e)
                  }
                }
              }
            )
            .subscribe(async (status) => {
              console.log('[v0] Subscription status:', status)
              if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                isStreamClosed = true
                if (controller) {
                  controller.close()
                }
              }
            })

          // Keep connection alive with heartbeat
          const heartbeatInterval = setInterval(() => {
            if (!isStreamClosed && controller) {
              try {
                controller.enqueue(encoder.encode(': heartbeat\n\n'))
              } catch (e) {
                console.error('[v0] Heartbeat error:', e)
                clearInterval(heartbeatInterval)
                isStreamClosed = true
              }
            } else {
              clearInterval(heartbeatInterval)
            }
          }, 30000)

          // Cleanup on stream close
          const checkStream = setInterval(() => {
            if (isStreamClosed) {
              clearInterval(checkStream)
              clearInterval(heartbeatInterval)
              supabase.removeChannel(subscription)
            }
          }, 1000)
        } catch (error) {
          console.error('[v0] Subscription error:', error)
          isStreamClosed = true
          if (controller) {
            controller.close()
          }
        }
      },
      cancel() {
        console.log('[v0] Stream cancelled')
        isStreamClosed = true
      },
    })

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('[v0] Notifications stream error:', error)
    return new Response(
      `event: error\ndata: ${error instanceof Error ? error.message : 'Internal server error'}\n\n`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      }
    )
  }
}
