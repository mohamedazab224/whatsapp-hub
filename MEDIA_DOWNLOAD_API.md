# WhatsApp Media Download API v24.0 Implementation

## Overview

This document describes the complete media handling system integrated with WhatsApp Business API v24.0. The system implements the proper flow for downloading media from WhatsApp and storing it in Seafile.

## Architecture

```
WhatsApp Webhook
    ↓
Receive Media ID
    ↓
Get Media Info (URL)
    ↓
Check URL Expiry (5 min)
    ↓
Download with Retry Strategy
    ↓
Store in Seafile
    ↓
Update Database
```

## Environment Variables Required

```bash
# WhatsApp Configuration
WHATSAPP_ACCESS_TOKEN=your_token_here
WHATSAPP_APP_SECRET=your_secret_here
WHATSAPP_API_VERSION=v24.0

# Seafile Configuration
SEAFILE_SERVER=https://your-seafile-server.com
SEAFILE_TOKEN=your_token_here
SEAFILE_LIB_ID=library_id_here
```

## Flow Details

### 1. Media Webhook Reception

When a media message arrives from WhatsApp:

```json
{
  "type": "image",
  "image": {
    "id": "1234567890",
    "mime_type": "image/jpeg"
  }
}
```

### 2. Get Media Information

**Request:**
```bash
GET https://graph.instagram.com/v24.0/{Media-ID}
Authorization: Bearer {ACCESS_TOKEN}
User-Agent: WhatsApp-Hub/1.0
```

**Response:**
```json
{
  "url": "https://graph.instagram.com/v24.0/{Media-URL}",
  "mime_type": "image/jpeg"
}
```

**URL Validity:** 5 minutes from issue time

### 3. Download Media

**Request:**
```bash
GET https://graph.instagram.com/v24.0/{Media-URL}
Authorization: Bearer {ACCESS_TOKEN}
User-Agent: WhatsApp-Hub/1.0
```

**Retry Strategy:**
- Total attempts: 3
- Exponential backoff: 1s, 2s, 4s
- HTTP 401: URL expired, refresh needed
- HTTP 429: Rate limited, retry with backoff
- HTTP 5xx: Server error, retry

### 4. Store in Seafile

**Path Structure:**
```
whatsapp/{project_id}/{date}/
```

**Supported Media Types:**
- Images (JPG, PNG, GIF)
- Videos (MP4, WebM)
- Documents (PDF, DOC, DOCX, XLS, XLSX)
- Audio (M4A, MP3, OGG)

### 5. Database Storage

Media file metadata stored in `media_files` table:

```sql
{
  project_id: uuid,
  message_id: string,
  media_id: string,
  mime_type: string,
  file_size: integer,
  storage_path: string,
  downloaded_at: timestamp
}
```

## API Functions

### `getMediaInfo(mediaId: string): Promise<MediaInfo>`

Gets media information from WhatsApp including URL and expiry.

```typescript
const mediaInfo = await getMediaInfo("1234567890")
// Returns: { id, url, mime_type, expires_at }
```

### `downloadMedia(mediaUrl: string, fileName: string): Promise<DownloadResult>`

Downloads media with automatic retry on failure.

```typescript
const result = await downloadMedia(mediaUrl, "image.jpg")
// Returns: { success, size, path, error }
```

### `storeInSeafile(buffer, fileName, mimeType, projectId): Promise<DownloadResult>`

Stores media in Seafile storage system.

### `handleMediaDownload(mediaId, fileName, projectId): Promise<DownloadResult>`

Complete workflow: get info → download → store.

```typescript
const result = await handleMediaDownload(mediaId, fileName, projectId)
```

### `validateMediaMessage(message): boolean`

Checks if message is a valid media message.

### `extractMediaMetadata(message): MediaMetadata`

Extracts media ID and type from message.

## Error Handling

### URL Expiry (401 Unauthorized)

When URL expires before download completes:
1. System detects 401 response
2. Returns error: "Media URL expired"
3. Next webhook retry will get fresh URL
4. Automatic retry happens on next event

### Rate Limiting (429)

When Meta rate limits kicks in:
1. System implements exponential backoff
2. Max 3 attempts with delays
3. Logs attempt counts for monitoring

### Network Failures

Automatic retry with exponential backoff:
- Attempt 1: Immediate
- Attempt 2: After 1s
- Attempt 3: After 2s
- Attempt 4: After 4s

## Logging

All operations logged with `[v0]` prefix:

```typescript
[v0] Media info retrieved: { id, mime_type }
[v0] Downloading media (attempt 1/3): image.jpg
[v0] Media downloaded successfully: 1024000 bytes
[v0] Media stored in Seafile: whatsapp/{project_id}/2024-03-08/image.jpg
```

## Database Schema

```sql
CREATE TABLE media_files (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL,
  message_id VARCHAR NOT NULL,
  media_id VARCHAR NOT NULL,
  mime_type VARCHAR,
  file_size INTEGER,
  storage_path VARCHAR NOT NULL,
  downloaded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_media_project ON media_files(project_id);
CREATE INDEX idx_media_message ON media_files(message_id);
CREATE INDEX idx_media_type ON media_files(mime_type);
```

## Testing

### Test Media Download

```bash
curl -X GET "https://graph.instagram.com/v24.0/{MEDIA_ID}" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "User-Agent: WhatsApp-Hub/1.0"
```

### Check URL Validity

URLs are valid for exactly 5 minutes. Test by:
1. Get URL immediately
2. Download within 5 minutes ✅
3. Try downloading after 5 minutes ❌ (returns 401)

## Performance Considerations

- Media URL validity: 5 minutes
- Download timeout: 30 seconds per attempt
- Storage path: `/whatsapp/{project_id}/{date}/`
- Max file size: Limited by Seafile configuration
- Concurrent downloads: Max 3 per project (retry limit)

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| Media URL expired | URL older than 5 min | Wait for next webhook event |
| HTTP 401 | Invalid token | Check WHATSAPP_ACCESS_TOKEN |
| HTTP 403 | Insufficient permissions | Check app permissions in Meta dashboard |
| Seafile storage failed | Connection issue | Check SEAFILE_SERVER and SEAFILE_TOKEN |
| File size 0 | Incomplete download | Check network, retry manually |

## Integration Points

- **Webhook Handler**: `app/api/vae/webhook/whatsapp/route.ts`
- **Media Handler**: `lib/media/whatsapp-media-handler.ts`
- **Webhook Receiver**: `lib/middleware/whatsapp-webhook-receiver.ts`
- **Database**: `media_files` table

## Next Steps

1. Set environment variables in `.env.local`
2. Ensure Supabase `media_files` table exists
3. Configure Seafile storage (optional, uses temp storage if not configured)
4. Test with sample media message from WhatsApp
5. Monitor logs for any download issues
