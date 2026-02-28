# Environment Variables Required for WhatsApp Hub

## How to Set Variables

1. Go to v0 Sidebar → **Vars** section
2. Add each variable below with its value
3. Variables starting with `NEXT_PUBLIC_` are public and will be visible in the browser

## Required Variables

### Supabase Configuration
- **NEXT_PUBLIC_SUPABASE_URL** - Your Supabase project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Your Supabase anon key
- **SUPABASE_SERVICE_ROLE_KEY** - Your Supabase service role key (keep secret)

### WhatsApp API Configuration
- **WHATSAPP_ACCESS_TOKEN** - Meta/Facebook API access token
- **WHATSAPP_APP_SECRET** - Meta/Facebook app secret (keep secret)
- **WHATSAPP_PHONE_NUMBER_ID** - Your WhatsApp phone number ID
- **WHATSAPP_BUSINESS_ACCOUNT_ID** - Your WhatsApp business account ID
- **WHATSAPP_API_VERSION** - API version (default: `v24.0`)

### Webhook Configuration
- **WHATSAPP_WEBHOOK_VERIFY_TOKEN** - Custom token for webhook verification (any string you want)
- **VERIFY_TOKEN** - Same as WHATSAPP_WEBHOOK_VERIFY_TOKEN

### Logging & Rate Limiting
- **LOG_LEVEL** - Logging level: `debug`, `info`, `warn`, `error` (default: `info`)
- **WEBHOOK_RATE_LIMIT_MAX** - Max webhook requests (default: `120`)
- **WEBHOOK_RATE_LIMIT_WINDOW_SEC** - Rate limit window in seconds (default: `60`)
- **QUEUE_SECRET** - Secret for message queue (any string)
- **QUEUE_RATE_LIMIT_MAX** - Max queue requests (default: `30`)
- **QUEUE_RATE_LIMIT_WINDOW_SEC** - Queue rate limit window (default: `60`)

### App Configuration
- **NEXT_PUBLIC_API_URL** - Base URL for API calls (e.g., `http://localhost:3000` for dev, `https://yourdomain.com` for prod)

## Demo Account

For testing, use these credentials:
- Email: `demo@alazab.com`
- Password: `Demo@12345678`

The demo account will be created automatically on first login attempt if it doesn't exist.

## Security Notes

1. **NEVER** commit `.env.local` to git
2. Keep all secret variables (those NOT starting with `NEXT_PUBLIC_`) private
3. Use Vercel's Vars section for production variables
4. Rotate WHATSAPP_ACCESS_TOKEN regularly
