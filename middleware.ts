import { type NextRequest, NextResponse } from 'next/server'

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/contacts',
  '/messages',
  '/templates',
  '/settings',
  '/reports',
  '/integrations',
  '/webhook-logs',
]

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/reset-password',
  '/init',
  '/api/health',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

  // Allow API routes (they have their own auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Check authentication token
  const token = request.cookies.get('auth-token')?.value
  const hasAuth = !!token

  // If protected route and no auth, redirect to login
  if (isProtectedRoute && !hasAuth) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If on login/register and has auth, redirect to dashboard
  if ((pathname === '/login' || pathname === '/register') && hasAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
