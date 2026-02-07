import { getPublicEnv } from "@/lib/env.public"
import { getQueueEnv, getSupabaseAdminEnv, getWebhookEnv } from "@/lib/env.server"

export const validateStartupEnv = () => {
  try {
    // Only validate in production
    if (process.env.NODE_ENV !== "development") {
      getPublicEnv()
      getSupabaseAdminEnv()
      getWebhookEnv()
      getQueueEnv()
    }
  } catch (error) {
    // In development, silently ignore validation errors to allow development mode to work
    if (process.env.NODE_ENV === "development") {
      // Silently ignore
    } else {
      // In production, throw the error
      throw error
    }
  }
}
