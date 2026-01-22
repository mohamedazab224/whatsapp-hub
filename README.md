# WhatsApp platform

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/alazab-projects/v0-whats-app-platform)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/fe2Jueuav0m)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/alazab-projects/v0-whats-app-platform](https://vercel.com/alazab-projects/v0-whats-app-platform)**

### Self-hosting checklist

1. Point your domain (for example, `webhook.alazab.com`) to your server and deploy this Next.js app.
2. Set the required environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_API_VERSION` (optional, defaults to `v21.0`)
   - `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
3. Configure your WhatsApp Business webhook in Meta:
   - Callback URL: `https://webhook.alazab.com/api/webhook`
   - Verify token: set to the same value as `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
   - Alternate callback URLs are also supported for providers that expect them:
     - `https://webhook.alazab.com/webhook`
     - `https://webhook.alazab.com/webhook/whatsapp`
4. Create a Supabase storage bucket named `media` to store incoming attachments (images, audio, documents).

## Build your app

Continue building your app on:

**[https://v0.app/chat/fe2Jueuav0m](https://v0.app/chat/fe2Jueuav0m)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
