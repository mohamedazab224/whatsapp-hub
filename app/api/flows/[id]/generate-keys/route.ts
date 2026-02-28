import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    // توليد مفاتيح تشفير
    const encryptionKey = crypto.randomBytes(32).toString('hex')
    const iv = crypto.randomBytes(16).toString('hex')

    return NextResponse.json({
      success: true,
      encryption_key: encryptionKey,
      iv: iv,
      message: 'تم توليد مفاتيح التشفير بنجاح',
    })
  } catch (error) {
    console.error('POST /api/flows/:id/generate-keys:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
