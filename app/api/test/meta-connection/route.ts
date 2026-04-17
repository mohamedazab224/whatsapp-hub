import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Meta API Connection Test Endpoint
 * Tests each WhatsApp number configured in the system
 * Returns status of all connections
 */
export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json(
        { error: 'WHATSAPP_ACCESS_TOKEN not configured' },
        { status: 500 }
      )
    }

    // Get user's project
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (!project) {
      return NextResponse.json({ error: 'No project found' }, { status: 404 })
    }

    const projectData = project as unknown as { id: string }
    // Get all WhatsApp numbers for the project
    const { data: numbers } = await supabase
      .from('whatsapp_numbers')
      .select('*')
      .eq('project_id', projectData.id)

    const results = []

    for (const number of numbers || []) {
      try {
        const testRes = await fetch(
          `https://graph.instagram.com/v24.0/${number.phone_number_id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'User-Agent': 'WhatsApp-Hub-Test/1.0',
            },
          }
        )

        if (testRes.ok) {
          const metaData = await testRes.json()
          results.push({
            id: number.id,
            phone_number_id: number.phone_number_id,
            display_phone_number: number.display_phone_number,
            status: 'connected',
            verified_name: number.verified_name,
            meta_response: metaData,
            tested_at: new Date().toISOString(),
          })
        } else {
          const error = await testRes.json()
          results.push({
            id: number.id,
            phone_number_id: number.phone_number_id,
            status: 'failed',
            error: error.error?.message || 'Connection failed',
            tested_at: new Date().toISOString(),
          })
        }
      } catch (error) {
        results.push({
          id: number.id,
          phone_number_id: number.phone_number_id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          tested_at: new Date().toISOString(),
        })
      }
    }

    const connected = results.filter((r) => r.status === 'connected').length
    const total = results.length

    return NextResponse.json({
      success: true,
      summary: {
        total_numbers: total,
        connected: connected,
        failed: total - connected,
      },
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Meta connection test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
