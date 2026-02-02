import { z } from "zod"
import { getPublicEnv } from "./env.public"

const authEnvSchema = z.object({
  BASIC_AUTH_USERS: z.string().min(1),
  AUTH_PASSWORD_SALT: z.string().min(1),
  SESSION_SECRET: z.string().min(1),
})

const sessionEnvSchema = z.object({
  SESSION_SECRET: z.string().min(1),
})

const webhookEnvSchema = z.object({
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: z.string().min(1),
  WHATSAPP_APP_SECRET: z.string().min(1),
  WEBHOOK_RATE_LIMIT_MAX: z.string().default("120"),
  WEBHOOK_RATE_LIMIT_WINDOW_SEC: z.string().default("60"),
})

const whatsappApiEnvSchema = z.object({
  WHATSAPP_ACCESS_TOKEN: z.string().min(1),
  WHATSAPP_API_VERSION: z.string().default("v21.0"),
})

const queueEnvSchema = z.object({
  QUEUE_SECRET: z.string().min(1),
  QUEUE_RATE_LIMIT_MAX: z.string().default("30"),
  QUEUE_RATE_LIMIT_WINDOW_SEC: z.string().default("60"),
})

const logEnvSchema = z.object({
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
})

const supabaseAdminEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
})

type AuthEnv = z.infer<typeof authEnvSchema>

type SessionEnv = z.infer<typeof sessionEnvSchema>

type WebhookEnv = z.infer<typeof webhookEnvSchema>

type WhatsappApiEnv = z.infer<typeof whatsappApiEnvSchema>

type QueueEnv = z.infer<typeof queueEnvSchema>

type LogEnv = z.infer<typeof logEnvSchema>

type SupabaseAdminEnv = z.infer<typeof supabaseAdminEnvSchema> & ReturnType<typeof getPublicEnv>

let cachedAuthEnv: AuthEnv | null = null
let cachedSessionEnv: SessionEnv | null = null
let cachedWebhookEnv: WebhookEnv | null = null
let cachedWhatsappApiEnv: WhatsappApiEnv | null = null
let cachedQueueEnv: QueueEnv | null = null
let cachedLogEnv: LogEnv | null = null
let cachedSupabaseAdminEnv: SupabaseAdminEnv | null = null

const formatIssues = (issues: z.ZodIssue[]) => issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")

const parseEnv = <T>(schema: z.ZodSchema<T>, scope: string) => {
  const parsed = schema.safeParse(process.env)
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration (${scope}): ${formatIssues(parsed.error.issues)}`)
  }
  return parsed.data
}

export const getAuthEnv = (): AuthEnv => {
  if (cachedAuthEnv) return cachedAuthEnv
  cachedAuthEnv = parseEnv(authEnvSchema, "auth")
  return cachedAuthEnv
}

export const getSessionEnv = (): SessionEnv => {
  if (cachedSessionEnv) return cachedSessionEnv
  cachedSessionEnv = parseEnv(sessionEnvSchema, "session")
  return cachedSessionEnv
}

export const getWebhookEnv = (): WebhookEnv => {
  if (cachedWebhookEnv) return cachedWebhookEnv
  const parsed = parseEnv(webhookEnvSchema, "webhook")
  cachedWebhookEnv = {
    ...parsed,
    WEBHOOK_RATE_LIMIT_MAX: parsed.WEBHOOK_RATE_LIMIT_MAX || "120",
    WEBHOOK_RATE_LIMIT_WINDOW_SEC: parsed.WEBHOOK_RATE_LIMIT_WINDOW_SEC || "60"
  }
  return cachedWebhookEnv
}

export const getWhatsappApiEnv = (): WhatsappApiEnv => {
  if (cachedWhatsappApiEnv) return cachedWhatsappApiEnv
  const parsed = parseEnv(whatsappApiEnvSchema, "whatsapp-api")
  cachedWhatsappApiEnv = {
    ...parsed,
    WHATSAPP_API_VERSION: parsed.WHATSAPP_API_VERSION || "v21.0"
  }
  return cachedWhatsappApiEnv
}

export const getQueueEnv = (): QueueEnv => {
  if (cachedQueueEnv) return cachedQueueEnv
  const parsed = parseEnv(queueEnvSchema, "queue")
  cachedQueueEnv = {
    ...parsed,
    QUEUE_RATE_LIMIT_MAX: parsed.QUEUE_RATE_LIMIT_MAX || "30",
    QUEUE_RATE_LIMIT_WINDOW_SEC: parsed.QUEUE_RATE_LIMIT_WINDOW_SEC || "60"
  }
  return cachedQueueEnv
}

export const getLoggerEnv = (): LogEnv => {
  if (cachedLogEnv) return cachedLogEnv
  const parsed = parseEnv(logEnvSchema, "logger")
  cachedLogEnv = {
    ...parsed,
    LOG_LEVEL: parsed.LOG_LEVEL || "info"
  }
  return cachedLogEnv
}

export const getSupabaseAdminEnv = (): SupabaseAdminEnv => {
  if (cachedSupabaseAdminEnv) return cachedSupabaseAdminEnv
  const publicEnv = getPublicEnv()
  const adminEnv = parseEnv(supabaseAdminEnvSchema, "supabase-admin")
  cachedSupabaseAdminEnv = { ...publicEnv, ...adminEnv }
  return cachedSupabaseAdminEnv
}
