import { getPublicEnv } from "@/lib/env.public"
import { getQueueEnv, getSupabaseAdminEnv, getWebhookEnv } from "@/lib/env.server"

export const validateStartupEnv = () => {
  getPublicEnv()
  getSupabaseAdminEnv()
  getWebhookEnv()
  getQueueEnv()
}
