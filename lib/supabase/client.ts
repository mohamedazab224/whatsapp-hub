"use client"

import { createBrowserClient } from "@supabase/ssr"

let cachedBrowserClient: ReturnType<typeof createBrowserClient> | null = null

export const createSupabaseBrowserClient = () => {
  if (cachedBrowserClient) return cachedBrowserClient
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase public environment variables.")
  }

  cachedBrowserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return cachedBrowserClient
}
