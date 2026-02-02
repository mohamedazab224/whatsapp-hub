"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/database.types"

let cachedBrowserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export const createSupabaseBrowserClient = () => {
  if (cachedBrowserClient) return cachedBrowserClient
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase public environment variables.")
  }

  cachedBrowserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  return cachedBrowserClient
}
