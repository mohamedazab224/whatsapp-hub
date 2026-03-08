# WhatsApp Middleware Setup Guide

## Quick Start

### 1. Environment Configuration

Add these variables to your `.env.local` or Vercel environment:

```bash
# WhatsApp Business API
WHATSAPP_APP_SECRET=your_app_secret_from_meta
WHATSAPP_WEBHOOK_VERIFY_TOKEN=choose_a_secure_token
WHATSAPP_ACCESS_TOKEN=your_access_token_from_meta
WHATSAPP_API_VERSION=v24.0

# Alternative (if using VERIFY_TOKEN instead)
VERIFY_TOKEN=choose_a_secure_token

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### 2. Webhook Registration with Meta

1. Go to [Meta App Dashboard](https://developers.facebook.com/)
2. Select your WhatsApp Business Account app
3. Go to **Configuration** → **Webhooks**
4. Set Callback URL: `https://your-domain.com/api/vae/webhook/whatsapp`
5. Set Verify Token: Use the token from `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
6. Click **Verify and Save**

### 3. Create Project & WhatsApp Numbers

```typescript
// Create a project (auto-created on first login)
// Then add WhatsApp numbers via the dashboard

// Or via API:
const { data: whatsappNumber } = await supabase
  .from("whatsapp_numbers")
  .insert({
    project_id: "your-project-id",
    phone_number_id: "123456789",
    display_phone_number: "+1234567890",
    verified_name: "Your Business",
    is_active: true,
  })
```

### 4. Configure Webhook Endpoint (for VAE)

```typescript
// Set up webhook endpoint where VAE will receive events
const { data: webhook } = await supabase
  .from("webhook_endpoints")
  .insert({
    project_id: "your-project-id",
    url: "https://your-vae-system.com/webhooks/whatsapp",
    secret: "your-webhook-secret", // For signing payloads
    is_active: true,
  })
```

### 5. Create Routing Rules

```typescript
// Add routing rules to determine how messages are processed
const { data: rule } = await supabase
  .from("workflows")
  .insert({
    project_id: "your-project-id",
    name: "status|report|update", // Keywords to match
    trigger_type: "keyword_trigger",
    is_active: true,
    description: "Route status inquiries to handler",
  })
```

## Architecture Deep Dive

### Message Processing Pipeline

```
1. RECEIVE: WhatsApp sends webhook event
   ├─ Signature Verification: Verify HMAC-SHA256
   ├─ Payload Parsing: Extract messages/statuses
   └─ Database Lookup: Find project by phone_number_id

2. STORE: Process each event
   ├─ Create/Update Contact: Store sender info
   ├─ Store Message: Save to messages table
   ├─ Handle Media: Download and store files
   └─ Update Conversation: Mark as active

3. ROUTE: Determine destination flow
   ├─ Load Active Rules: Query workflows by project
   ├─ Evaluate Patterns: Test message content
   ├─ Match Rule: Find first matching rule
   └─ Return Flow: Target flow and parameters

4. FORWARD: Send to VAE for processing
   ├─ Get Webhook Config: Load webhook endpoint
   ├─ Create Payload: Format event data
   ├─ Sign Request: Create HMAC signature
   ├─ Send: POST to VAE webhook URL
   └─ Log: Store in webhook_events table
```

### Message Status Flow

```
User sends message
  ↓
WhatsApp processes (1-3 seconds)
  ↓
Status: sent (saved to our database)
  ↓
Message reaches WhatsApp servers
  ↓
Status: delivered (webhook sent, we update DB)
  ↓
User reads message
  ↓
Status: read (webhook sent, we update DB)
```

## Common Integration Patterns

### Pattern 1: Order Status Inquiries

```typescript
// Create keyword routing
await supabase.from("workflows").insert({
  project_id,
  name: "order|status|tracking",
  trigger_type: "keyword_trigger",
  is_active: true,
})

// Messages with these keywords route to order_handler flow
// VAE receives: { flow: "order_handler", body: "Where is my order?" }
```

### Pattern 2: Specific Contact Routing

```typescript
// Route all messages from supervisor to admin flow
await supabase.from("workflows").insert({
  project_id,
  name: "+201234567890",
  trigger_type: "contact_based",
  is_active: true,
})
```

### Pattern 3: Complex Pattern Matching

```typescript
// Route order numbers (e.g., "ORD-123456")
await supabase.from("workflows").insert({
  project_id,
  name: "^(ORD|PO)-\\d{6}$",
  trigger_type: "intent_based", // Uses regex
  is_active: true,
})
```

### Pattern 4: Media Handling

```typescript
// Messages with images automatically route to photo_analysis flow
// Media files are stored and URL provided to VAE
// VAE receives: { 
//   flow: "photo_analysis", 
//   body: "[Image]",
//   media: [{ url: "...", type: "image/jpeg", size: 12345 }]
// }
```

## Database Integration Points

### Reading Project Info

```typescript
// Get project and its settings
const project = await supabase
  .from("projects")
  .select("*")
  .eq("id", projectId)
  .single()

// Get all WhatsApp numbers for project
const numbers = await supabase
  .from("whatsapp_numbers")
  .select("*")
  .eq("project_id", projectId)

// Get all contacts for project
const contacts = await supabase
  .from("contacts")
  .select("*")
  .eq("project_id", projectId)
```

### Querying Messages

```typescript
// Get all messages for a contact
const messages = await supabase
  .from("messages")
  .select("*")
  .eq("contact_id", contactId)
  .order("timestamp", { ascending: false })

// Get unread messages
const unread = await supabase
  .from("messages")
  .select("*")
  .eq("project_id", projectId)
  .neq("status", "read")

// Get messages by type
const images = await supabase
  .from("messages")
  .select("*")
  .eq("project_id", projectId)
  .eq("type", "image")
```

### Media Files

```typescript
// Get media for a message
const media = await supabase
  .from("media_files")
  .select("*")
  .eq("message_id", messageId)

// Get all images for project
const images = await supabase
  .from("media_files")
  .select("*")
  .eq("project_id", projectId)
  .eq("mime_type", "image/jpeg")
```

## Performance Optimization

### 1. Connection Pooling

The admin client is cached:
```typescript
export const createSupabaseAdminClient = () => {
  if (cachedAdminClient) return cachedAdminClient
  // ... create once and reuse
}
```

### 2. Batch Processing

For high volume:
```typescript
// Process messages in batches
const batchSize = 100
for (let i = 0; i < messages.length; i += batchSize) {
  const batch = messages.slice(i, i + batchSize)
  await Promise.all(batch.map(m => processMessage(m)))
}
```

### 3. Caching Rules

```typescript
// Cache routing rules to avoid DB queries per message
const rulesCache = new Map()
const getRules = async (projectId) => {
  if (!rulesCache.has(projectId)) {
    const rules = await supabase.from("workflows").select("*")
    rulesCache.set(projectId, rules)
  }
  return rulesCache.get(projectId)
}
```

### 4. Query Optimization

Always use `select()` to limit fields:
```typescript
// Good: Only get needed fields
.select("id, name, wa_id")

// Avoid: Gets all columns
.select("*")
```

## Monitoring & Debugging

### Enable Detailed Logging

```typescript
// In webhook handler
console.log("[v0] Webhook received:", {
  timestamp: new Date().toISOString(),
  phoneNumberId,
  messageCount: value.messages?.length || 0,
  statusCount: value.statuses?.length || 0,
})

// In routing
console.log("[v0] Message routed to:", {
  contactId,
  targetFlow,
  pattern: matchedRule?.name,
})
```

### Webhook Events Table

```typescript
// Query webhook delivery logs
const events = await supabase
  .from("webhook_events")
  .select("*")
  .eq("endpoint_id", endpointId)
  .order("created_at", { ascending: false })

// Check failed deliveries
const failed = await supabase
  .from("webhook_events")
  .select("*")
  .eq("endpoint_id", endpointId)
  .neq("response_status", 200)
```

## Troubleshooting

### Webhook Not Triggering

1. **Check endpoint is public**: Ensure `/api/vae/webhook/whatsapp` is accessible
2. **Verify token**: Match `WHATSAPP_WEBHOOK_VERIFY_TOKEN` exactly
3. **Check logs**: Look for signature verification errors
4. **Test webhook**: Use Meta's test tool or curl to verify

### Messages Not Processing

1. **Check phone number**: Verify `phone_number_id` exists in `whatsapp_numbers`
2. **Check RLS policies**: Ensure admin client bypasses RLS
3. **Check database**: Verify project exists and is active
4. **Check logs**: Look for processing errors

### Routing Not Working

1. **Check rules exist**: Verify workflows are created
2. **Check is_active**: Ensure rules have `is_active = true`
3. **Check pattern**: Verify regex/keyword patterns match test message
4. **Check priority**: Earlier rules are evaluated first

## API Reference

### POST /api/vae/webhook/whatsapp

Receives WhatsApp events.

**Headers:**
```
x-hub-signature-256: sha256=<hmac>
Content-Type: application/json
```

**Status Codes:**
- `200` - Success
- `400` - Invalid payload
- `403` - Signature verification failed
- `500` - Processing error

### GET /api/vae/webhook/whatsapp

Webhook verification (called by Meta during setup).

**Query Parameters:**
- `hub.mode=subscribe`
- `hub.verify_token=<token>`
- `hub.challenge=<challenge>`

**Response:**
- `200` - Returns challenge value
- `403` - Token verification failed

## Next Steps

1. ✅ Configure environment variables
2. ✅ Register webhook with Meta
3. ✅ Create test project
4. ✅ Set up WhatsApp numbers
5. ✅ Configure webhook endpoint
6. ✅ Create routing rules
7. ✅ Test message flow
8. ✅ Monitor webhook events
9. ✅ Set up VAE integration
10. ✅ Deploy to production
