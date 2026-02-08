import { getSupabaseAdmin } from "@/lib/supabase"
import { logger } from "@/lib/logger"
import { NextRequest, NextResponse } from "next/server"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = getSupabaseAdmin()
  const { data: media, error } = await supabase
    .from("media_files")
    .select("id, storage_path")
    .eq("id", id)
    .maybeSingle()

  if (error || !media || !media.storage_path) {
    logger.error("Media not found for copy", { error, mediaId: id })
    return new Response("Not Found", { status: 404 })
  }

  const { data, error: signedError } = await supabase.storage.from("media").createSignedUrl(media.storage_path, 60 * 5)
  if (signedError || !data?.signedUrl) {
    logger.error("Failed to create signed URL", { error: signedError, mediaId: id })
    return new Response("Failed to create URL", { status: 500 })
  }

  return NextResponse.json({ url: data.signedUrl })
}
