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
  const maxRetries = 3

  useEffect(() => {
    const connectStream = () => {
      try {
        const eventSource = new EventSource('/api/notifications/stream')
        eventSourceRef.current = eventSource

        eventSource.onmessage = (event) => {
          try {
            // Skip heartbeat and keepalive messages
            if (
              event.data === ': heartbeat' ||
              event.data === ': keepalive' ||
              event.data === ': connected' ||
              !event.data ||
              event.data.startsWith(':')
            ) {
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
                // Silent fail on notification error
              }
            }
          } catch (error) {
            // Silent fail on parse error - likely a non-notification message
          }
        }

        eventSource.addEventListener('error', () => {
          const readyState = eventSource.readyState
          
          // If connection is closed, try to reconnect
          if (readyState === EventSource.CLOSED) {
            eventSource.close()

            if (retryCountRef.current < maxRetries) {
              retryCountRef.current++
              const delay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 30000)
              setTimeout(() => {
                connectStream()
              }, delay)
            }
            // If max retries reached, silently give up - app still works without notifications
          }
        })

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission().catch(() => {
            // Silent fail if user denies notification permission
          })
        }

        return () => {
          if (eventSourceRef.current) {
            eventSourceRef.current.close()
            eventSourceRef.current = null
          }
        }
      } catch (error) {
        // Silent fail - notifications are optional, app should still work
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
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-md pointer-events-none">
      {notifications.slice(0, 5).map((notif) => (
        <div
          key={notif.id}
          className={`p-4 rounded-lg shadow-lg border animate-in slide-in-from-right pointer-events-auto ${
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
