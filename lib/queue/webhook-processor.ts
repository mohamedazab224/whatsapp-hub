import { getSupabaseAdmin } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'

const logger = createLogger('WebhookQueue')

export interface WebhookMessage {
  id: string
  payload: any
  retries: number
  createdAt: Date
}

class WebhookQueue {
  private queue: WebhookMessage[] = []
  private processing = false
  private maxRetries = 3
  private maxQueueSize = 10000

  async enqueue(payload: any): Promise<string> {
    if (this.queue.length >= this.maxQueueSize) {
      logger.warn('Queue is full', { size: this.queue.length })
      throw new Error('Queue is full')
    }

    const id = `msg:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`
    this.queue.push({
      id,
      payload,
      retries: 0,
      createdAt: new Date(),
    })

    logger.info('Message queued', { id, queueSize: this.queue.length })

    // Start processing if not already running
    if (!this.processing) {
      this.process().catch((error) => {
        logger.error('Queue processing failed', error)
      })
    }

    return id
  }

  private async process() {
    if (this.processing) return

    this.processing = true

    try {
      while (this.queue.length > 0) {
        const message = this.queue.shift()
        if (!message) break

        try {
          await this.processMessage(message)
          logger.info('Message processed successfully', { id: message.id })
        } catch (error) {
          logger.error('Processing failed', { id: message.id, error })

          if (message.retries < this.maxRetries) {
            message.retries++
            // Re-queue with exponential backoff
            setTimeout(() => {
              this.queue.push(message)
            }, Math.pow(2, message.retries) * 1000)

            logger.info('Message re-queued', {
              id: message.id,
              retries: message.retries,
            })
          } else {
            logger.error('Max retries exceeded', { id: message.id })
          }
        }

        // Prevent blocking the event loop
        await new Promise((resolve) => setImmediate(resolve))
      }
    } finally {
      this.processing = false
    }
  }

  private async processMessage(message: WebhookMessage) {
    const supabase = getSupabaseAdmin()
    const payload = message.payload

    // Extract message data from WhatsApp webhook
    const entry = payload.entry?.[0]
    if (!entry) return

    const changes = entry.changes?.[0]
    if (!changes) return

    const value = changes.value
    if (!value) return

    const messages = value.messages || []
    const contacts = value.contacts || []
    const metadata = value.metadata || {}

    // Process each message
    for (const msg of messages) {
      const contact = contacts[0] || {}

      try {
        const { error } = await supabase.from('messages').insert({
          phone_number_id: metadata.phone_number_id,
          from: msg.from,
          to: metadata.display_phone_number,
          type: msg.type,
          body: msg.text?.body || null,
          message_id: msg.id,
          timestamp: new Date(parseInt(msg.timestamp) * 1000),
          webhook_timestamp: new Date(),
        })

        if (error) {
          logger.error('Failed to insert message', error)
          throw error
        }

        logger.debug('Message saved', { messageId: msg.id, from: msg.from })
      } catch (error) {
        logger.error('Failed to process message', {
          messageId: msg.id,
          error,
        })
        throw error
      }
    }
  }

  getQueueStats() {
    return {
      size: this.queue.length,
      processing: this.processing,
      maxSize: this.maxQueueSize,
    }
  }
}

export const webhookQueue = new WebhookQueue()
