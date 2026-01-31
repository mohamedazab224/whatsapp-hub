import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  BASIC_AUTH_USERS: z.string().min(1),
  WHATSAPP_ACCESS_TOKEN: z.string().min(1),
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: z.string().min(1),
  WHATSAPP_APP_SECRET: z.string().min(1),
  WHATSAPP_API_VERSION: z.string().optional().default("v21.0"),
  QUEUE_SECRET: z.string().min(1),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).optional().default("info"),
  WEBHOOK_RATE_LIMIT_MAX: z.string().optional().default("120"),
  WEBHOOK_RATE_LIMIT_WINDOW_SEC: z.string().optional().default("60"),
  QUEUE_RATE_LIMIT_MAX: z.string().optional().default("30"),
  QUEUE_RATE_LIMIT_WINDOW_SEC: z.string().optional().default("60"),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const formatted = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")
  throw new Error(`Invalid environment configuration: ${formatted}`)
}

export const env = parsed.data
