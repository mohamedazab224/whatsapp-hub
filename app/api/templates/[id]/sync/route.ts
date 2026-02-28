import { NextRequest, NextResponse } from 'next/server'

const META_GRAPH_API = `https://graph.instagram.com/${process.env.WHATSAPP_API_VERSION}`
const BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!ACCESS_TOKEN) {
      return NextResponse.json({ error: 'Missing Meta configuration' }, { status: 500 })
    }

    // مزامنة القالب مع Meta
    const response = await fetch(`${META_GRAPH_API}/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        name: `template-${id}`,
        language: 'ar',
        category: 'MARKETING',
        components: [
          {
            type: 'BODY',
            text: 'Template from WhatsApp Hub',
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to sync template to Meta')
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      template_id: data.id,
      status: data.status,
      message: 'تم مزامنة القالب مع Meta بنجاح',
    })
  } catch (error) {
    console.error('POST /api/templates/:id/sync:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 })
  }
}
