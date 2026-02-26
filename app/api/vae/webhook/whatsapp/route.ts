import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

// هذا الـ endpoint يستقبل الرسائل من WhatsApp (الصور والفيديوهات)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // معالجة webhook من WhatsApp
    const { entry } = body

    if (!entry || !entry[0]) {
      return NextResponse.json({ error: "Invalid webhook format" }, { status: 400 })
    }

    const messages = entry[0].changes?.[0]?.value?.messages
    const mediaObjects = entry[0].changes?.[0]?.value?.messages

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ ok: true }) // Ignore messages without media
    }

    const supabase = createSupabaseAdminClient()

    for (const message of messages) {
      // تجاهل الرسائل النصية
      if (!message.image && !message.video) {
        continue
      }

      const media = message.image || message.video
      const mediaId = media?.id
      const mediaType = message.image ? "image" : "video"
      const senderPhone = message.from
      const timestamp = parseInt(message.timestamp) * 1000

      // محاولة العثور على موقع/مشروع بناءً على رقم المرسل
      const { data: workItem } = await supabase
        .from("vae_work_items")
        .select("site_id")
        .eq("photographer_name", senderPhone)
        .limit(1)
        .single()

      if (!workItem) {
        logger.warn("Could not match WhatsApp number to work item", { senderPhone })
        continue
      }

      // تحميل الملف من WhatsApp
      const mediaUrl = await downloadMediaFromWhatsApp(mediaId)

      if (!mediaUrl) {
        logger.error("Failed to download media from WhatsApp", { mediaId })
        continue
      }

      // رفع الملف إلى Supabase Storage
      const filename = `${workItem.site_id}/${workItem.id}/${timestamp}-whatsapp.${mediaType === "image" ? "jpg" : "mp4"}`

      const fileResponse = await fetch(mediaUrl)
      const fileBlob = await fileResponse.blob()

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("vae_media")
        .upload(filename, fileBlob)

      if (uploadError) {
        logger.error("Failed to upload WhatsApp media", { error: uploadError })
        continue
      }

      // إنشاء سجل الميديا
      const { data: media_record, error: insertError } = await supabase
        .from("vae_media")
        .insert({
          work_item_id: workItem.id,
          site_id: workItem.site_id,
          media_type: mediaType,
          storage_path: filename,
          mime_type: mediaType === "image" ? "image/jpeg" : "video/mp4",
          capture_time: new Date(timestamp).toISOString(),
          source: "whatsapp",
          whatsapp_message_id: message.id,
          photographer_name: senderPhone,
          processing_status: "pending",
        })
        .select()
        .single()

      if (insertError) {
        logger.error("Failed to create media record from WhatsApp", { error: insertError })
        continue
      }

      logger.info("WhatsApp media processed successfully", { media_id: media_record?.id })

      // إطلاق معالجة AI
      await fetch(new URL("/api/vae/analyze/process", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ media_id: media_record?.id }),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error("Error processing WhatsApp webhook", { error })
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

async function downloadMediaFromWhatsApp(mediaId: string): Promise<string | null> {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0"

    // الحصول على معلومات الملف
    const metadataResponse = await fetch(`https://graph.instagram.com/${apiVersion}/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const metadata = await metadataResponse.json()

    if (!metadata.url) {
      logger.error("Failed to get media URL from WhatsApp", { mediaId })
      return null
    }

    return metadata.url
  } catch (error) {
    logger.error("Error downloading media from WhatsApp", { error })
    return null
  }
}

// GET endpoint للتحقق من webhook (required by WhatsApp)
export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode")
  const token = request.nextUrl.searchParams.get("hub.verify_token")
  const challenge = request.nextUrl.searchParams.get("hub.challenge")

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

  if (mode === "subscribe" && token === verifyToken) {
    return NextResponse.json(challenge)
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}
