import { getLoggerEnv } from "./env.server"

type LogLevel = "debug" | "info" | "warn" | "error"

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

const levelToConsole: Record<LogLevel, (...args: unknown[]) => void> = {
  debug: console.debug.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
}

export type LogMeta = Record<string, unknown>

let cachedLogLevel: LogLevel | null = null

const getLogLevel = (): LogLevel => {
  if (cachedLogLevel) return cachedLogLevel
  try {
    cachedLogLevel = getLoggerEnv().LOG_LEVEL as LogLevel
    return cachedLogLevel
  } catch (error) {
    console.warn("[Logger] Failed to get log level:", error)
    return "info"
  }
}

export const shouldLog = (level: LogLevel) => levelPriority[level] >= levelPriority[getLogLevel()]

export const logger = {
  log(level: LogLevel, message: string, meta: LogMeta = {}) {
    if (!shouldLog(level)) return
    const payload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    }
    levelToConsole[level](payload)
  },
  debug(message: string, meta?: LogMeta) {
    logger.log("debug", message, meta)
  },
  info(message: string, meta?: LogMeta) {
    logger.log("info", message, meta)
  },
  warn(message: string, meta?: LogMeta) {
    logger.log("warn", message, meta)
  },
  error(message: string, meta?: LogMeta) {
    logger.log("error", message, meta)
  },
}
