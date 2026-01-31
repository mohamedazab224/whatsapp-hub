import { logger } from "../logger"
import type { IntegrationEvent } from "./types"

export async function sendToHelpdesk(event: IntegrationEvent) {
  try {
    logger.info("Helpdesk integration event received", { projectId: event.projectId, messageId: event.messageId })
  } catch (error) {
    logger.error("Helpdesk integration failed", { error, messageId: event.messageId })
  }
}
