import { getSupabaseAdmin } from "@/lib/supabase"
import { logger } from "@/lib/logger"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = getSupabaseAdmin()
  const { data: media, error } = await supabase
    .from("media_files")
    .select("id, storage_path")
    .eq("id", id)
    .maybeSingle()

  if (error || !media) {
    logger.error("Media record not found", { error, mediaId: id })
    return new Response("Not Found", { status: 404 })
  }

  if (media.storage_path) {
    const { error: storageError } = await supabase.storage.from("media").remove([media.storage_path])
    if (storageError) {
      logger.error("Failed to remove media file", { error: storageError, mediaId: id })
      return new Response("Failed to delete media file", { status: 500 })
    }
  }

  const { error: deleteError } = await supabase.from("media_files").delete().eq("id", id)
  if (deleteError) {
    logger.error("Failed to delete media record", { error: deleteError, mediaId: id })
    return new Response("Failed to delete media record", { status: 500 })
  }

  return NextResponse.json({ status: "ok" })
}
