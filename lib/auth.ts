import { env } from "./env"

type AuthUser = {
  email: string
  password: string
  role: "admin" | "system"
}

const parseUsers = () => {
  const entries = env.BASIC_AUTH_USERS.split(",").map((value) => value.trim()).filter(Boolean)
  const users = new Map<string, AuthUser>()

  for (const entry of entries) {
    const [email, password, role] = entry.split(":")
    if (!email || !password || (role !== "admin" && role !== "system")) {
      continue
    }
    users.set(email, { email, password, role })
  }

  return users
}

const allowedUsers = parseUsers()

export function parseBasicAuth(
  authHeader: string,
  decodeBase64: (value: string) => string,
): { email: string; password: string } | null {
  if (!authHeader.startsWith("Basic ")) return null
  const encoded = authHeader.slice("Basic ".length).trim()
  if (!encoded) return null
  const decoded = decodeBase64(encoded)
  const separatorIndex = decoded.indexOf(":")
  if (separatorIndex === -1) return null
  const email = decoded.slice(0, separatorIndex)
  const password = decoded.slice(separatorIndex + 1)
  return { email, password }
}

export function validateCredentials(email: string, password: string) {
  const user = allowedUsers.get(email)
  if (!user) return null
  if (user.password !== password) return null
  return user
}
