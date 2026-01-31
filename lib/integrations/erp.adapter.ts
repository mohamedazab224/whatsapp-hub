import { logger } from "../logger"
import type { IntegrationEvent } from "./types"

export async function sendToErp(event: IntegrationEvent) {
  try {
    logger.info("ERP integration event received", { projectId: event.projectId, messageId: event.messageId })
  } catch (error) {
    logger.error("ERP integration failed", { error, messageId: event.messageId })
  }
}
