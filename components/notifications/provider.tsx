'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'message' | 'status' | 'alert'
  read: boolean
  timestamp: Date
}

export function NotificationProvider() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const eventSourceRef = useRef<EventSource | null>(null)
  const retryCountRef = useRef(0)
  const maxRetries = 5

  useEffect(() => {
    const connectStream = () => {
      try {
        console.log('[v0] Connecting to notifications stream...')
        const eventSource = new EventSource('/api/notifications/stream')
        eventSourceRef.current = eventSource

        eventSource.addEventListener('open', () => {
          console.log('[v0] Notifications stream connected')
          retryCountRef.current = 0
        })

        eventSource.onmessage = (event) => {
          try {
            // Skip heartbeat and keepalive messages
            if (event.data === ': heartbeat' || event.data === ': keepalive' || event.data === ': connected') {
              return
            }

            const notification = JSON.parse(event.data)
            setNotifications((prev) => [
              {
                ...notification,
                id: Date.now().toString(),
                read: false,
                timestamp: new Date(),
              },
              ...prev,
            ].slice(0, 50))

            // Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(notification.title, {
                  body: notification.message,
                  icon: '/logo.png',
                  tag: 'whatsapp-notification',
                })
              } catch (e) {
                console.error('[v0] Error showing notification:', e)
              }
            }
          } catch (error) {
            console.error('[v0] Error parsing notification:', error, 'data:', event.data)
          }
        }

        eventSource.addEventListener('error', (event) => {
          console.error('[v0] Notification stream error:', event)
          eventSource.close()

          // Retry logic with exponential backoff
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++
            const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000)
            console.log(`[v0] Reconnecting in ${delay}ms (attempt ${retryCountRef.current}/${maxRetries})`)
            setTimeout(() => {
              connectStream()
            }, delay)
          } else {
            console.error('[v0] Max retries reached, giving up')
          }
        })

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission()
        }

        return () => {
          if (eventSourceRef.current) {
            eventSourceRef.current.close()
            eventSourceRef.current = null
          }
        }
      } catch (error) {
        console.error('[v0] Error setting up notification stream:', error)
      }
    }

    connectStream()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-md">
      {notifications.slice(0, 5).map((notif) => (
        <div
          key={notif.id}
          className={`p-4 rounded-lg shadow-lg border animate-in slide-in-from-right ${
            notif.type === 'alert'
              ? 'bg-red-500/10 border-red-500/20 text-red-900'
              : notif.type === 'status'
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-900'
                : 'bg-green-500/10 border-green-500/20 text-green-900'
          }`}
        >
          <div className="flex items-start gap-3">
            <Bell className="h-4 w-4 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{notif.title}</p>
              <p className="text-xs opacity-90">{notif.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
