import useSWR from 'swr'
import { logError } from '@/lib/errors'
import { useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const fetcher = async (url: string) => {
  try {
    const res = await fetch(url)
    
    if (!res.ok) {
      const error = new Error(`API error: ${res.status}`)
      logError(`Fetcher:${url}`, error)
      throw error
    }
    
    const data = await res.json()
    return data
  } catch (error) {
    logError(`Fetcher:${url}`, error)
    throw error
  }
}

export function useDashboardStats() {
  const { data, error, isLoading, mutate } = useSWR('/api/stats', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  })

  return {
    stats: data?.stats || { contacts: 0, messages: 0, numbers: 0 },
    isLoading: isLoading && !data,
    error,
    mutate,
  }
}

export function useContacts(params?: { search?: string; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams()
  if (params?.search) queryParams.append('search', params.search)
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  
  const url = `/api/contacts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  return {
    contacts: data?.contacts || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 0,
    isLoading: isLoading && !data,
    error,
    mutate,
  }
}

export function useMessages(params?: { contact_id?: string; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams()
  if (params?.contact_id) queryParams.append('contact_id', params.contact_id)
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  
  const url = `/api/messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  })

  // Setup real-time subscription
  useEffect(() => {
    if (!params?.contact_id) return

    const supabase = createSupabaseBrowserClient()
    
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `contact_id=eq.${params.contact_id}`,
        },
        () => {
          // Revalidate when changes occur
          mutate()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params?.contact_id, mutate])

  return {
    messages: data?.messages || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 0,
    isLoading: isLoading && !data,
    error,
    mutate,
  }
}

export function useNumbers() {
  const { data, error, isLoading, mutate } = useSWR('/api/numbers', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  return {
    numbers: data?.numbers || [],
    total: data?.total || 0,
    isLoading: isLoading && !data,
    error,
    mutate,
  }
}

export function useFlows() {
  const { data, error, isLoading, mutate } = useSWR('/api/flows', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  return {
    flows: data?.flows || [],
    total: data?.total || 0,
    isLoading: isLoading && !data,
    error,
    mutate,
  }
}

export function useMedia(params?: { period?: string; contact_id?: string; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams()
  if (params?.period) queryParams.append('period', params.period)
  if (params?.contact_id) queryParams.append('contact_id', params.contact_id)
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  
  const url = `/api/media${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  return {
    media: data?.media || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 0,
    isLoading: isLoading && !data,
    error,
    mutate,
  }
}

// Hook for real-time contact list updates
export function useContactsRealtime() {
  const { contacts, mutate, ...rest } = useContacts()

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    
    const channel = supabase
      .channel('contacts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts',
        },
        () => {
          mutate()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutate])

  return { contacts, mutate, ...rest }
}
