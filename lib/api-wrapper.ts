import { NextResponse, NextRequest } from "next/server"
import { getCurrentUser, getCurrentProjectId, verifyProjectAccess } from "@/lib/auth-helpers"
import { logApiError, logSecurityEvent } from "@/lib/system-logs"
import { UnauthorizedError, ForbiddenError, ApiError } from "@/lib/errors"
import { logger } from "@/lib/logger"
import { getClientIp, checkRateLimit, logRateLimitRejection } from "@/lib/rate-limit"

type ApiHandler = (req: NextRequest) => Promise<NextResponse>

interface ApiWrapperOptions {
  requireAuth?: boolean
  requireProject?: boolean
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  rateLimit?: { windowMs: number; max: number }
}

/**
 * Wrapper for API route handlers with auth, validation, and error handling
 */
export function withApiWrapper(handler: ApiHandler, options: ApiWrapperOptions = {}) {
  const { requireAuth = true, requireProject = false, method, rateLimit } = options

  return async (req: NextRequest) => {
    const startTime = Date.now()
    const clientIp = getClientIp(req)
    const pathname = new URL(req.url).pathname

    try {
      // Check method
      if (method && req.method !== method) {
        return NextResponse.json(
          { error: `Method ${req.method} not allowed` },
          { status: 405 }
        )
      }

      // Rate limiting
      if (rateLimit) {
        const rateLimitKey = `${pathname}_${clientIp}`
        const rateLimitResult = checkRateLimit(rateLimitKey, rateLimit)

        if (!rateLimitResult.allowed) {
          logRateLimitRejection(pathname, rateLimitKey, rateLimitResult.resetAt)
          return NextResponse.json(
            { error: "Rate limit exceeded" },
            {
              status: 429,
              headers: {
                "Retry-After": String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
              },
            }
          )
        }
      }

      // Authentication
      let user = null
      let projectId = null

      if (requireAuth) {
        try {
          user = await getCurrentUser()
          projectId = await getCurrentProjectId()
        } catch (error) {
          await logSecurityEvent(
            "unknown",
            null,
            "unauthorized_access",
            { path: pathname, ip: clientIp }
          )
          throw new UnauthorizedError("Authentication required")
        }
      }

      // Project access
      if (requireProject && projectId) {
        try {
          await verifyProjectAccess(projectId)
        } catch (error) {
          await logSecurityEvent(
            projectId,
            user?.id || null,
            "permission_denied",
            { path: pathname }
          )
          throw new ForbiddenError("Access denied")
        }
      }

      // Call handler
      const response = await handler(req)

      // Log successful request
      const duration = Date.now() - startTime
      logger.debug(`${req.method} ${pathname}`, {
        status: response.status,
        duration: `${duration}ms`,
      })

      // Add custom headers
      response.headers.set("X-Response-Time", `${duration}ms`)

      return response
    } catch (error) {
      const duration = Date.now() - startTime

      if (error instanceof ApiError) {
        logger.warn(`${req.method} ${pathname}`, {
          status: error.statusCode,
          error: error.message,
          duration: `${duration}ms`,
        })

        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.statusCode }
        )
      }

      // Log unexpected error
      logger.error(`${req.method} ${pathname}`, {
        error: error instanceof Error ? error.message : String(error),
        duration: `${duration}ms`,
      })

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
}

/**
 * Extract user from request
 */
export async function getUserFromRequest(req: NextRequest) {
  try {
    return await getCurrentUser()
  } catch {
    return null
  }
}

/**
 * Extract project ID from request
 */
export async function getProjectIdFromRequest(req: NextRequest) {
  try {
    return await getCurrentProjectId()
  } catch {
    return null
  }
}

/**
 * Validate request body
 */
export async function validateRequestBody(req: NextRequest) {
  try {
    return await req.json()
  } catch (error) {
    throw new Error("Invalid JSON in request body")
  }
}
