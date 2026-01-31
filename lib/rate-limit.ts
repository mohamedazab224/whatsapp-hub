import { logger } from "./logger"

type RateLimitConfig = {
  windowMs: number
  max: number
}

type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
}

type RateLimitEntry = {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown"
  }
  return request.headers.get("x-real-ip") || "unknown"
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    const resetAt = now + config.windowMs
    store.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: config.max - 1, resetAt }
  }

  if (entry.count >= config.max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count += 1
  store.set(key, entry)
  return { allowed: true, remaining: config.max - entry.count, resetAt: entry.resetAt }
}

export function logRateLimitRejection(route: string, key: string, resetAt: number) {
  logger.warn("Rate limit exceeded", { route, key, resetAt })
}
