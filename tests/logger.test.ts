import assert from "node:assert/strict"
import test from "node:test"

const setupEnv = () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co"
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon"
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service"
  process.env.BASIC_AUTH_USERS = "admin@alazab.com:admin@202555:system"
  process.env.AUTH_PASSWORD_SALT = "test-salt"
  process.env.SESSION_SECRET = "test-session-secret"
  process.env.WHATSAPP_ACCESS_TOKEN = "token"
  process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = "verify"
  process.env.WHATSAPP_APP_SECRET = "secret"
  process.env.QUEUE_SECRET = "queue"
  process.env.LOG_LEVEL = "warn"
}

test("shouldLog respects LOG_LEVEL", async () => {
  setupEnv()
  const { shouldLog } = await import("../lib/logger")

  assert.equal(shouldLog("debug"), false)
  assert.equal(shouldLog("info"), false)
  assert.equal(shouldLog("warn"), true)
  assert.equal(shouldLog("error"), true)
})
