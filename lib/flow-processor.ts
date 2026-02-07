import { createSupabaseServerClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

interface FlowData {
  service_type: string
  description: string
  address?: string
  preferred_date?: string
  preferred_time?: string
  notes?: string
  photos?: string[]
}

interface WebhookPayload {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: {
          display_phone_number: string
          phone_number_id: string
        }
        contacts?: Array<{
          profile: { name: string }
          wa_id: string
        }>
        messages?: Array<{
          from: string
          id: string
          timestamp: string
          type: string
          interactive?: {
            type: string
            nfm_reply?: {
              name: string
              body: string
              response_json: string
            }
          }
        }>
      }
      field: string
    }>
  }>
}

export async function processMaintenanceFlow(payload: WebhookPayload, projectId: string) {
  try {
    const entry = payload.entry?.[0]
    const change = entry?.changes?.[0]
    const value = change?.value
    const message = value?.messages?.[0]
    const contact = value?.contacts?.[0]

    if (!message || message.type !== 'interactive') {
      logger.info('[Flow] Not a Flow message, skipping', { type: message?.type })
      return { success: false, reason: 'not_flow_message' }
    }

    const nfmReply = message.interactive?.nfm_reply
    if (!nfmReply || nfmReply.name !== 'maintenance_request_form') {
      logger.info('[Flow] Not maintenance request flow', { flowName: nfmReply?.name })
      return { success: false, reason: 'wrong_flow' }
    }

    // Extract phone number
    const phone = contact?.wa_id || message.from
    if (!phone) {
      throw new Error('No phone number found in webhook payload')
    }

    // Parse Flow data
    let flowData: FlowData
    try {
      flowData = JSON.parse(nfmReply.response_json)
    } catch (error) {
      throw new Error('Invalid Flow response JSON')
    }

    // Validate required fields
    if (!flowData.service_type || !flowData.description) {
      throw new Error('Missing required fields: service_type and description are required')
    }

    const supabase = await createSupabaseServerClient()

    // 1. Find or create customer
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('project_id', projectId)
      .eq('phone', phone)
      .single()

    let customerId: string

    if (existingCustomer) {
      customerId = existingCustomer.id
      logger.info('[Flow] Using existing customer', { customerId, phone })
    } else {
      // Create new customer
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          project_id: projectId,
          phone: phone,
          name: contact?.profile?.name || phone,
          address: flowData.address
        })
        .select('id')
        .single()

      if (customerError) throw customerError

      customerId = newCustomer.id
      logger.info('[Flow] Created new customer', { customerId, phone })
    }

    // 2. Create maintenance request
    const { data: maintenanceRequest, error: requestError } = await supabase
      .from('maintenance_requests')
      .insert({
        project_id: projectId,
        customer_id: customerId,
        service_type: flowData.service_type,
        description: flowData.description,
        address: flowData.address,
        preferred_date: flowData.preferred_date,
        preferred_time: flowData.preferred_time,
        notes: flowData.notes,
        photos: flowData.photos ? JSON.stringify(flowData.photos) : '[]',
        status: 'pending'
      })
      .select('id')
      .single()

    if (requestError) throw requestError

    logger.info('[Flow] Created maintenance request', {
      requestId: maintenanceRequest.id,
      customerId,
      serviceType: flowData.service_type
    })

    // 3. Send confirmation template
    await sendConfirmationTemplate(phone, projectId, maintenanceRequest.id, flowData)

    return {
      success: true,
      customerId,
      requestId: maintenanceRequest.id
    }
  } catch (error) {
    logger.error('[Flow] Processing failed', { error })
    throw error
  }
}

async function sendConfirmationTemplate(
  phone: string,
  projectId: string,
  requestId: string,
  flowData: FlowData
) {
  try {
    const supabase = await createSupabaseServerClient()

    // Get WhatsApp number for this project
    const { data: whatsappNumber } = await supabase
      .from('whatsapp_numbers')
      .select('phone_number_id')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .single()

    if (!whatsappNumber) {
      logger.warn('[Flow] No active WhatsApp number found for project', { projectId })
      return
    }

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    if (!accessToken) {
      throw new Error('WHATSAPP_ACCESS_TOKEN not configured')
    }

    // Send confirmation message using template
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${whatsappNumber.phone_number_id}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'template',
          template: {
            name: 'order_created',
            language: { code: 'ar' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: requestId.substring(0, 8).toUpperCase() }
                ]
              }
            ]
          }
        })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to send confirmation: ${error}`)
    }

    logger.info('[Flow] Confirmation template sent', { phone, requestId })
  } catch (error) {
    logger.error('[Flow] Failed to send confirmation', { error })
    // Don't throw - request was created successfully
  }
}
