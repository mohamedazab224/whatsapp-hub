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
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
