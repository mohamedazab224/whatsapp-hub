export class Logger {
  private context: string
  private isDev = process.env.NODE_ENV === 'development'

  constructor(context: string) {
    this.context = context
  }

  private format(level: string, message: string, data?: any) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      ...(data && { data }),
    }
    return logEntry
  }

  info(message: string, data?: any) {
    const log = this.format('INFO', message, data)
    console.log(JSON.stringify(log))
  }

  error(message: string, error?: any) {
    const log = this.format('ERROR', message, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    console.error(JSON.stringify(log))
  }

  warn(message: string, data?: any) {
    const log = this.format('WARN', message, data)
    console.warn(JSON.stringify(log))
  }

  debug(message: string, data?: any) {
    if (this.isDev) {
      const log = this.format('DEBUG', message, data)
      console.debug(JSON.stringify(log))
    }
  }
}

export const createLogger = (context: string) => new Logger(context)
