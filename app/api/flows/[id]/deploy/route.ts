import { NextRequest, NextResponse } from 'next/server'

const META_GRAPH_API = `https://graph.instagram.com/${process.env.WHATSAPP_API_VERSION}`
const BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    if (!ACCESS_TOKEN || !BUSINESS_ACCOUNT_ID) {
      return NextResponse.json({ error: 'Missing Meta configuration' }, { status: 500 })
    }

    // نشر التدفق إلى Meta
    const response = await fetch(`${META_GRAPH_API}/${BUSINESS_ACCOUNT_ID}/flows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        name: `Flow-${id}`,
        category: 'CUSTOMER_SUPPORT',
        data_api_version: 'v18.0',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to deploy flow to Meta')
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      flow_id: data.id,
      message: 'تم نشر التدفق إلى Meta بنجاح',
    })
  } catch (error) {
    console.error('POST /api/flows/:id/deploy:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 })
  }
}
