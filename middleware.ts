import { NextRequest, NextResponse } from "next/server"
import { updateSupabaseSession } from "@/lib/supabase/middleware"

const PUBLIC_PATHS = ["/login", "/auth/callback"]
const PUBLIC_PREFIXES = ["/api/webhook"]

const isPublicPath = (pathname: string) =>
  PUBLIC_PATHS.includes(pathname) || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))

const isStaticAsset = (pathname: string) =>
  pathname.startsWith("/_next") ||
  pathname.startsWith("/favicon") ||
  pathname.startsWith("/icon") ||
  pathname.startsWith("/apple-icon") ||
  pathname === "/robots.txt" ||
  pathname === "/sitemap.xml"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isStaticAsset(pathname)) {
    return NextResponse.next()
  }

  const { response, user } = await updateSupabaseSession(request)

  if (isPublicPath(pathname)) {
    if (user && pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return response
  }

  if (!user) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
}
