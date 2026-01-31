import { env } from "./env"

type SessionPayload = {
  userId: string
  role: string
  exp: number
}

const base64Url = (input: string) =>
  btoa(input).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")

const base64UrlDecode = (input: string) => atob(input.replace(/-/g, "+").replace(/_/g, "/"))

const sign = async (payload: string) => {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(env.SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload))
  return base64Url(String.fromCharCode(...new Uint8Array(signature)))
}

const verify = async (payload: string, signature: string) => {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(env.SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  )
  const signatureBytes = Uint8Array.from(base64UrlDecode(signature), (c) => c.charCodeAt(0))
  return crypto.subtle.verify("HMAC", key, signatureBytes, encoder.encode(payload))
}

export async function createSessionToken(payload: Omit<SessionPayload, "exp">, ttlSeconds = 60 * 60 * 8) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds
  const data = { ...payload, exp }
  const raw = JSON.stringify(data)
  const signature = await sign(raw)
  return `${base64Url(raw)}.${signature}`
}

export async function verifySessionToken(token: string) {
  const [encodedPayload, signature] = token.split(".")
  if (!encodedPayload || !signature) return null
  const raw = base64UrlDecode(encodedPayload)
  const isValid = await verify(raw, signature)
  if (!isValid) return null
  const payload = JSON.parse(raw) as SessionPayload
  if (payload.exp < Math.floor(Date.now() / 1000)) return null
  return payload
}
