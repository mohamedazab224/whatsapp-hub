import { z } from "zod"

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
})

export type PublicEnv = z.infer<typeof publicEnvSchema>

let cachedPublicEnv: PublicEnv | null = null

export const getPublicEnv = (): PublicEnv => {
  if (cachedPublicEnv) return cachedPublicEnv
  const parsed = publicEnvSchema.safeParse(process.env)
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")
    throw new Error(`Invalid public environment: ${errors}`)
  }
  cachedPublicEnv = parsed.data
  return cachedPublicEnv
}

// Reset cache (useful for testing)
export const resetPublicEnv = () => {
  cachedPublicEnv = null
}
