import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"
import type { VAEMedia } from "@/lib/types/vae"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const workItemId = formData.get("work_item_id") as string
    const siteId = formData.get("site_id") as string
    const photographerName = formData.get("photographer_name") as string
    const notes = formData.get("notes") as string
    const source = (formData.get("source") as string) || "manual"
    const whatsappMessageId = formData.get("whatsapp_message_id") as string
    const gpsLocation = formData.get("gps_location") as string

    if (!file || !workItemId || !siteId) {
      return NextResponse.json(
        { error: "Missing required fields: file, work_item_id, site_id" },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()

    // إنشاء مسار التخزين
    const timestamp = new Date().getTime()
    const filename = `${siteId}/${workItemId}/${timestamp}-${file.name}`
    const bucket = "vae_media"

    // رفع الملف إلى Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      logger.error("Failed to upload file to storage", { error: uploadError })
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }

    // الحصول على رابط عام للملف
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filename)

    // إنشاء سجل الميديا في قاعدة البيانات
    const mediaRecord: Partial<VAEMedia> = {
      work_item_id: workItemId,
      site_id: siteId,
      media_type: file.type.startsWith("video") ? "video" : "image",
      original_filename: file.name,
      storage_path: filename,
      file_size: file.size,
      mime_type: file.type,
      capture_time: new Date().toISOString(),
      photographer_name: photographerName,
      notes: notes,
      source: source as any,
      whatsapp_message_id: whatsappMessageId,
      processing_status: "pending",
    }

    // معالجة GPS location إذا كان موجوداً
    if (gpsLocation) {
      try {
        mediaRecord.gps_location = JSON.parse(gpsLocation)
      } catch {
        logger.warn("Invalid GPS location format")
      }
    }

    const { data: insertedMedia, error: insertError } = await supabase
      .from("vae_media")
      .insert([mediaRecord])
      .select()
      .single()

    if (insertError) {
      logger.error("Failed to create media record", { error: insertError })
      return NextResponse.json({ error: "Failed to create media record" }, { status: 500 })
    }

    // تسجيل الحدث
    await supabase.from("vae_event_logs").insert({
      site_id: siteId,
      event_type: "media_uploaded",
      event_data: {
        media_id: insertedMedia.id,
        source: source,
        file_size: file.size,
      },
      created_by: photographerName || "system",
    })

    // إطلاق عملية معالجة AI (يمكن أن تكون asynchronous)
    // هذا سيتم تنفيذه في خط أنابيب منفصل
    queueAIAnalysis(insertedMedia.id)

    logger.info("Media uploaded successfully", { media_id: insertedMedia.id })

    return NextResponse.json({
      success: true,
      media_id: insertedMedia.id,
      processing_status: "pending",
      public_url: publicUrlData.publicUrl,
      message: "Media uploaded successfully. AI analysis is queued.",
    })
  } catch (error) {
    logger.error("Error uploading media", { error })
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 })
  }
}

// دالة لإطلاق معالجة AI (يمكن استبدالها بـ queue service لاحقاً)
async function queueAIAnalysis(mediaId: string) {
  try {
    // هنا سيتم إرسال الطلب إلى خدمة AI أو queue
    // مثلاً: إرسال إلى /api/vae/analyze/process
    await fetch(new URL("/api/vae/analyze/process", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ media_id: mediaId }),
    })
  } catch (error) {
    logger.warn("Failed to queue AI analysis", { error })
  }
}
