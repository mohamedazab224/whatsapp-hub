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

// Logger Environment
const loggerEnvSchema = z.object({
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
})

export type LoggerEnv = z.infer<typeof loggerEnvSchema>

let cachedLoggerEnv: LoggerEnv | null = null

export const getLoggerEnv = (): LoggerEnv => {
  if (cachedLoggerEnv) return cachedLoggerEnv
  const parsed = loggerEnvSchema.safeParse(process.env)
  if (!parsed.success) {
    console.warn("Invalid logger environment, using defaults:", parsed.error.issues)
  }
  cachedLoggerEnv = parsed.data || loggerEnvSchema.parse({})
  return cachedLoggerEnv
}

// WhatsApp API Environment
const whatsappApiEnvSchema = z.object({
  WHATSAPP_ACCESS_TOKEN: z.string().min(1, "WHATSAPP_ACCESS_TOKEN is required"),
  WHATSAPP_API_VERSION: z.string().default("v24.0"),
})

export type WhatsappApiEnv = z.infer<typeof whatsappApiEnvSchema>

let cachedWhatsappApiEnv: WhatsappApiEnv | null = null

export const getWhatsappApiEnv = (): WhatsappApiEnv => {
  if (cachedWhatsappApiEnv) return cachedWhatsappApiEnv
  const parsed = whatsappApiEnvSchema.safeParse(process.env)
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")
    throw new Error(`Invalid WhatsApp API environment: ${errors}`)
  }
  cachedWhatsappApiEnv = parsed.data
  return cachedWhatsappApiEnv
}

// Webhook Environment
const webhookEnvSchema = z.object({
  WHATSAPP_APP_SECRET: z.string().min(1, "WHATSAPP_APP_SECRET is required"),
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: z.string().min(1, "WHATSAPP_WEBHOOK_VERIFY_TOKEN is required"),
  WEBHOOK_RATE_LIMIT_MAX: z.string().default("120"),
  WEBHOOK_RATE_LIMIT_WINDOW_SEC: z.string().default("60"),
})

export type WebhookEnv = z.infer<typeof webhookEnvSchema>

let cachedWebhookEnv: WebhookEnv | null = null

export const getWebhookEnv = (): WebhookEnv => {
  if (cachedWebhookEnv) return cachedWebhookEnv
  const parsed = webhookEnvSchema.safeParse(process.env)
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")
    throw new Error(`Invalid Webhook environment: ${errors}`)
  }
  cachedWebhookEnv = parsed.data
  return cachedWebhookEnv
}

// Queue Environment
const queueEnvSchema = z.object({
  QUEUE_SECRET: z.string().min(1, "QUEUE_SECRET is required"),
  QUEUE_RATE_LIMIT_MAX: z.string().default("30"),
  QUEUE_RATE_LIMIT_WINDOW_SEC: z.string().default("60"),
})

export type QueueEnv = z.infer<typeof queueEnvSchema>

let cachedQueueEnv: QueueEnv | null = null

export const getQueueEnv = (): QueueEnv => {
  if (cachedQueueEnv) return cachedQueueEnv
  const parsed = queueEnvSchema.safeParse(process.env)
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")
    throw new Error(`Invalid Queue environment: ${errors}`)
  }
  cachedQueueEnv = parsed.data
  return cachedQueueEnv
}
