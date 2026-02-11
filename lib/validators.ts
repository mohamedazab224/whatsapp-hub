import { z } from "zod"
import { ValidationError } from "@/lib/errors"

/**
 * Validation schemas for common entities
 */

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  wa_id: z.string().min(1, "WhatsApp ID is required").max(255),
  whatsapp_number_id: z.string().optional(),
  status: z.enum(["active", "inactive", "blocked"]).default("active"),
})

export const messageSchema = z.object({
  contact_id: z.string().uuid("Valid contact ID is required"),
  body: z.string().min(1, "Message cannot be empty").max(4096),
  type: z.enum(["text", "image", "audio", "video", "document"]).default("text"),
  whatsapp_number_id: z.string().optional(),
  to_phone_id: z.string().optional(),
  from_phone_id: z.string().optional(),
})

export const templateSchema = z.object({
  name: z.string().min(1, "Template name is required").max(255),
  content: z.string().min(1, "Template content is required").max(4096),
  channel: z.enum(["whatsapp", "email", "sms"]).default("whatsapp"),
  variables: z.record(z.string()).optional(),
})

export const workflowSchema = z.object({
  name: z.string().min(1, "Workflow name is required").max(255),
  description: z.string().optional(),
  trigger_type: z.enum(["message_received", "contact_added", "manual"]),
  is_active: z.boolean().default(true),
})

export const webhookSchema = z.object({
  url: z.string().url("Invalid webhook URL"),
  events: z.array(z.string()).min(1, "At least one event must be selected"),
  is_active: z.boolean().default(true),
})

/**
 * Validate data against schema
 */
export function validateData<T>(data: unknown, schema: z.ZodSchema<T>): T {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    const errors = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
    throw new ValidationError(errors)
  }
  
  return result.data
}

/**
 * Type exports for convenience
 */
export type Contact = z.infer<typeof contactSchema>
export type Message = z.infer<typeof messageSchema>
export type Template = z.infer<typeof templateSchema>
export type Workflow = z.infer<typeof workflowSchema>
export type Webhook = z.infer<typeof webhookSchema>
