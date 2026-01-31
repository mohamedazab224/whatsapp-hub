import assert from "node:assert/strict"
import test from "node:test"
import { createHmac } from "node:crypto"
import { verifyWebhookSignature } from "../lib/webhook-security"

test("verifyWebhookSignature returns true for a valid signature", () => {
  const appSecret = "test-secret"
  const rawBody = JSON.stringify({ hello: "world" })
  const signature = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex")

  assert.equal(verifyWebhookSignature(rawBody, `sha256=${signature}`, appSecret), true)
})

test("verifyWebhookSignature returns false for an invalid signature", () => {
  const appSecret = "test-secret"
  const rawBody = JSON.stringify({ hello: "world" })

  assert.equal(verifyWebhookSignature(rawBody, "sha256=deadbeef", appSecret), false)
})
