import { env } from "./env"

const API_VERSION = env.WHATSAPP_API_VERSION
const ACCESS_TOKEN = env.WHATSAPP_ACCESS_TOKEN

export type WhatsAppMediaInfo = {
  id: string
  url: string
  mime_type?: string
  sha256?: string
  file_size?: number
}

// Add template management functions
export async function createWhatsAppTemplate(
  businessAccountId: string,
  templateData: {
    name: string
    category: string
    language: string
    components: any[]
  },
) {
  const url = `https://graph.facebook.com/${API_VERSION}/${businessAccountId}/message_templates`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(templateData),
  })

  const data = await response.json()
  if (!response.ok) {
    console.error("[app] WhatsApp Template Creation Error:", data)
    throw new Error(data.error?.message || "Failed to create template")
  }

  return data
}

export async function getWhatsAppTemplateById(businessAccountId: string, templateId: string) {
  const url = `https://graph.facebook.com/${API_VERSION}/${templateId}`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  })

  const data = await response.json()
  if (!response.ok) {
    console.error("[app] WhatsApp Template Fetch Error:", data)
    return null
  }

  return data
}

export async function sendWhatsAppMessage(phoneNumberId: string, to: string, message: any) {
  const url = `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`

  // Format the message body correctly
  const messageBody = typeof message === "string" ? { text: { body: message } } : message

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      ...messageBody,
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    console.error("[app] WhatsApp API Error:", data)
    throw new Error(data.error?.message || "Failed to send message")
  }

  return data
}

export async function getWhatsAppTemplates(businessAccountId: string) {
  const url = `https://graph.facebook.com/${API_VERSION}/${businessAccountId}/message_templates`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  })

  const data = await response.json()
  if (!response.ok) {
    console.error("[app] WhatsApp Template Fetch Error:", data)
    throw new Error(data.error?.message || "Failed to fetch templates")
  }

  return data.data || []
}

export async function deleteWhatsAppTemplate(templateId: string) {
  const url = `https://graph.facebook.com/${API_VERSION}/${templateId}`
  const response = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  })

  const data = await response.json()
  if (!response.ok) {
    console.error("[app] WhatsApp Template Delete Error:", data)
    return false
  }
  return true
}

// Add media upload function
export async function uploadWhatsAppMedia(phoneNumberId: string, file: File) {
  const url = `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/media`
  const formData = new FormData()
  formData.append("file", file)
  formData.append("messaging_product", "whatsapp")

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: formData,
  })

  const data = await response.json()
  if (!response.ok) {
    console.error("[app] WhatsApp Media Upload Error:", data)
    throw new Error(data.error?.message || "Failed to upload media")
  }

  return data
}

export async function getWhatsAppMediaInfo(mediaId: string): Promise<WhatsAppMediaInfo> {
  const url = `https://graph.facebook.com/${API_VERSION}/${mediaId}`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  })

  const data = await response.json()
  if (!response.ok) {
    console.error("[app] WhatsApp Media Fetch Error:", data)
    throw new Error(data.error?.message || "Failed to fetch media info")
  }

  return data as WhatsAppMediaInfo
}

export async function downloadWhatsAppMedia(mediaId: string) {
  const info = await getWhatsAppMediaInfo(mediaId)

  const response = await fetch(info.url, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  })

  if (!response.ok) {
    const text = await response.text()
    console.error("[app] WhatsApp Media Download Error:", text)
    throw new Error("Failed to download media")
  }

  const buffer = await response.arrayBuffer()

  return { buffer, info }
}
