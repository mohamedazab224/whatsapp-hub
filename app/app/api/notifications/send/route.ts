import { NextRequest, NextResponse } from "next/server"
import { MultiChannelNotificationService } from "@/lib/notifications/multi-channel"

export async function POST(request: NextRequest) {
  try {
    const {
      projectId,
      channels = ["email", "whatsapp"],
      templateName,
      recipient,
      variables,
      options,
    } = await request.json()

    if (!projectId || !templateName || !recipient) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const service = new MultiChannelNotificationService(projectId)
    const result = await service.send(channels, templateName, recipient, variables ?? {}, options)

    return NextResponse.json({
      success: result.success,
      results: result.results,
    })
  } catch (error) {
    console.error("[Notifications] Error sending notification:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    )
  }
}
