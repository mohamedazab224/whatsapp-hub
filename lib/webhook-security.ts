import { createHmac, timingSafeEqual } from "node:crypto"

export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null, appSecret: string) {
  if (!signatureHeader) return false

  const [scheme, signature] = signatureHeader.split("=")
  if (scheme !== "sha256" || !signature) return false

  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex")
  const signatureBuffer = Buffer.from(signature, "hex")
  const expectedBuffer = Buffer.from(expected, "hex")

  if (signatureBuffer.length !== expectedBuffer.length) return false

  return timingSafeEqual(signatureBuffer, expectedBuffer)
}
