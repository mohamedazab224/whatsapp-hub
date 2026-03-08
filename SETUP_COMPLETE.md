# WhatsApp Hub - Complete Setup Guide

## Environment Variables Setup

Your WhatsApp Hub application requires several environment variables to function properly. Follow these steps to configure them:

### 1. Supabase Configuration (Required)
These variables are automatically set when Supabase is connected:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

**Status**: ✅ Already configured

### 2. WhatsApp/Meta Configuration (Required)
Add these variables to your Vercel project at **Settings > Environment Variables**:

```env
# Meta Business Account Credentials
WHATSAPP_ACCESS_TOKEN=your_meta_access_token_here
WHATSAPP_APP_SECRET=your_meta_app_secret_here
WHATSAPP_BUSINESS_ACCOUNT_ID=314437023701205
WHATSAPP_PHONE_NUMBER_ID=1020054711186921

# Webhook Configuration  
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_custom_webhook_verify_token_here
VERIFY_TOKEN=your_custom_webhook_verify_token_here

# API Configuration
WHATSAPP_API_VERSION=v24.0
```

**How to get these values:**
1. Go to https://developers.facebook.com/
2. Navigate to your WhatsApp Business Account
3. Copy the Access Token, App Secret, and account IDs
4. Choose any secure string for webhook verification tokens

### 3. Optional Configuration

```env
# Logging
LOG_LEVEL=info  # Options: debug, info, warn, error

# Rate Limiting
WEBHOOK_RATE_LIMIT_MAX=120
WEBHOOK_RATE_LIMIT_WINDOW_SEC=60

# Application URL
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

## Setup Steps

### Step 1: Add Environment Variables
1. Go to your Vercel project settings
2. Click on "Environment Variables"
3. Add all the WhatsApp/Meta variables listed above
4. Redeploy the application

### Step 2: Initialize Your Project
1. After deploying with environment variables, visit: `/init`
2. This page will automatically:
   - Create your user project
   - Import all WhatsApp numbers
   - Configure database tables
3. You'll be redirected to `/inbox` when complete

### Step 3: Start Using WhatsApp Hub
- Visit `/inbox` to view your contacts and messages
- Visit `/numbers/connected` to manage WhatsApp numbers
- Visit `/templates` to manage message templates

## Troubleshooting

### "No project found" Error
**Solution**: Visit `/init` page to initialize your project with WhatsApp data

### "API error: 500"
**Solution**: Check that all required environment variables are set correctly

### Messages not loading
**Solution**: 
1. Ensure your WhatsApp numbers are properly imported
2. Check that your WHATSAPP_ACCESS_TOKEN is valid
3. Visit `/init` again to re-import numbers

### Webhook not receiving messages
**Solution**:
1. Ensure WHATSAPP_WEBHOOK_VERIFY_TOKEN matches your Meta webhook configuration
2. Configure your webhook URL in Meta: `https://yourdomain.com/api/vae/webhook/whatsapp`
3. Ensure app is deployed and accessible publicly

## Database Tables

The following tables are automatically used:
- `projects` - Your WhatsApp Hub projects
- `whatsapp_numbers` - Connected WhatsApp phone numbers
- `messages` - Message history
- `contacts` - WhatsApp contacts
- `templates` - Message templates
- `conversations` - Conversation tracking

## File Structure

```
app/
  init/page.tsx               # Project initialization page
  inbox/page.tsx              # Inbox/messaging interface
  api/
    init/setup/route.ts       # Project setup API endpoint
    messages/route.ts         # Message operations
    numbers/route.ts          # WhatsApp numbers operations

lib/
  env.server.ts              # Server environment validation
  env.public.ts              # Public environment validation
  errors.ts                  # Error handling utilities
```

## Next Steps

1. ✅ Deploy the application with environment variables
2. ✅ Visit `/init` to initialize your project
3. ✅ Start managing WhatsApp messages in `/inbox`
4. 🔄 Configure webhooks for real-time message delivery
5. 🔄 Set up message templates
6. 🔄 Create automation workflows

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review your environment variables
3. Check application logs
4. Visit `/status` page for system health information
