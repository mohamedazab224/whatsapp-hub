import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/lib/database.types"

export const updateSupabaseSession = async (request: NextRequest) => {
  const response = NextResponse.next()
  
  // Get env vars directly from process.env to ensure they're available
  const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are not set, return empty user (development mode)
  if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('[middleware] Supabase credentials not found in process.env')
    console.warn('[middleware] URL present:', !!NEXT_PUBLIC_SUPABASE_URL)
    console.warn('[middleware] Key present:', !!NEXT_PUBLIC_SUPABASE_ANON_KEY)
    return { response, user: null }
  }

  const supabase = createServerClient<Database>(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { response, user }
}
