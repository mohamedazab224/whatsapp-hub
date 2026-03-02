# WhatsApp Business API Middleware Documentation

## Overview

This middleware layer acts as a bridge between the **WhatsApp Business API** and the **VAE (Visual Accountability Engine)** system. It handles message receiving, routing, flow management, and media processing.

## Architecture

```
WhatsApp User
     ↓
WhatsApp Business API
     ↓
Webhook Receiver (signature verification, event parsing)
     ↓
Flow Router (determine target flow/handler)
     ↓
VAE System (process and respond)
     ↓
Message Sender (send response back through WhatsApp)
```

## Components

### 1. Webhook Receiver (`lib/middleware/whatsapp-webhook-receiver.ts`)

Handles incoming events from Meta's WhatsApp Business API.

**Features:**
- HMAC-SHA256 signature verification
- Message event processing
- Status update handling
- Media file tracking
- Contact management
- Event forwarding to VAE

**Key Functions:**

#### `verifyWebhookSignature(body: string, signature: string, appSecret: string): Promise<boolean>`
Verifies webhook signature using Meta's HMAC scheme.

**Example:**
```typescript
const isValid = await verifyWebhookSignature(bodyText, signature, appSecret)
```

#### `processWhatsAppWebhook(payload: WhatsAppWebhookPayload, phoneNumberId: string)`
Processes incoming webhook payload and stores messages/contacts.

**Returns:**
```typescript
{
  success: boolean
  processedEvents: number
  errors: string[]
}
```

#### `forwardToVAE(projectId: string, eventType: "message" | "status_update" | "contact_change", data: any)`
Forwards processed events to the project's configured webhook endpoint.

### 2. Flow Router (`lib/middleware/flow-router.ts`)

Routes incoming messages to appropriate flows based on rules and patterns.

**Features:**
- Keyword-based routing
- Regex pattern matching
- Contact-specific routing
- Priority-based rule evaluation
- Dynamic rule management

**Key Functions:**

#### `routeMessage(context: MessageContext)`
Evaluates routing rules and determines target flow.

**Input:**
```typescript
{
  projectId: string
  contactId: string
  phoneNumberId: string
  messageBody: string
  messageType: "text" | "image" | "video" | "document"
  senderPhone: string
}
```

**Output:**
```typescript
{
  shouldRoute: boolean
  targetFlow?: string
  flowParams?: Record<string, any>
  error?: string
}
```

#### `createRoutingRule(projectId, pattern, flowType, targetFlow)`
Creates a new routing rule.

#### `updateRoutingRule(ruleId, updates)`
Updates an existing routing rule.

#### `deleteRoutingRule(ruleId)`
Deletes a routing rule.

### 3. Webhook Handler (`app/api/vae/webhook/whatsapp/route.ts`)

Main HTTP endpoint for WhatsApp events.

**POST** `/api/vae/webhook/whatsapp`
- Receives webhook events from WhatsApp
- Verifies signatures
- Processes through middleware pipeline
- Routes messages to flows

**GET** `/api/vae/webhook/whatsapp`
- Webhook verification endpoint
- Called by Meta during setup

## Environment Variables

```bash
# WhatsApp Configuration
WHATSAPP_APP_SECRET=your_app_secret
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_API_VERSION=v24.0  # Optional, defaults to v24.0

# Alternative token name
VERIFY_TOKEN=your_verify_token  # Alternative to WHATSAPP_WEBHOOK_VERIFY_TOKEN
```

## Data Flow

### 1. Receiving a Message

```
User sends message on WhatsApp
  ↓
WhatsApp API sends webhook to POST /api/vae/webhook/whatsapp
  ↓
Handler verifies signature using WHATSAPP_APP_SECRET
  ↓
Handler calls processWhatsAppWebhook()
  ↓
Middleware:
  - Creates/updates contact
  - Stores message in database
  - Handles media files
  - Updates conversation status
  ↓
Handler calls routeMessage()
  ↓
Router evaluates rules and determines target flow
  ↓
Handler calls forwardToVAE()
  ↓
VAE processes the message and responds
```

### 2. Message Status Updates

```
WhatsApp API sends status update (delivered, read, etc.)
  ↓
Webhook handler processes status update
  ↓
Message status updated in database
  ↓
Status forwarded to VAE if webhook configured
```

## API Endpoints

### Webhook Event Receiver

**POST** `/api/vae/webhook/whatsapp`

**Headers:**
```
x-hub-signature-256: sha256=<signature>
Content-Type: application/json
```

**Body:**
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "entry_id",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "+1234567890",
              "phone_number_id": "123456789"
            },
            "messages": [
              {
                "from": "+1987654321",
                "id": "wamid.123",
                "timestamp": "1234567890",
                "type": "text",
                "text": {
                  "body": "Hello!"
                }
              }
            ],
            "statuses": [
              {
                "id": "wamid.456",
                "status": "delivered",
                "timestamp": "1234567891",
                "recipient_id": "+1987654321"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "ok": true,
  "processed": 2
}
```

### Webhook Verification

**GET** `/api/vae/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=<token>&hub.challenge=<challenge>`

**Response:** Returns the challenge value if verification succeeds.

## Message Types Supported

- **text**: Simple text messages
- **image**: Images with optional captions
- **video**: Videos with optional captions
- **document**: PDFs, Word docs, etc.
- **audio**: Audio files (voice messages, MP3s)

## Routing Rule Types

### 1. Keyword Trigger
Routes based on keywords in message body.

**Example Rule:**
```
Pattern: "report|status|update"
Flow Type: keyword_trigger
```

When message contains any of these keywords, route to specified flow.

### 2. Pattern/Regex
Routes based on regex pattern matching.

**Example Rule:**
```
Pattern: "^order-\d{6}$"
Flow Type: intent_based
```

Routes messages like "order-123456" to order processing flow.

### 3. Contact-Based
Routes based on sender phone number.

**Example Rule:**
```
Pattern: "+1234567890"
Flow Type: contact_based
```

Routes all messages from this phone to a specific flow.

## Database Schema

### Key Tables

**whatsapp_numbers**
```
id: uuid
project_id: uuid
phone_number_id: string
display_phone_number: string
verified_name: string
quality_rating: string
is_active: boolean
```

**contacts**
```
id: uuid
project_id: uuid
whatsapp_number_id: uuid
wa_id: string (WhatsApp ID)
name: string
profile_picture_url: string
status: string
last_message_at: timestamp
```

**messages**
```
id: uuid
project_id: uuid
contact_id: uuid
whatsapp_number_id: uuid
wamid: string (WhatsApp message ID)
body: text
type: string (text, image, video, etc.)
direction: string (inbound, outbound)
status: string (received, sent, delivered, read, failed)
timestamp: timestamp
```

**workflows** (used for routing rules)
```
id: uuid
project_id: uuid
name: string (pattern to match)
trigger_type: string (keyword, pattern, contact)
is_active: boolean
description: text
```

**webhook_endpoints** (VAE webhook config)
```
id: uuid
project_id: uuid
url: string (VAE webhook URL)
secret: string (signing secret)
is_active: boolean
```

## Error Handling

All middleware functions return structured error responses:

```typescript
{
  success: boolean
  error?: string
  details?: string[]
}
```

**Common Errors:**
- `Invalid signature` - Webhook signature verification failed
- `No project found` - WhatsApp number not linked to project
- `Processing error` - Error while storing message/contact
- `Routing error` - Error while evaluating routing rules
- `VAE webhook failed` - Error forwarding to VAE

## Security Considerations

1. **Signature Verification**: All webhook requests are verified using HMAC-SHA256 with the app secret
2. **Secret Storage**: Never commit secrets to version control
3. **Rate Limiting**: Implement rate limiting on webhook endpoint
4. **RLS Policies**: Database tables use Row Level Security to restrict access
5. **Admin Client**: Webhook handler uses admin client for creation operations

## Testing

### Verify Webhook Configuration

```bash
curl -X GET "http://localhost:3000/api/vae/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=TEST_CHALLENGE"
```

Should return: `TEST_CHALLENGE`

### Send Test Webhook

```bash
# Create test payload
PAYLOAD='{"object":"whatsapp_business_account","entry":[{"changes":[{"value":{"messaging_product":"whatsapp","messages":[{"from":"+1234567890","type":"text","text":{"body":"test"}}]}}]}]}'

# Create signature
SIGNATURE="sha256=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "YOUR_APP_SECRET" | cut -d' ' -f2)"

# Send webhook
curl -X POST "http://localhost:3000/api/vae/webhook/whatsapp" \
  -H "x-hub-signature-256: $SIGNATURE" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD"
```

## Troubleshooting

### Messages Not Arriving
1. Check WhatsApp Business API status
2. Verify phone number ID is correct in database
3. Check webhook endpoint is accessible from Meta servers
4. Verify signature verification is passing

### Missing Routing Matches
1. Check routing rules are active (`is_active = true`)
2. Verify pattern syntax (regex must be valid)
3. Check message content matches pattern
4. Review logs for routing evaluation details

### VAE Not Receiving Events
1. Check webhook endpoint URL is correct
2. Verify webhook secret is configured correctly
3. Check VAE endpoint is responding with 2xx status
4. Review webhook event logs in database

## Best Practices

1. **Monitor Processing**: Log all webhook events for debugging
2. **Implement Retry Logic**: Failed VAE forwards should be retried
3. **Rate Limit**: Implement backpressure for high-volume scenarios
4. **Secure Secrets**: Use environment variables, never hardcode
5. **Validate Input**: Always validate webhook payloads before processing
6. **Handle Timeouts**: Set timeouts on external API calls
7. **Archive Messages**: Implement data retention policies
8. **Monitor Queue**: Track pending message processing
