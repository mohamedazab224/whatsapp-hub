'use client'

import { useEffect, useState } from 'react'

interface UnreadNotification {
  id: string
  contact_name: string
  last_message: string
  unread_count: number
  timestamp: Date
}

export function useNotifications() {
  const [unreadNotifications, setUnreadNotifications] = useState<UnreadNotification[]>([])
  const [totalUnread, setTotalUnread] = useState(0)

  useEffect(() => {
    // Subscribe to real-time notifications
    const eventSource = new EventSource('/api/notifications/stream')

    eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data)
        
        // Add to notifications list
        setUnreadNotifications((prev) => {
          const existing = prev.find((n) => n.id === notification.contact_id)
          if (existing) {
            return prev.map((n) =>
              n.id === notification.contact_id
                ? {
                    ...n,
                    last_message: notification.message,
                    unread_count: n.unread_count + 1,
                    timestamp: new Date(),
                  }
                : n
            )
          }
          return [
            {
              id: notification.contact_id,
              contact_name: notification.contact_name || 'Unknown',
              last_message: notification.message,
              unread_count: 1,
              timestamp: new Date(),
            },
            ...prev,
          ]
        })

        // Update total unread count
        setTotalUnread((prev) => prev + 1)

        // Show browser notification
        if (Notification.permission === 'granted') {
          new Notification(notification.contact_name || 'New Message', {
            body: notification.message,
            icon: '/logo.png',
            tag: 'whatsapp-message',
            badge: '/badge.png',
          })
        }
      } catch (error) {
        console.error('[v0] Error parsing notification:', error)
      }
    }

    // Request permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => eventSource.close()
  }, [])

  const clearNotification = (contactId: string) => {
    setUnreadNotifications((prev) => prev.filter((n) => n.id !== contactId))
  }

  const clearAllNotifications = () => {
    setUnreadNotifications([])
    setTotalUnread(0)
  }

  return {
    unreadNotifications,
    totalUnread,
    clearNotification,
    clearAllNotifications,
  }
}
