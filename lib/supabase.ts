import { createClient } from "@supabase/supabase-js"
import { env } from "./env"

// Singleton pattern for Supabase client
export const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// Server-side client (requires service role for admin tasks)
export const getSupabaseAdmin = () => {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
}
