import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Admin client for server-side operations (can be used anywhere on the server)
let cachedAdminClient: ReturnType<typeof createClient<Database>> | null = null

const getEnv = () => {
  const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!NEXT_PUBLIC_SUPABASE_URL) throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing")
  if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing")

  return {
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
  }
}

export const createSupabaseAdminClient = () => {
  if (cachedAdminClient) return cachedAdminClient

  const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getEnv()
  cachedAdminClient = createClient<Database>(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  return cachedAdminClient
}

// Reset admin client (useful for testing)
export const resetSupabaseAdminClient = () => {
  cachedAdminClient = null
}
