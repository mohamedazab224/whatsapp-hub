import { useEffect, useCallback } from "react"
import useSWR from "swr"
import { subscribeToFiltered, unsubscribe } from "@/lib/realtime"
import { logError } from "@/lib/errors"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error(`API error: ${res.status}`)
    logError(`Fetcher:${url}`, error)
    throw error
  }
  return res.json()
}

/**
 * Hook for fetching data with real-time updates
 */
export function useRealtimeData<T>(
  url: string,
  table: string,
  projectId: string,
  options?: { revalidateOnFocus?: boolean; dedupingInterval?: number }
) {
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: options?.revalidateOnFocus ?? false,
    dedupingInterval: options?.dedupingInterval ?? 60000,
  })

  useEffect(() => {
    if (!projectId) return

    const subscriptionKey = subscribeToFiltered(table, projectId, () => {
      // Revalidate when changes occur
      mutate()
    })

    return () => {
      if (subscriptionKey) {
        unsubscribe(subscriptionKey)
      }
    }
  }, [projectId, table, mutate])

  return { data, error, isLoading: isLoading && !data, mutate }
}

/**
 * Hook for real-time contacts
 */
export function useRealtimeContacts(projectId: string, params?: { search?: string }) {
  const queryParams = new URLSearchParams()
  if (params?.search) queryParams.append("search", params.search)

  const url = `/api/contacts${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

  const { data, error, isLoading, mutate } = useRealtimeData(
    url,
    "contacts",
    projectId
  )

  return {
    contacts: data?.contacts || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook for real-time messages
 */
export function useRealtimeMessages(
  projectId: string,
  contactId?: string,
  params?: { page?: number; limit?: number }
) {
  const queryParams = new URLSearchParams()
  if (contactId) queryParams.append("contact_id", contactId)
  if (params?.page) queryParams.append("page", params.page.toString())
  if (params?.limit) queryParams.append("limit", params.limit.toString())

  const url = `/api/messages${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

  const { data, error, isLoading, mutate } = useRealtimeData(
    url,
    "messages",
    projectId
  )

  return {
    messages: data?.messages || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook for real-time workflows
 */
export function useRealtimeWorkflows(projectId: string) {
  const { data, error, isLoading, mutate } = useRealtimeData(
    "/api/workflows",
    "workflows",
    projectId
  )

  return {
    workflows: data?.workflows || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate,
  }
}
