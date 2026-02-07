import { NextResponse } from "next/server"
import { processMaintenanceFlow } from "@/lib/flow-processor"
import { logger } from "@/lib/logger"

export async function POST(request: Request) {
  const requestId = crypto.randomUUID()

  try {
    const payload = await request.json()
    
    // Extract project_id from context (you can pass it via query param or header)
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      )
    }

    logger.info('[Flow API] Processing maintenance flow', { requestId, projectId })

    const result = await processMaintenanceFlow(payload, projectId)

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    logger.error('[Flow API] Failed to process', { requestId, error: error.message })
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
