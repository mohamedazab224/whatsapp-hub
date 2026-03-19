import axios, { AxiosError } from "axios"

interface SeafileConfig {
  server: string
  token: string
  libId: string
}

interface UploadResponse {
  success: boolean
  path?: string
  file_id?: string
  error?: string
}

interface ListFilesResponse {
  success: boolean
  files?: Array<{
    name: string
    type: string
    size: number
    mtime: number
  }>
  error?: string
}

export class SeafileClient {
  private config: SeafileConfig

  constructor(server: string, token: string, libId: string) {
    this.config = {
      server: server.replace(/\/$/, ""), // Remove trailing slash
      token,
      libId,
    }
  }

  /**
   * Test connection to Seafile server
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.get(`${this.config.server}/api/v2.1/repos/`, {
        headers: {
          Authorization: `Token ${this.config.token}`,
          "User-Agent": "WhatsApp-Hub/1.0",
        },
      })

      console.log("[v0] Seafile connection test: SUCCESS")
      return {
        success: true,
        message: `Connected to Seafile. Found ${response.data.length} repositories.`,
      }
    } catch (error) {
      const axiosError = error as AxiosError
      console.error("[v0] Seafile connection test FAILED:", axiosError.message)
      return {
        success: false,
        message: `Connection failed: ${axiosError.message}`,
      }
    }
  }

  /**
   * Upload file to Seafile
   */
  async uploadFile(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    remotePath: string
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData()
      const blob = new Blob([buffer], { type: mimeType })
      formData.append("file", blob, fileName)

      console.log(`[v0] Uploading to Seafile: ${remotePath}/${fileName}`)

      const response = await axios.post(
        `${this.config.server}/api/v2.1/repos/${this.config.libId}/upload/?p=${remotePath}/`,
        formData,
        {
          headers: {
            Authorization: `Token ${this.config.token}`,
            "User-Agent": "WhatsApp-Hub/1.0",
          },
        }
      )

      const result = response.data as any
      console.log(`[v0] Seafile upload successful: ${remotePath}/${fileName}`)

      return {
        success: true,
        path: `${remotePath}/${fileName}`,
        file_id: result.id,
      }
    } catch (error) {
      const axiosError = error as AxiosError
      const message = axiosError.response?.data as any
      console.error("[v0] Seafile upload failed:", message?.error_msg || axiosError.message)

      return {
        success: false,
        error: message?.error_msg || axiosError.message,
      }
    }
  }

  /**
   * List files in Seafile directory
   */
  async listFiles(remotePath: string): Promise<ListFilesResponse> {
    try {
      const response = await axios.get(
        `${this.config.server}/api/v2.1/repos/${this.config.libId}/dir/`,
        {
          params: { p: remotePath },
          headers: {
            Authorization: `Token ${this.config.token}`,
            "User-Agent": "WhatsApp-Hub/1.0",
          },
        }
      )

      const entries = response.data as any[]
      const files = entries
        .filter((entry) => entry.type === "file")
        .map((entry) => ({
          name: entry.name,
          type: entry.type,
          size: entry.size,
          mtime: entry.mtime,
        }))

      console.log(`[v0] Listed ${files.length} files from ${remotePath}`)

      return {
        success: true,
        files,
      }
    } catch (error) {
      const axiosError = error as AxiosError
      console.error("[v0] Seafile list files failed:", axiosError.message)

      return {
        success: false,
        error: axiosError.message,
      }
    }
  }

  /**
   * Get directory info and create if not exists
   */
  async ensureDirectory(remotePath: string): Promise<{ success: boolean; message: string }> {
    try {
      // Try to list directory first
      const listResult = await axios.get(
        `${this.config.server}/api/v2.1/repos/${this.config.libId}/dir/`,
        {
          params: { p: remotePath },
          headers: {
            Authorization: `Token ${this.config.token}`,
            "User-Agent": "WhatsApp-Hub/1.0",
          },
        }
      )

      console.log(`[v0] Seafile directory exists: ${remotePath}`)
      return {
        success: true,
        message: "Directory exists",
      }
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 404) {
        // Directory doesn't exist, try to create it
        try {
          await axios.post(
            `${this.config.server}/api/v2.1/repos/${this.config.libId}/dir/`,
            { operation: "mkdir" },
            {
              params: { p: remotePath },
              headers: {
                Authorization: `Token ${this.config.token}`,
                "User-Agent": "WhatsApp-Hub/1.0",
              },
            }
          )

          console.log(`[v0] Seafile directory created: ${remotePath}`)
          return {
            success: true,
            message: "Directory created",
          }
        } catch (createError) {
          const createAxiosError = createError as AxiosError
          console.error("[v0] Seafile create directory failed:", createAxiosError.message)
          return {
            success: false,
            message: `Failed to create directory: ${createAxiosError.message}`,
          }
        }
      } else {
        console.error("[v0] Seafile directory check failed:", axiosError.message)
        return {
          success: false,
          message: `Directory check failed: ${axiosError.message}`,
        }
      }
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(filePath: string): Promise<{ success: boolean; info?: any; error?: string }> {
    try {
      const response = await axios.get(
        `${this.config.server}/api/v2.1/repos/${this.config.libId}/file/detail/`,
        {
          params: { p: filePath },
          headers: {
            Authorization: `Token ${this.config.token}`,
            "User-Agent": "WhatsApp-Hub/1.0",
          },
        }
      )

      return {
        success: true,
        info: response.data,
      }
    } catch (error) {
      const axiosError = error as AxiosError
      console.error("[v0] Seafile get file info failed:", axiosError.message)

      return {
        success: false,
        error: axiosError.message,
      }
    }
  }
}

/**
 * Create Seafile client from environment variables
 */
export function createSeafileClient(): SeafileClient | null {
  const server = process.env.SEAFILE_SERVER
  const token = process.env.SEAFILE_TOKEN
  const libId = process.env.SEAFILE_LIB_ID

  if (!server || !token || !libId) {
    console.warn("[v0] Seafile configuration incomplete, client not created")
    return null
  }

  return new SeafileClient(server, token, libId)
}
