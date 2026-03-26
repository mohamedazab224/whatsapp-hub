import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createLogger } from "@/lib/logger"

const logger = createLogger("API:Health")

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  uptime: number
  environment: string
  version: string
  checks: {
    database: {
      status: boolean
      responseTime: number
    }
    api: {
      status: boolean
    }
  }
}

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()
  
  const checks = {
    database: { status: false, responseTime: 0 },
    api: { status: true },
  }

  try {
    // Check Supabase connection
    const supabase = await createSupabaseServerClient()
    
    const dbStartTime = Date.now()
    const { error: dbError } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .limit(1)

    const responseTime = Date.now() - dbStartTime
    checks.database.responseTime = responseTime
    checks.database.status = !dbError

    if (dbError) {
      logger.warn("Database check failed", { error: dbError.message })
    } else {
      logger.info("Database check passed", { responseTime })
    }

  } catch (error) {
    logger.error("Health check error", error)
    checks.database.status = false
  }

  const allHealthy = checks.database.status && checks.api.status
  
  const status: HealthStatus = {
    status: allHealthy ? "healthy" : checks.database.status ? "degraded" : "unhealthy",
    timestamp,
    uptime: Math.floor(Date.now() / 1000),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
    checks,
  }

  const statusCode = allHealthy ? 200 : 503
  
  return NextResponse.json(status, { 
    status: statusCode,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    }
  })
}
