import { createLogger } from '../logger'

const logger = createLogger('RateLimit')
const limitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const current = limitStore.get(key)

  if (!current || now > current.resetTime) {
    limitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (current.count >= maxRequests) {
    logger.warn('Rate limit exceeded', { key, count: current.count, maxRequests })
    return false
  }

  current.count++
  return true
}

export function getRateLimitStatus(key: string) {
  const current = limitStore.get(key)
  if (!current) return null

  const now = Date.now()
  if (now > current.resetTime) {
    limitStore.delete(key)
    return null
  }

  return {
    count: current.count,
    resetTime: current.resetTime,
    remainingMs: current.resetTime - now,
  }
}

export function resetRateLimit(key: string) {
  limitStore.delete(key)
}

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now()
  let removed = 0
  
  for (const [key, value] of limitStore.entries()) {
    if (now > value.resetTime) {
      limitStore.delete(key)
      removed++
    }
  }
  
  if (removed > 0) {
    logger.debug('Cleanup rate limits', { removed, remaining: limitStore.size })
  }
}, 60 * 60 * 1000)
