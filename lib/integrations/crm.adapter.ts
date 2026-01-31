import { logger } from "../logger"
import type { IntegrationEvent } from "./types"

export async function sendToCrm(event: IntegrationEvent) {
  try {
    logger.info("CRM integration event received", { projectId: event.projectId, messageId: event.messageId })
  } catch (error) {
    logger.error("CRM integration failed", { error, messageId: event.messageId })
  }
}
