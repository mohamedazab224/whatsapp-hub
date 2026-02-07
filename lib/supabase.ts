import { createClient } from "@supabase/supabase-js"
import { getSupabaseAdminEnv } from "./env.server"

export function getSupabaseServer(): any {
  try {
    const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getSupabaseAdminEnv()
    if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.warn("[Supabase] Missing configuration, returning mock client")
      return createMockClient()
    }
    return createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  } catch (error) {
    console.warn("[Supabase] Error creating server client:", error)
    return createMockClient()
  }
}

export const getSupabaseClient = (): any => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("[Supabase] Missing configuration, returning mock client")
      return createMockClient()
    }
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  } catch (error) {
    console.warn("[Supabase] Error creating client:", error)
    return createMockClient()
  }
}

export const getSupabaseAdmin = (): any => {
  try {
    const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getSupabaseAdminEnv()
    if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.warn("[Supabase] Missing configuration, returning mock client")
      return createMockClient()
    }
    return createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  } catch (error) {
    console.warn("[Supabase] Error creating admin client:", error)
    return createMockClient()
  }
}

// Mock client for development without Supabase
const createMockClient = () => ({
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null }),
  }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  },
})
