"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/database.types"

let cachedBrowserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export const createSupabaseBrowserClient = () => {
  if (cachedBrowserClient) return cachedBrowserClient
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[Supabase Browser] Missing public environment variables, returning mock client")
    return createMockBrowserClient()
  }

  try {
    cachedBrowserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
    return cachedBrowserClient
  } catch (error) {
    console.warn("[Supabase Browser] Error creating client:", error)
    return createMockBrowserClient()
  }
}

const createMockBrowserClient = () => ({
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null }),
  }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ 
      data: null, 
      error: { message: "Supabase not configured" } 
    }),
    signInWithOAuth: () => Promise.resolve({ 
      data: null, 
      error: { message: "Supabase not configured" } 
    }),
    signOut: () => Promise.resolve({ error: null }),
  },
}) as any
