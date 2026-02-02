import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server"

export const getSupabaseClient = () => createSupabaseBrowserClient()

export const getSupabaseServer = async () => await createSupabaseServerClient()

export const getSupabaseAdmin = () => createSupabaseAdminClient()
