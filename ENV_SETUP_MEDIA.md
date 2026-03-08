# Environment Setup Guide - WhatsApp Media Download API

## Required Environment Variables

### 1. WhatsApp Configuration

Add to your `.env.local` or Vercel Environment Variables:

```bash
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_APP_SECRET=your_app_secret_here
WHATSAPP_API_VERSION=v24.0
```

### 2. Seafile Configuration (Optional)

If you want to store media in Seafile:

```bash
# Seafile Server
SEAFILE_SERVER=https://your-seafile-server.com
SEAFILE_TOKEN=your_seafile_auth_token
SEAFILE_LIB_ID=your_library_id
```

### 3. Supabase Configuration

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step-by-Step Setup

### Step 1: Get WhatsApp Access Token

1. Go to [Meta Developers Dashboard](https://developers.facebook.com/)
2. Navigate to your app → Business Accounts → WhatsApp Business Account
3. Go to Configuration → Tokens
4. Generate a new system access token
5. Copy the token and add to `WHATSAPP_ACCESS_TOKEN`

### Step 2: Get App Secret

1. In Meta Developers Dashboard, go to Settings → Basic
2. Find "App Secret"
3. Copy and add to `WHATSAPP_APP_SECRET`

### Step 3: Verify API Version

Check what version Meta is currently supporting:

```bash
# Recommended: v24.0 (current stable)
WHATSAPP_API_VERSION=v24.0

# Alternative: Check latest at https://developers.facebook.com/docs/graph-api/changelog
```

### Step 4 (Optional): Setup Seafile

If using Seafile for media storage:

1. **Get Seafile Server URL**
   - Format: `https://your-domain.com` (no trailing slash)

2. **Generate Auth Token**
   ```bash
   # Login to Seafile
   # Go to Settings → Security
   # Generate new API token
   ```

3. **Create Media Library**
   ```bash
   # In Seafile, create a new library for WhatsApp media
   # Copy the Library ID
   ```

4. **Add to Environment**
   ```bash
   SEAFILE_SERVER=https://seafile.example.com
   SEAFILE_TOKEN=your_token_here
   SEAFILE_LIB_ID=library-id-here
   ```

### Step 5: Verify Setup

Test your configuration:

```bash
# Test WhatsApp connection
curl -X GET "https://graph.instagram.com/v24.0/me" \
  -H "Authorization: Bearer ${WHATSAPP_ACCESS_TOKEN}"

# Should return your app info
```

## Database Setup

Ensure your Supabase database has the `media_files` table:

```sql
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  message_id VARCHAR NOT NULL,
  media_id VARCHAR NOT NULL,
  mime_type VARCHAR,
  file_size INTEGER,
  storage_path VARCHAR NOT NULL,
  downloaded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_media_project ON media_files(project_id);
CREATE INDEX idx_media_message ON media_files(message_id);
CREATE INDEX idx_media_type ON media_files(mime_type);
```

## Configuration in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable:

```
WHATSAPP_ACCESS_TOKEN
WHATSAPP_APP_SECRET
WHATSAPP_API_VERSION
SEAFILE_SERVER (if using Seafile)
SEAFILE_TOKEN (if using Seafile)
SEAFILE_LIB_ID (if using Seafile)
```

5. Make sure to select the correct Environment (Production/Preview/Development)
6. Redeploy after adding variables

## Validation Checklist

- [ ] `WHATSAPP_ACCESS_TOKEN` is set and valid
- [ ] `WHATSAPP_APP_SECRET` is set correctly
- [ ] `WHATSAPP_API_VERSION` is `v24.0`
- [ ] Database `media_files` table exists
- [ ] (Optional) Seafile server is accessible
- [ ] (Optional) Seafile token is valid
- [ ] (Optional) Seafile library ID is correct

## Testing the Setup

Once configured, test with a sample media message:

1. Send an image to your WhatsApp number
2. Check logs for: `[v0] Media downloaded successfully`
3. Check database `media_files` table for new entry
4. (Optional) Check Seafile for stored media file

## Troubleshooting

### Error: WHATSAPP_ACCESS_TOKEN not configured

**Solution:** Add the token to your environment variables and restart the server.

### Error: Media URL expired (401)

**Expected behavior** - URLs only valid for 5 minutes. Next webhook will get fresh URL.

### Error: Seafile storage failed

**Check:**
- SEAFILE_SERVER URL is correct
- SEAFILE_TOKEN is valid
- SEAFILE_LIB_ID exists
- Network connectivity to Seafile server

**Fallback:** Remove Seafile variables. System will skip storage (safe mode).

### Media downloads slow

**Optimize:**
- Check network connectivity
- Reduce concurrent downloads (max 3)
- Increase retry timeouts if needed
- Monitor Seafile server performance

## Security Notes

- Never commit `.env.local` to git
- Use Vercel Environment Variables for production
- Rotate tokens regularly
- Use service role key only on server side
- Verify webhook signatures always

## Performance Targets

- Media download: < 5 seconds for 1MB file
- Database insert: < 100ms
- Seafile upload: < 10 seconds for 1MB file
- Total flow: < 20 seconds end-to-end

## Support

For issues:
1. Check logs: `[v0]` prefix
2. Verify all environment variables
3. Test API endpoints directly
4. Check Meta Developer Dashboard for API status
