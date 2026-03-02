export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, code?: string) {
    super(400, message, code)
    this.name = "ValidationError"
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found", code?: string) {
    super(404, message, code)
    this.name = "NotFoundError"
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized", code?: string) {
    super(401, message, code)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = "Forbidden", code?: string) {
    super(403, message, code)
    this.name = "ForbiddenError"
  }
}

export function logError(context: string, error: any) {
  const timestamp = new Date().toISOString()
  
  let errorMsg = ""
  let errorStack = ""
  
  if (error instanceof Error) {
    errorMsg = error.message
    errorStack = error.stack || ""
  } else if (typeof error === "object" && error !== null) {
    // Handle Supabase or other object errors
    errorMsg = error.message || error.error_description || JSON.stringify(error)
    errorStack = error.stack || ""
  } else {
    errorMsg = String(error)
  }

  console.error(`[${timestamp}] [ERROR] [${context}]`, {
    message: errorMsg,
    stack: errorStack,
  })
}

export function logInfo(context: string, data?: any) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] [INFO] [${context}]`, data || "")
}

export function logWarn(context: string, data?: any) {
  const timestamp = new Date().toISOString()
  console.warn(`[${timestamp}] [WARN] [${context}]`, data || "")
}
