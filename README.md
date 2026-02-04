# WhatsApp platform

## Overview

This repository contains the WhatsApp webhook platform for self-hosted deployments.

## Deployment (self-hosted)

1. Point your domain (for example, `webhook.alazab.com`) to your server and deploy this Next.js app.
2. Create a `.env` file from `.env.example` and set the required environment variables (do not commit secrets):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AUTH_PASSWORD_SALT`
   - `SESSION_SECRET`
   - `BASIC_AUTH_USERS` (comma-separated `email:password:role` entries)
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_API_VERSION` (optional, defaults to `v21.0`)
   - `WHATSAPP_APP_SECRET` (used to verify webhook signatures)
   - `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
   - `QUEUE_SECRET` (shared secret to run the queue processor endpoint)
   - `LOG_LEVEL` (optional, one of `debug`, `info`, `warn`, `error`)
   - `WEBHOOK_RATE_LIMIT_MAX`
   - `WEBHOOK_RATE_LIMIT_WINDOW_SEC`
   - `QUEUE_RATE_LIMIT_MAX`
   - `QUEUE_RATE_LIMIT_WINDOW_SEC`
   - `ERP_API_URL`
   - `ERP_API_KEY`
   - `CRM_API_URL`
   - `CRM_API_KEY`
   - `HELPDESK_API_URL`
   - `HELPDESK_API_KEY`
3. Configure your WhatsApp Business webhook in Meta:
   - Callback URL: `https://webhook.alazab.com/api/webhook`
   - Verify token: set to the same value as `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
   - Alternate callback URLs are also supported for providers that expect them:
     - `https://webhook.alazab.com/webhook`
     - `https://webhook.alazab.com/webhook/whatsapp`
4. Create a Supabase storage bucket named `media` to store incoming attachments (images, audio, documents).

## Authentication (Supabase Session Auth)

This deployment uses Supabase Auth sessions (cookie-backed) for login and route protection.
The middleware checks for an authenticated Supabase user and redirects unauthenticated users to `/login`.
Webhook callbacks to `/api/webhook` are allowed to bypass authentication.

Ensure Supabase Auth is configured for your deployment (providers, redirect URLs, and users).

## Webhook Security

- Incoming POST requests to `/api/webhook` must include a valid `X-Hub-Signature-256` header.
- The signature is verified using `WHATSAPP_APP_SECRET` (Meta App Secret).
- Rate limiting is enforced using `WEBHOOK_RATE_LIMIT_MAX` and `WEBHOOK_RATE_LIMIT_WINDOW_SEC`.

## Environment Variable Mapping (Meta/Legacy Names)

If your existing configuration uses the following names, map them to the required variables:

- `VERIFY_TOKEN` or `WEBHOOK_VERIFY_TOKEN` → `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `APP_SECRET` → `WHATSAPP_APP_SECRET`
- `META_TOKEN` or `ACCESS_TOKEN` → `WHATSAPP_ACCESS_TOKEN`

## Queue Processing (AI Responses)

AI responses are enqueued as jobs so webhook requests stay fast. To process queued jobs, call:

```
POST /api/queue/whatsapp
Headers: x-queue-secret: <QUEUE_SECRET>
```

You can schedule this endpoint via cron (every 1–2 minutes) to process pending jobs.
The queue endpoint enforces rate limiting using `QUEUE_RATE_LIMIT_MAX` and `QUEUE_RATE_LIMIT_WINDOW_SEC`.

## Database Tables (Suggested)

Below are minimal schemas to support idempotency, message status tracking, and queue processing:

```sql
create table if not exists message_statuses (
  id uuid primary key default gen_random_uuid(),
  whatsapp_message_id text not null,
  status text not null,
  timestamp bigint,
  recipient_id text,
  conversation_id text,
  pricing jsonb,
  metadata jsonb,
  created_at timestamptz default now()
);

create table if not exists message_jobs (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  status text not null default 'pending',
  payload jsonb not null,
  error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## Core Data Model (Kapso-Style)

The following entities are required to operate a multi-tenant WhatsApp integration hub:

- `projects`
- `whatsapp_business_accounts`
- `whatsapp_numbers`
- `contacts`
- `messages`
- `media_files`
- `webhook_events`
- `workflows`
- `workflow_steps`
- `integrations`

### Required Relationships

- Every message links to **one** `project`, **one** `whatsapp_number`, and **one** `workflow`.
- Each `whatsapp_number` maps to a `project` and optionally a `whatsapp_business_account`.

### Suggested Schema Additions

```sql
create table if not exists webhook_events (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  payload jsonb not null,
  raw_body text,
  signature text,
  event_hash text not null,
  created_at timestamptz default now()
);

create unique index if not exists webhook_events_hash_idx on webhook_events (event_hash);

create table if not exists media_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  whatsapp_number_id uuid not null,
  workflow_id uuid not null,
  contact_id uuid,
  message_id uuid,
  media_id text,
  mime_type text,
  file_size bigint,
  storage_path text,
  public_url text,
  metadata jsonb,
  created_at timestamptz default now()
);

alter table messages
  add column if not exists project_id uuid,
  add column if not exists workflow_id uuid;

create table if not exists workflows (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  name text not null,
  is_default boolean default false,
  is_active boolean default true,
  ai_enabled boolean default false,
  created_at timestamptz default now()
);

create table if not exists workflow_steps (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null,
  type text not null,
  is_active boolean default true,
  config jsonb,
  created_at timestamptz default now()
);

create table if not exists integrations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  type text not null,
  is_active boolean default true,
  config jsonb,
  created_at timestamptz default now()
);

create table if not exists webhook_endpoints (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  url text not null,
  events jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  password_hash text not null,
  role text not null default 'viewer',
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  wa_template_name text not null,
  wa_template_code text not null,
  phone_number_id uuid not null,
  status text not null,
  category text not null,
  language text not null,
  preview_text text,
  variables_count int default 0,
  created_at timestamptz default now()
);

create unique index if not exists templates_unique_idx on templates (wa_template_code, phone_number_id);
```

## How It Works

1. Configure the required environment variables.
2. Deploy the Next.js app to your server.
3. Register the WhatsApp Business webhook in Meta.
4. Store incoming attachments in the Supabase `media` bucket.

## Idempotency & Status Tracking

- Incoming messages are checked by `whatsapp_message_id` to avoid duplicate inserts.
- Delivery/read status callbacks are stored in `message_statuses` for auditing and analytics.
