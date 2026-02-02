import assert from "node:assert/strict"
import test from "node:test"

const decodeBase64 = (value: string) => Buffer.from(value, "base64").toString("utf8")

const setupEnv = () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co"
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon"
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service"
  process.env.BASIC_AUTH_USERS = "mohamed@alazab.com:mohamed@202555:admin,admin@alazab.com:admin@202555:system"
  process.env.AUTH_PASSWORD_SALT = "test-salt"
  process.env.SESSION_SECRET = "test-session-secret"
  process.env.WHATSAPP_ACCESS_TOKEN = "token"
  process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = "verify"
  process.env.WHATSAPP_APP_SECRET = "secret"
  process.env.QUEUE_SECRET = "queue"
}

const loadAuth = async () => import(`../lib/auth?cacheBust=${Math.random()}`)

test("parseBasicAuth parses basic credentials", async () => {
  setupEnv()
  const { parseBasicAuth } = await loadAuth()
  const header = `Basic ${Buffer.from("mohamed@alazab.com:mohamed@202555").toString("base64")}`
  const parsed = parseBasicAuth(header, decodeBase64)
  assert.deepEqual(parsed, { email: "mohamed@alazab.com", password: "mohamed@202555" })
})

test("validateCredentials accepts configured users", async () => {
  setupEnv()
  const { validateCredentials } = await loadAuth()
  assert.ok(validateCredentials("admin@alazab.com", "admin@202555"))
})

test("validateCredentials rejects unknown users", async () => {
  setupEnv()
  const { validateCredentials } = await loadAuth()
  assert.equal(validateCredentials("hacker@alazab.com", "bad"), null)
})
