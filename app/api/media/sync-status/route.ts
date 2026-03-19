import { NextRequest } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ResponseBuilder } from "@/lib/response/builder"
import { createLogger } from "@/lib/logger"
import { createSeafileClient } from "@/lib/media/seafile-client"

const logger = createLogger("API:SyncStatus")

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return ResponseBuilder.unauthorized()
    }

    // Get workspace
    const { data: workspace, error: wsError } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()

    if (wsError || !workspace) {
      return ResponseBuilder.notFound("Workspace not found")
    }

    // Get sync statistics
    const { data: mediaFiles, error: mediaError } = await supabase
      .from("media_files")
      .select("id, status, created_at, file_size", { count: "exact" })
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false })
      .limit(100)

    if (mediaError) throw mediaError

    // Calculate stats
    const totalFiles = mediaFiles?.length || 0
    const successCount = mediaFiles?.filter((f: any) => f.status === "downloaded").length || 0
    const failedCount = mediaFiles?.filter((f: any) => f.status === "failed").length || 0
    const pendingCount = mediaFiles?.filter((f: any) => f.status === "pending").length || 0
    const totalSize = (mediaFiles || []).reduce((sum: number, f: any) => sum + (f.file_size || 0), 0)

    // Test Seafile connection
    const seafileClient = createSeafileClient()
    let seafileStatus = { connected: false, message: "" }

    if (seafileClient) {
      const connectionTest = await seafileClient.testConnection()
      seafileStatus = {
        connected: connectionTest.success,
        message: connectionTest.message,
      }
    } else {
      seafileStatus = {
        connected: false,
        message: "Seafile not configured",
      }
    }

    logger.info("Sync status retrieved", {
      totalFiles,
      successCount,
      failedCount,
      pendingCount,
      seafileConnected: seafileStatus.connected,
    })

    return ResponseBuilder.success({
      stats: {
        totalFiles,
        successCount,
        failedCount,
        pendingCount,
        successRate: totalFiles > 0 ? ((successCount / totalFiles) * 100).toFixed(2) : "0",
        totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      },
      seafile: seafileStatus,
      recentFiles: mediaFiles?.slice(0, 10) || [],
    })
  } catch (error) {
    logger.error("Failed to get sync status", error)
    return ResponseBuilder.internalError()
  }
}
