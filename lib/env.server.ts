import { z } from "zod"

const supabaseAdminEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
})

export type SupabaseAdminEnv = z.infer<typeof supabaseAdminEnvSchema>

let cachedSupabaseAdminEnv: SupabaseAdminEnv | null = null

export const getSupabaseAdminEnv = (): SupabaseAdminEnv => {
  if (cachedSupabaseAdminEnv) return cachedSupabaseAdminEnv
  const parsed = supabaseAdminEnvSchema.safeParse(process.env)
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")
    throw new Error(`Invalid Supabase admin environment: ${errors}`)
  }
  cachedSupabaseAdminEnv = parsed.data
  return cachedSupabaseAdminEnv
}

// Reset cache (useful for testing)
export const resetSupabaseAdminEnv = () => {
  cachedSupabaseAdminEnv = null
}
