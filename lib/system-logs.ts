import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"
import type { Database } from "@/lib/database.types"

type SystemLogLevel = "debug" | "info" | "warn" | "error"
type SystemLogCategory = "auth" | "api" | "database" | "webhook" | "workflow" | "security" | "system"

/**
 * Log system events to database
 */
export async function logSystemEvent(
  projectId: string,
  userId: string | null,
  category: SystemLogCategory,
  level: SystemLogLevel,
  message: string,
  metadata?: Record<string, any>
) {
  try {
    const supabase = createSupabaseAdminClient()

    const { error } = await supabase.from("system_logs").insert({
      project_id: projectId,
      user_id: userId,
      category,
      level,
      message,
      metadata: metadata || {},
    })

    if (error) {
      logger.error(`Failed to log system event: ${error.message}`)
    }
  } catch (error) {
    logger.error("Error logging system event", { error })
  }
}

/**
 * Log authentication events
 */
export async function logAuthEvent(
  userId: string | null,
  projectId: string,
  action: "login" | "logout" | "signup" | "password_reset" | "oauth_auth",
  success: boolean,
  details?: Record<string, any>
) {
  await logSystemEvent(
    projectId,
    userId,
    "auth",
    success ? "info" : "warn",
    `User ${action}: ${success ? "successful" : "failed"}`,
    { action, success, ...details }
  )
}

/**
 * Log API errors
 */
export async function logApiError(
  projectId: string,
  userId: string | null,
  endpoint: string,
  statusCode: number,
  error: string,
  metadata?: Record<string, any>
) {
  await logSystemEvent(
    projectId,
    userId,
    "api",
    statusCode >= 500 ? "error" : "warn",
    `API Error: ${endpoint} (${statusCode}) - ${error}`,
    { endpoint, statusCode, ...metadata }
  )
}

/**
 * Log database operations
 */
export async function logDatabaseOp(
  projectId: string,
  userId: string | null,
  operation: "insert" | "update" | "delete" | "select",
  table: string,
  success: boolean,
  error?: string
) {
  await logSystemEvent(
    projectId,
    userId,
    "database",
    success ? "debug" : "error",
    `Database ${operation} on ${table}: ${success ? "success" : `failed - ${error}`}`,
    { operation, table, success, error }
  )
}

/**
 * Log webhook events
 */
export async function logWebhookEvent(
  projectId: string,
  userId: string | null,
  webhookId: string,
  eventType: string,
  statusCode: number,
  success: boolean
) {
  await logSystemEvent(
    projectId,
    userId,
    "webhook",
    success ? "info" : "warn",
    `Webhook ${webhookId}: ${eventType} (${statusCode})`,
    { webhookId, eventType, statusCode, success }
  )
}

/**
 * Log security events
 */
export async function logSecurityEvent(
  projectId: string,
  userId: string | null,
  action: "rate_limit_exceeded" | "unauthorized_access" | "suspicious_activity" | "permission_denied",
  details?: Record<string, any>
) {
  await logSystemEvent(
    projectId,
    userId,
    "security",
    "warn",
    `Security Event: ${action}`,
    { action, ...details }
  )
}

/**
 * Fetch system logs
 */
export async function getSystemLogs(
  projectId: string,
  filters?: { category?: SystemLogCategory; level?: SystemLogLevel; limit?: number }
) {
  try {
    const supabase = createSupabaseAdminClient()

    let query = supabase
      .from("system_logs")
      .select("*")
      .eq("project_id", projectId)

    if (filters?.category) {
      query = query.eq("category", filters.category)
    }

    if (filters?.level) {
      query = query.eq("level", filters.level)
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(filters?.limit || 100)

    if (error) throw error
    return data as Database["public"]["Tables"]["system_logs"]["Row"][]
  } catch (error) {
    logger.error("Error fetching system logs", { error })
    return []
  }
}
