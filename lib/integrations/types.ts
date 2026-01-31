export type IntegrationEvent = {
  projectId: string
  workflowId: string
  whatsappNumberId: string
  contactId?: string | null
  messageId: string
  messageType: string
  messageBody?: string
  media?: {
    mediaId?: string
    mimeType?: string
    fileSize?: number
    storagePath?: string
    publicUrl?: string
  }
}
