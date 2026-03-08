'use client'

import { useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { useState } from 'react'

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
  const notificationRef = useRef<any>(null)

  useEffect(() => {
    // Set up real-time listener using EventSource (SSE)
    const eventSource = new EventSource('/api/notifications/stream')

    eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data)
        setNotifications((prev) => [
          {
            ...notification,
            id: Date.now().toString(),
            read: false,
            timestamp: new Date(),
          },
          ...prev,
        ].slice(0, 50)) // Keep last 50

        // Show browser notification
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo.png',
          })
        }
      } catch (error) {
        console.error('[v0] Error parsing notification:', error)
      }
    }

    eventSource.onerror = () => {
      console.error('[v0] Notification stream error')
      eventSource.close()
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => eventSource.close()
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
