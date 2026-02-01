import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getPublicEnv } from "@/lib/env.public"
import { getSupabaseAdminEnv } from "@/lib/env.server"
import { createClient } from "@supabase/supabase-js"

export const createSupabaseServerClient = () => {
  const cookieStore = cookies()
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getPublicEnv()

  return createServerClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options)
        })
      },
    },
  })
}

let cachedAdminClient: ReturnType<typeof createClient> | null = null

export const createSupabaseAdminClient = () => {
  if (cachedAdminClient) return cachedAdminClient
  const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getSupabaseAdminEnv()
  cachedAdminClient = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  return cachedAdminClient
}
