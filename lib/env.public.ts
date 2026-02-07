import { z } from "zod"

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
})

type PublicEnv = z.infer<typeof publicEnvSchema>

let cachedPublicEnv: PublicEnv | null = null

const formatIssues = (issues: z.ZodIssue[]) => issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")

export const getPublicEnv = (): PublicEnv => {
  if (cachedPublicEnv) return cachedPublicEnv
  const parsed = publicEnvSchema.safeParse(process.env)
  if (!parsed.success) {
    // Log warning instead of throwing
    console.warn(`Invalid environment configuration (public): ${formatIssues(parsed.error.issues)}`)
    // Return empty object for optional values
    cachedPublicEnv = {}
    return cachedPublicEnv
  }
  cachedPublicEnv = parsed.data
  return cachedPublicEnv
}
