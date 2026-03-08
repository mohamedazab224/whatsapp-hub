# Meta WhatsApp Integration - Environment Variables

You need to add the following environment variables to your project settings:

## Required Environment Variables

### Supabase (Already Configured)
- `NEXT_PUBLIC_SUPABASE_URL` ✓
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓
- `SUPABASE_SERVICE_ROLE_KEY` ✓

### Meta/WhatsApp Business API

Add these to your project settings (Settings > Vars):

```bash
# Meta App Configuration
META_APP_ID=889346333913449
META_BUSINESS_ID=314437023701205
META_ACCESS_TOKEN=your_access_token_here
META_APP_SECRET=your_app_secret_here

# Webhook Configuration
VERIFY_TOKEN=your_verify_token_here

# API Configuration
META_API_VERSION=v24.0
```

### WhatsApp Connected Numbers

The following numbers are pre-configured in the Meta data:

1. **Egypt (Hand Mohamed Azab)**
   - Phone: +20 10 26682797
   - Phone ID: 964277060104222
   - Status: CONNECTED
   - Quality: UNKNOWN

2. **USA (Mohamed Azab #1)**
   - Phone: +1 205-460-5650
   - Phone ID: 1020054711186921
   - Status: CONNECTED
   - Quality: GREEN

3. **USA (Mohamed Azab #2)**
   - Phone: +1 206-479-5608
   - Phone ID: 1032441389943808
   - Status: CONNECTED
   - Quality: GREEN

4. **USA (Mohamed Azab #3)**
   - Phone: +1 208-379-9564
   - Phone ID: 952530191273396
   - Status: CONNECTED
   - Quality: UNKNOWN

## How to Get These Values

### Meta App ID & Business ID
- Go to [Meta Business Platform](https://business.facebook.com)
- Navigate to Apps > Your App
- Find App ID in Settings > Basic
- Find Business ID in Settings > Business

### Access Token
1. Go to [Meta Developers](https://developers.facebook.com)
2. Create a System User in Business Settings
3. Assign WhatsApp permissions
4. Generate access token

### App Secret
- Found in App Settings > Basic section
- Keep this **PRIVATE**

### Verify Token
- Create your own random token for webhook verification
- Use this when setting up webhooks in Meta

## Setup Steps

1. **Add Environment Variables**
   - Go to project Settings > Vars
   - Add all Meta variables from above

2. **Configure Webhook URL**
   - In Meta Business Platform
   - Go to WhatsApp Business Account > Webhooks
   - Set webhook URL: `https://yourdomain.com/api/vae/webhook/whatsapp`
   - Set verify token: Use the `VERIFY_TOKEN` value

3. **Connect Flow Endpoint**
   - Flow endpoint: `https://yourdomain.com/api/vae/flows/endpoint`
   - This handles encrypted Flow requests from Meta

4. **Upload Public Key** (if using Flows)
   - POST to `/api/vae/flows/endpoint`
   - Include your public key for encryption

## Testing

### Check if numbers are seeded:
```bash
curl https://yourdomain.com/api/numbers \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

### Test webhook:
```bash
curl -X GET "https://yourdomain.com/api/vae/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=test"
```

### Test Flow endpoint:
```bash
curl -X GET "https://yourdomain.com/api/vae/flows/endpoint?hub.mode=subscribe&hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=test"
```

## Troubleshooting

### "No project found"
- Make sure you've logged in once (triggers project creation)
- Check if environment variables are set
- Try logging out and back in

### WhatsApp numbers not appearing
- Go to `/numbers` page to add numbers
- Or wait for automatic seeding after first login
- Check Supabase for `whatsapp_numbers` table

### Webhook not working
- Verify webhook URL is correct
- Check verify token matches
- Look at server logs in `/api/vae/webhook/whatsapp`

### Flow endpoint errors
- Ensure `META_APP_SECRET` is set correctly
- Check if encryption keys are configured
- Verify flow ID in message template

## Security Notes

- Never commit `.env.local` or `.env` files
- Rotate access tokens regularly
- Keep `META_APP_SECRET` private
- Use HTTPS for all webhook endpoints
- Verify webhook signatures in production
