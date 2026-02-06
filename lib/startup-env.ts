import { getPublicEnv } from "@/lib/env.public"
import { getQueueEnv, getSupabaseAdminEnv, getWebhookEnv } from "@/lib/env.server"

export const validateStartupEnv = () => {
  try {
    getPublicEnv()
    getSupabaseAdminEnv()
    getWebhookEnv()
    getQueueEnv()
  } catch (error) {
    // In development, log the error but don't crash the app
    if (process.env.NODE_ENV === "development") {
      console.warn("[Startup] Environment validation warning:", error instanceof Error ? error.message : String(error))
    } else {
      // In production, throw the error
      throw error
    }
  }
}
