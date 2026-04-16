import { NextRequest } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ResponseBuilder } from "@/lib/response/builder"
import { createLogger } from "@/lib/logger"
import { createSeafileClient } from "@/lib/media/seafile-client"

const logger = createLogger("API:SeafileTest")

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return ResponseBuilder.unauthorized()
    }

    // Test Seafile connection
    const seafileClient = createSeafileClient()

    if (!seafileClient) {
      logger.warn("Seafile not configured")
      return ResponseBuilder.badRequest("Seafile configuration missing")
    }

    logger.info("Testing Seafile connection")

    // Test 1: Connection
    const connectionTest = await seafileClient.testConnection()
    if (!connectionTest.success) {
      logger.error("Seafile connection failed", { message: connectionTest.message })
      return ResponseBuilder.error(connectionTest.message, 503, "SEAFILE_UNAVAILABLE")
    }

    // Test 2: List repositories
    const todayPath = `/whatsapp/${new Date().toISOString().split("T")[0]}`

    const ensureDirResult = await seafileClient.ensureDirectory(todayPath)
    if (!ensureDirResult.success) {
      logger.error("Seafile directory check failed", { message: ensureDirResult.message })
      return ResponseBuilder.error(ensureDirResult.message, 503, "SEAFILE_DIR_ERROR")
    }

    // Test 3: List files
    const listResult = await seafileClient.listFiles(todayPath)

    logger.info("Seafile connection test successful", {
      connectionTest: connectionTest.success,
      directoryExists: ensureDirResult.success,
      filesCount: listResult.files?.length || 0,
    })

    return ResponseBuilder.success({
      connectionStatus: {
        connected: connectionTest.success,
        message: connectionTest.message,
      },
      directoryStatus: {
        exists: ensureDirResult.success,
        path: todayPath,
        message: ensureDirResult.message,
      },
      files: {
        count: listResult.files?.length || 0,
        list: listResult.files || [],
      },
    })
  } catch (error) {
    logger.error("Seafile test failed", error)
    return ResponseBuilder.internalError()
  }
}

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

    const seafileClient = createSeafileClient()

    if (!seafileClient) {
      return ResponseBuilder.success({
        configured: false,
        message: "Seafile not configured",
      })
    }

    const testResult = await seafileClient.testConnection()

    return ResponseBuilder.success({
      configured: true,
      connected: testResult.success,
      message: testResult.message,
    })
  } catch (error) {
    logger.error("Seafile status check failed", error)
    return ResponseBuilder.internalError()
  }
}
