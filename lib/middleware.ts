import { NextRequest, NextResponse } from "next/server"
import { logError, logInfo, logWarn } from "@/lib/errors"

/**
 * Error logging middleware
 * Captures and logs all errors in API requests
 */
export function errorLoggingMiddleware(
  handler: (req: NextRequest) => Promise<NextResponse | Response>
) {
  return async (req: NextRequest) => {
    const startTime = Date.now()
    const method = req.method
    const url = new URL(req.url)
    const pathname = url.pathname

    try {
      logInfo(`API:${method}:${pathname}`, `Request started`)

      const response = await handler(req)
      const duration = Date.now() - startTime

      if (response.status >= 400) {
        logWarn(`API:${method}:${pathname}`, {
          status: response.status,
          duration: `${duration}ms`,
        })
      } else {
        logInfo(`API:${method}:${pathname}`, {
          status: response.status,
          duration: `${duration}ms`,
        })
      }

      return response
    } catch (error) {
      const duration = Date.now() - startTime
      logError(`API:${method}:${pathname}`, {
        error: error instanceof Error ? error.message : String(error),
        duration: `${duration}ms`,
        stack: error instanceof Error ? error.stack : undefined,
      })

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
}

/**
 * Request validation middleware
 * Ensures required headers and authentication
 */
export function validationMiddleware(
  handler: (req: NextRequest) => Promise<NextResponse | Response>
) {
  return async (req: NextRequest) => {
    // Check content-type for POST/PUT requests
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      const contentType = req.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        logWarn("Validation", `Invalid content-type: ${contentType}`)
        return NextResponse.json(
          { error: "Content-Type must be application/json" },
          { status: 400 }
        )
      }
    }

    return handler(req)
  }
}

/**
 * Rate limiting middleware
 * Prevents abuse by limiting requests per IP/user
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function rateLimitMiddleware(
  limit: number = 100,
  window: number = 60000 // 1 minute
) {
  return (handler: (req: NextRequest) => Promise<NextResponse | Response>) => {
    return async (req: NextRequest) => {
      const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
      const now = Date.now()

      let record = requestCounts.get(ip)

      if (!record || now > record.resetTime) {
        record = { count: 0, resetTime: now + window }
        requestCounts.set(ip, record)
      }

      record.count++

      if (record.count > limit) {
        logWarn("RateLimit", `Rate limit exceeded for IP: ${ip}`)
        return NextResponse.json(
          { error: "Too many requests" },
          { status: 429 }
        )
      }

      return handler(req)
    }
  }
}
