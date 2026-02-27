import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
})

// التحقق من توقيع WhatsApp
function verifyWhatsAppSignature(req: NextRequest, body: string): boolean {
  const signature = req.headers.get("x-hub-signature-256")
  if (!signature) return false

  const appSecret = process.env.WHATSAPP_APP_SECRET!
  const hash = crypto.createHmac("sha256", appSecret).update(body).digest("hex")
  const expected = `sha256=${hash}`

  return signature === expected
}

// معالجة الرسائل الواردة من WhatsApp
async function handleMessage(message: any, phoneNumberId: string, projectId: string) {
  try {
    const senderPhone = message.from
    const messageId = message.id
    const timestamp = new Date(parseInt(message.timestamp) * 1000)
    const messageType = message.type

    // التأكد من وجود جهة الاتصال أو إنشاء واحدة جديدة
    let contact = await supabase
      .from("contacts")
      .select("*")
      .eq("wa_id", senderPhone)
      .eq("project_id", projectId)
      .single()

    if (contact.error) {
      const { data: newContact } = await supabase
        .from("contacts")
        .insert({
          wa_id: senderPhone,
          project_id: projectId,
          whatsapp_number_id: phoneNumberId,
          name: `Contact ${senderPhone.slice(-4)}`,
          status: "active",
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      contact.data = newContact
    } else {
      await supabase
        .from("contacts")
        .update({ last_message_at: timestamp.toISOString() })
        .eq("id", contact.data.id)
    }

    const contactId = contact.data?.id

    // التأكد من وجود محادثة أو إنشاء واحدة جديدة
    let conversation = await supabase
      .from("conversations")
      .select("*")
      .eq("contact_id", contactId)
      .eq("project_id", projectId)
      .single()

    if (conversation.error) {
      const { data: newConversation } = await supabase
        .from("conversations")
        .insert({
          contact_id: contactId,
          project_id: projectId,
          whatsapp_number_id: phoneNumberId,
          status: "open",
          unread_count: 1,
          created_at: new Date().toISOString(),
          last_message_at: timestamp.toISOString(),
        })
        .select()
        .single()

      conversation.data = newConversation
    } else {
      await supabase
        .from("conversations")
        .update({
          unread_count: (conversation.data?.unread_count || 0) + 1,
          last_message_at: timestamp.toISOString(),
        })
        .eq("id", conversation.data.id)
    }

    // حفظ الرسالة
    let messageRecord: any = {
      wamid: messageId,
      contact_id: contactId,
      project_id: projectId,
      whatsapp_number_id: phoneNumberId,
      from_phone_id: senderPhone,
      direction: "inbound",
      status: "received",
      type: messageType,
      timestamp: timestamp.toISOString(),
      created_at: new Date().toISOString(),
    }

    // معالجة النص
    if (messageType === "text" && message.text) {
      messageRecord.body = message.text.body
    }

    // معالجة الصور
    if (messageType === "image" && message.image) {
      const mediaId = message.image.id
      const caption = message.image.caption || ""

      const mediaUrl = await downloadMediaFromWhatsApp(mediaId)

      if (mediaUrl) {
        const filename = `messages/${contactId}/${Date.now()}-${mediaId}.jpg`
        const response = await fetch(mediaUrl)
        const blob = await response.blob()

        const { data: uploadData } = await supabase.storage
          .from("whatsapp_media")
          .upload(filename, blob)

        if (uploadData) {
          messageRecord.body = caption || "[صورة]"
        }
      }
    }

    // معالجة الفيديوهات
    if (messageType === "video" && message.video) {
      const mediaId = message.video.id
      const caption = message.video.caption || ""

      const mediaUrl = await downloadMediaFromWhatsApp(mediaId)

      if (mediaUrl) {
        const filename = `messages/${contactId}/${Date.now()}-${mediaId}.mp4`
        const response = await fetch(mediaUrl)
        const blob = await response.blob()

        const { data: uploadData } = await supabase.storage
          .from("whatsapp_media")
          .upload(filename, blob)

        if (uploadData) {
          messageRecord.body = caption || "[فيديو]"
        }
      }
    }

    // معالجة المستندات
    if (messageType === "document" && message.document) {
      const mediaId = message.document.id
      const filename = message.document.filename || "document"

      const mediaUrl = await downloadMediaFromWhatsApp(mediaId)

      if (mediaUrl) {
        const storagePath = `messages/${contactId}/${Date.now()}-${filename}`
        const response = await fetch(mediaUrl)
        const blob = await response.blob()

        const { data: uploadData } = await supabase.storage
          .from("whatsapp_media")
          .upload(storagePath, blob)

        if (uploadData) {
          messageRecord.body = `[مستند: ${filename}]`
        }
      }
    }

    // حفظ الرسالة في قاعدة البيانات
    const { data: savedMessage, error: messageError } = await supabase
      .from("messages")
      .insert(messageRecord)
      .select()
      .single()

    if (messageError) {
      console.error("Error saving message:", messageError)
    }

    return { success: true, messageId: savedMessage?.id }
  } catch (error) {
    console.error("Error handling message:", error)
    return { success: false, error: error }
  }
}

// معالجة تحديثات الحالة
async function handleStatusUpdate(update: any, projectId: string) {
  try {
    const { wamid, status, timestamp } = update

    const { error } = await supabase
      .from("messages")
      .update({
        status: status,
        timestamp: new Date(parseInt(timestamp) * 1000).toISOString(),
      })
      .eq("wamid", wamid)
      .eq("project_id", projectId)

    if (error) {
      console.error("Error updating message status:", error)
    }

    return { success: true }
  } catch (error) {
    console.error("Error handling status update:", error)
    return { success: false, error }
  }
}

// تحميل الملف من WhatsApp
async function downloadMediaFromWhatsApp(mediaId: string): Promise<string | null> {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const apiVersion = process.env.WHATSAPP_API_VERSION || "v24.0"

    const response = await fetch(
      `https://graph.instagram.com/${apiVersion}/${mediaId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const data = await response.json()

    if (!data.url) {
      console.error("No URL in media response:", data)
      return null
    }

    return data.url
  } catch (error) {
    console.error("Error downloading media from WhatsApp:", error)
    return null
  }
}

// POST request - استقبال الرسائل
export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text()
    const body = JSON.parse(bodyText)

    // التحقق من التوقيع
    if (!verifyWhatsAppSignature(request, bodyText)) {
      console.warn("Invalid WhatsApp signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    const entries = body.entry || []

    for (const entry of entries) {
      const changes = entry.changes || []

      for (const change of changes) {
        const value = change.value

        const phoneNumberId = value.metadata?.phone_number_id

        const { data: whatsappNumber } = await supabase
          .from("whatsapp_numbers")
          .select("project_id")
          .eq("phone_number_id", phoneNumberId)
          .single()

        const projectId = whatsappNumber?.project_id

        if (!projectId) {
          console.warn("No project found for phone number:", phoneNumberId)
          continue
        }

        // معالجة الرسائل
        const messages = value.messages || []
        for (const message of messages) {
          await handleMessage(message, phoneNumberId, projectId)
        }

        // معالجة تحديثات الحالة
        const statuses = value.statuses || []
        for (const status of statuses) {
          await handleStatusUpdate(status, projectId)
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

// GET request - التحقق من Webhook
export async function GET(request: NextRequest) {
  try {
    const mode = request.nextUrl.searchParams.get("hub.mode")
    const token = request.nextUrl.searchParams.get("hub.verify_token")
    const challenge = request.nextUrl.searchParams.get("hub.challenge")

    const verifyToken = process.env.VERIFY_TOKEN

    if (mode === "subscribe" && token === verifyToken) {
      console.log("Webhook verified successfully")
      return NextResponse.json(challenge)
    }

    console.warn("Webhook verification failed - invalid token or mode")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  } catch (error) {
    console.error("Error verifying webhook:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
