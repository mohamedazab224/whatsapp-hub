# Production Setup Guide - WhatsApp Hub

## Your Production Data

**Business Account (Parent):** 314437023701205  
**WABA (WhatsApp Business Account):** 459851797218855  
**Phone Numbers:**
- alazabfix: 15557285727 (ID: 644995285354639)
- alazab: 15557245001 (ID: 527697617099639)

**Status:** ✅ All verified and ready for production

---

## Step 1: Add Environment Variables to Vercel

Open your Vercel Project → Settings → Environment Variables and add:

```
NEXT_PUBLIC_SUPABASE_URL=<from Supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase>
WHATSAPP_ACCESS_TOKEN=<your Meta token>
WHATSAPP_APP_SECRET=<your Meta app secret>
WHATSAPP_BUSINESS_ACCOUNT_ID=314437023701205
WHATSAPP_PHONE_NUMBER_ID=527697617099639
WHATSAPP_API_VERSION=v24.0
WHATSAPP_WEBHOOK_VERIFY_TOKEN=<generate random token>
VERIFY_TOKEN=<same as above>
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

---

## Step 2: Configure Webhook in Meta

1. Go to: https://developers.facebook.com/apps/889346333913449/settings/
2. Navigate to: WhatsApp Business Configuration
3. Set Webhook URL to: `https://yourdomain.com/api/vae/webhook/whatsapp`
4. Set Verify Token to: `<your WHATSAPP_WEBHOOK_VERIFY_TOKEN>`
5. Subscribe to: `messages`, `message_status`, `message_template_status_update`

---

## Step 3: Test Webhook

```bash
curl -X POST https://yourdomain.com/api/vae/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{"changes": [{"value": {"messages": []}}]}]
  }'
```

---

## Step 4: Send Test Message

```bash
curl -X POST "https://graph.facebook.com/v24.0/527697617099639/messages" \
  -H "Authorization: Bearer $WHATSAPP_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "+201092750351",
    "type": "text",
    "text": {"body": "Hello from production!"}
  }'
```

---

## Security Checklist

- ✅ No `.env.local` files in codebase
- ✅ All secrets in Vercel Vars only
- ✅ Webhook signature verification enabled
- ✅ Rate limiting configured
- ✅ HTTPS only for webhook
- ✅ Access token rotated regularly

---

## Troubleshooting

**Webhook not receiving messages:**
- Check webhook URL is public and accessible
- Verify webhook signature verification
- Check Meta app logs for errors

**Authorization errors:**
- Verify access token is valid: `https://graph.facebook.com/debug_token?input_token=<token>&access_token=<token>`
- Check token scopes include `whatsapp_business_messaging`
- Ensure Business Account has access to WABA

**Message sending fails:**
- Verify phone number is verified
- Check message format is correct
- Verify recipient phone is valid E.164 format
