import { logger } from "@/lib/logger"

/**
 * Handle Supabase errors and convert to meaningful messages
 */
export function handleSupabaseError(error: any, context: string) {
  logger.error(`Supabase error in ${context}`, {
    message: error?.message,
    code: error?.code,
    details: error?.details,
  })

  // Handle specific error codes
  if (error?.code === "PGRST116") {
    return "Resource not found"
  }

  if (error?.code === "42P01") {
    return "Table does not exist"
  }

  if (error?.code === "23505") {
    return "Duplicate entry"
  }

  if (error?.code === "23503") {
    return "Foreign key constraint violated"
  }

  if (error?.message?.includes("JWT")) {
    return "Authentication failed"
  }

  if (error?.message?.includes("permission")) {
    return "Permission denied"
  }

  return error?.message || "An error occurred"
}

/**
 * Ensure proper error response format
 */
export function formatErrorResponse(error: any) {
  if (error instanceof Error) {
    return {
      error: error.message,
      code: (error as any).code,
    }
  }

  return {
    error: String(error),
  }
}
