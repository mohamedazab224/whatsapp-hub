import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { logger } from "@/lib/logger"
import type { RealtimeChannel } from "@supabase/supabase-js"

type Callback = (data: any) => void

const subscriptions = new Map<string, RealtimeChannel>()

/**
 * Subscribe to table changes in real-time
 */
export function subscribeToTable(
  table: string,
  callback: Callback,
  filter?: { column: string; operator: string; value: any }
) {
  const subscriptionKey = `${table}_${filter ? `${filter.column}_${filter.operator}` : "all"}`

  if (subscriptions.has(subscriptionKey)) {
    return subscriptionKey
  }

  try {
    const supabase = createSupabaseBrowserClient()

    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: filter ? `${filter.column}=${filter.operator}.${filter.value}` : undefined,
        },
        (payload) => {
          logger.debug(`Real-time update for ${table}`, { eventType: payload.eventType })
          callback(payload)
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          logger.error(`Subscription error for ${table}`)
        }
        if (status === "SUBSCRIBED") {
          logger.debug(`Subscribed to ${table}`)
        }
      })

    subscriptions.set(subscriptionKey, channel)
    return subscriptionKey
  } catch (error) {
    logger.error(`Failed to subscribe to ${table}`, { error })
    return null
  }
}

/**
 * Subscribe to specific row changes
 */
export function subscribeToRow(
  table: string,
  rowId: string,
  callback: Callback
) {
  return subscribeToTable(table, callback, {
    column: "id",
    operator: "eq",
    value: rowId,
  })
}

/**
 * Subscribe to filtered rows
 */
export function subscribeToFiltered(
  table: string,
  projectId: string,
  callback: Callback
) {
  return subscribeToTable(table, callback, {
    column: "project_id",
    operator: "eq",
    value: projectId,
  })
}

/**
 * Unsubscribe from changes
 */
export async function unsubscribe(subscriptionKey: string) {
  const subscription = subscriptions.get(subscriptionKey)
  
  if (subscription) {
    await subscription.unsubscribe()
    subscriptions.delete(subscriptionKey)
    logger.debug(`Unsubscribed from ${subscriptionKey}`)
  }
}

/**
 * Unsubscribe all subscriptions
 */
export async function unsubscribeAll() {
  const promises = Array.from(subscriptions.entries()).map(([key, channel]) =>
    channel.unsubscribe().then(() => {
      subscriptions.delete(key)
    })
  )

  await Promise.all(promises)
  logger.debug("Unsubscribed from all channels")
}

/**
 * Get subscription status
 */
export function getSubscriptionCount() {
  return subscriptions.size
}
