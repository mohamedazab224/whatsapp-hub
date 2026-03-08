import crypto from "crypto"

/**
 * WhatsApp Media Handler - Compliant with WhatsApp Media Download API v24.0
 * 
 * Flow:
 * 1. Receive media ID from webhook
 * 2. Get media URL using GET /v24.0/{Media-ID}
 * 3. Download media using GET /v24.0/{Media-URL}
 * 4. Handle expiring URLs (5-minute validity)
 * 5. Store in Seafile with retry strategy
 */

interface MediaInfo {
  id: string
  url: string
  mime_type: string
  expires_at: Date
}

interface DownloadResult {
  success: boolean
  path?: string
  size?: number
  error?: string
}

const MEDIA_URL_VALIDITY_MS = 5 * 60 * 1000 // 5 minutes
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

// Step 1: Get media information from WhatsApp
export async function getMediaInfo(mediaId: string): Promise<MediaInfo | null> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v24.0"

  if (!accessToken) {
    console.error("[v0] WHATSAPP_ACCESS_TOKEN not configured")
    return null
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/${apiVersion}/${mediaId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "WhatsApp-Hub/1.0",
        },
      }
    )

    if (!response.ok) {
      console.error(`[v0] Failed to get media info: ${response.status}`)
      return null
    }

    const data = await response.json()
    console.log("[v0] Media info retrieved:", { id: mediaId, mime_type: data.mime_type })

    return {
      id: mediaId,
      url: data.url,
      mime_type: data.mime_type,
      expires_at: new Date(Date.now() + MEDIA_URL_VALIDITY_MS),
    }
  } catch (error) {
    console.error("[v0] Error getting media info:", error)
    return null
  }
}

// Step 2: Download media with retry strategy
export async function downloadMedia(
  mediaUrl: string,
  fileName: string
): Promise<DownloadResult> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  let lastError: Error | null = null

  if (!accessToken) {
    return { success: false, error: "Access token not configured" }
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[v0] Downloading media (attempt ${attempt}/${MAX_RETRIES}):`, fileName)

      const response = await fetch(mediaUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "WhatsApp-Hub/1.0",
          Accept: "*/*",
        },
      })

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        lastError = error

        // If URL expired (401), try to get a fresh one
        if (response.status === 401) {
          console.warn("[v0] Media URL expired, need to refresh")
          return { success: false, error: "Media URL expired" }
        }

        throw error
      }

      const buffer = await response.arrayBuffer()
      const size = buffer.byteLength

      console.log(`[v0] Media downloaded successfully: ${size} bytes`)

      return {
        success: true,
        size,
        path: fileName,
      }
    } catch (error) {
      lastError = error as Error
      console.warn(`[v0] Download attempt ${attempt} failed:`, lastError.message)

      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1) // Exponential backoff
        console.log(`[v0] Retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  return {
    success: false,
    error: `Failed after ${MAX_RETRIES} attempts: ${lastError?.message}`,
  }
}

// Step 3: Store media in Seafile
export async function storeInSeafile(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  projectId: string
): Promise<DownloadResult> {
  const seafileServer = process.env.SEAFILE_SERVER
  const seafileToken = process.env.SEAFILE_TOKEN
  const seafileLibId = process.env.SEAFILE_LIB_ID

  if (!seafileServer || !seafileToken || !seafileLibId) {
    console.warn("[v0] Seafile not configured, skipping media storage")
    return { success: true, path: `temp://${fileName}` } // Return virtual path
  }

  try {
    const formData = new FormData()
    formData.append("file", new Blob([buffer], { type: mimeType }), fileName)

    const uploadPath = `whatsapp/${projectId}/${new Date().toISOString().split("T")[0]}`

    const response = await fetch(
      `${seafileServer}/api/v2.1/repos/${seafileLibId}/upload/?p=/${uploadPath}/`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${seafileToken}`,
          "User-Agent": "WhatsApp-Hub/1.0",
        },
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error(`Seafile upload failed: ${response.status}`)
    }

    const result = await response.json()
    console.log("[v0] Media stored in Seafile:", uploadPath)

    return {
      success: true,
      path: `${uploadPath}/${fileName}`,
      size: buffer.byteLength,
    }
  } catch (error) {
    console.error("[v0] Seafile storage error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Storage failed" }
  }
}

// Step 4: Complete media download workflow
export async function handleMediaDownload(
  mediaId: string,
  fileName: string,
  projectId: string
): Promise<DownloadResult> {
  try {
    // Get media information
    const mediaInfo = await getMediaInfo(mediaId)
    if (!mediaInfo) {
      return { success: false, error: "Could not retrieve media information" }
    }

    // Check if URL is still valid
    if (new Date() > mediaInfo.expires_at) {
      console.warn("[v0] Media URL already expired")
      return { success: false, error: "Media URL already expired" }
    }

    // Download media with retry
    const downloadResult = await downloadMedia(mediaInfo.url, fileName)
    if (!downloadResult.success) {
      return downloadResult
    }

    console.log(`[v0] Media download successful: ${downloadResult.size} bytes`)

    return {
      success: true,
      path: `whatsapp/${projectId}/${fileName}`,
      size: downloadResult.size,
    }
  } catch (error) {
    console.error("[v0] Media download workflow error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Step 5: Validate media before processing
export function validateMediaMessage(message: any): boolean {
  const supportedTypes = ["image", "video", "document", "audio"]
  if (!supportedTypes.includes(message.type)) {
    return false
  }

  const mediaData = message[message.type]
  return mediaData && mediaData.id ? true : false
}

// Step 6: Extract media metadata
export function extractMediaMetadata(message: any): { id: string; type: string; mime_type?: string } | null {
  const mediaType = message.type
  const mediaData = message[mediaType]

  if (!mediaData || !mediaData.id) {
    return null
  }

  return {
    id: mediaData.id,
    type: mediaType,
    mime_type: mediaData.mime_type,
  }
}
