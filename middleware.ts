import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { parseBasicAuth, validateCredentials } from "./lib/auth"

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": "Basic realm=\"Secure Area\"" },
    })
  }

  const credentials = parseBasicAuth(authHeader, (value) => atob(value))
  const user = credentials ? validateCredentials(credentials.email, credentials.password) : null
  if (!credentials || !user) {
    return new NextResponse("Invalid credentials", {
      status: 401,
      headers: { "WWW-Authenticate": "Basic realm=\"Secure Area\"" },
    })
  }

  if (user.role !== "admin" && user.role !== "system") {
    return new NextResponse("Forbidden", { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/webhook|api/queue|webhook|webhooks|_next/static|_next/image|favicon.ico).*)"],
}
