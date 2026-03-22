import { NextResponse } from 'next/server'

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  timestamp: string
}

export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code?: string
    details?: any
  }
  timestamp: string
}

export interface ApiPaginatedResponse<T> {
  success: true
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
  }
  timestamp: string
}

export class ResponseBuilder {
  static success<T>(data: T, statusCode = 200): NextResponse<ApiSuccessResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    )
  }

  static error(
    message: string,
    statusCode = 500,
    code?: string,
    details?: any
  ): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
      {
        success: false,
        error: { message, code, ...(details && { details }) },
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    )
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
  ): NextResponse<ApiPaginatedResponse<T>> {
    const totalPages = Math.ceil(total / limit)
    const hasMore = page < totalPages

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore,
      },
      timestamp: new Date().toISOString(),
    })
  }

  static created<T>(data: T): NextResponse<ApiSuccessResponse<T>> {
    return ResponseBuilder.success(data, 201)
  }

  static noContent(): NextResponse<void> {
    return new NextResponse(null, { status: 204 })
  }

  static badRequest(message: string, code?: string): NextResponse<ApiErrorResponse> {
    return ResponseBuilder.error(message, 400, code)
  }

  static unauthorized(message = 'Unauthorized'): NextResponse<ApiErrorResponse> {
    return ResponseBuilder.error(message, 401, 'UNAUTHORIZED')
  }

  static forbidden(message = 'Forbidden'): NextResponse<ApiErrorResponse> {
    return ResponseBuilder.error(message, 403, 'FORBIDDEN')
  }

  static notFound(message = 'Not found'): NextResponse<ApiErrorResponse> {
    return ResponseBuilder.error(message, 404, 'NOT_FOUND')
  }

  static conflict(message: string): NextResponse<ApiErrorResponse> {
    return ResponseBuilder.error(message, 409, 'CONFLICT')
  }

  static internalError(message = 'Internal server error'): NextResponse<ApiErrorResponse> {
    return ResponseBuilder.error(message, 500, 'INTERNAL_ERROR')
  }

  static rateLimitExceeded(retryAfter?: number): NextResponse<ApiErrorResponse> {
    const response = ResponseBuilder.error(
      'Too many requests',
      429,
      'RATE_LIMIT_EXCEEDED'
    )
    if (retryAfter) {
      response.headers.set('Retry-After', String(retryAfter))
    }
    return response
  }
}
