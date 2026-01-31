-- ============================================================================
-- ALAZAB HUB - WhatsApp Business Platform - Complete Database Schema
-- ============================================================================

-- 1. PROJECTS TABLE - Multi-project support
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    owner_email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. WHATSAPP NUMBERS TABLE - Business account numbers
CREATE TABLE IF NOT EXISTS whatsapp_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    phone_number_id TEXT UNIQUE NOT NULL,
    display_phone_number TEXT NOT NULL,
    verified_name TEXT,
    quality_rating TEXT DEFAULT 'GREEN' CHECK (quality_rating IN ('GREEN', 'YELLOW', 'RED')),
    status TEXT DEFAULT 'APPROVED' CHECK (status IN ('APPROVED', 'PENDING', 'DISABLED')),
    meta_business_account_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. MESSAGE TEMPLATES TABLE - WhatsApp message templates
CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    meta_template_id TEXT,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('MARKETING', 'OTP', 'TRANSACTIONAL', 'UTILITY')),
    language TEXT DEFAULT 'ar' NOT NULL,
    status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED')),
    content JSONB NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    whatsapp_number_id UUID REFERENCES whatsapp_numbers(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.1 TEMPLATES TABLE - Synced WhatsApp API templates for UI management
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wa_template_name TEXT NOT NULL,
    wa_template_code TEXT NOT NULL,
    phone_number_id UUID REFERENCES whatsapp_numbers(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    category TEXT NOT NULL,
    language TEXT NOT NULL,
    preview_text TEXT,
    variables_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS templates_unique_idx ON templates (wa_template_code, phone_number_id);

-- 4. CONTACTS TABLE - Customer contacts
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    wa_id TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    email TEXT,
    profile_picture_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'archived')),
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_direction TEXT CHECK (last_message_direction IN ('inbound', 'outbound')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id, wa_id)
);

-- 5. MESSAGES TABLE - Full message history
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    whatsapp_message_id TEXT UNIQUE NOT NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
    whatsapp_number_id UUID REFERENCES whatsapp_numbers(id) ON DELETE CASCADE NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'video', 'audio', 'document', 'template', 'location')),
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    body TEXT,
    media_url TEXT,
    media_type TEXT,
    ai_generated BOOLEAN DEFAULT false,
    ai_response_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. MEDIA STORAGE TABLE - File management
CREATE TABLE IF NOT EXISTS media_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    filename TEXT NOT NULL,
    original_filename TEXT,
    media_type TEXT NOT NULL,
    file_size INTEGER,
    storage_path TEXT NOT NULL,
    mime_type TEXT,
    meta_media_id TEXT,
    uploaded_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. AI CONFIGURATIONS TABLE - Project-specific AI settings
CREATE TABLE IF NOT EXISTS ai_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL UNIQUE,
    is_enabled BOOLEAN DEFAULT true,
    provider TEXT DEFAULT 'openai' CHECK (provider IN ('openai', 'claude', 'gemini', 'grok', 'deepseek')),
    model TEXT DEFAULT 'gpt-4o',
    system_prompt TEXT DEFAULT 'أنت مساعد ذكي متعدد الاستخدامات. رد بلباقة واحترافية باللغة العربية.',
    temperature FLOAT DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
    max_tokens INTEGER DEFAULT 1024,
    response_time_limit INTEGER DEFAULT 5000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. API KEYS TABLE - API access management
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    scopes JSONB DEFAULT '[]'::jsonb,
    rate_limit INTEGER DEFAULT 1000,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 9. WEBHOOKS TABLE - Webhook configuration
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    events JSONB NOT NULL DEFAULT '["message.received", "message.sent", "template.approved"]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    secret TEXT NOT NULL,
    retry_count INTEGER DEFAULT 3,
    timeout_ms INTEGER DEFAULT 5000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. WEBHOOK LOGS TABLE - Event tracking
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL,
    request_payload JSONB,
    response_status INTEGER,
    response_body TEXT,
    success BOOLEAN,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. BROADCASTS TABLE - Bulk messaging
CREATE TABLE IF NOT EXISTS broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES message_templates(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    target_contacts JSONB NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'running', 'completed', 'failed')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. ACTIVITY LOGS TABLE - Audit trail
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    actor_email TEXT,
    status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failure')),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_whatsapp_numbers_project ON whatsapp_numbers(project_id);
CREATE INDEX idx_whatsapp_numbers_phone ON whatsapp_numbers(display_phone_number);
CREATE INDEX idx_message_templates_project ON message_templates(project_id);
CREATE INDEX idx_message_templates_status ON message_templates(status);
CREATE INDEX idx_contacts_project ON contacts(project_id);
CREATE INDEX idx_contacts_wa_id ON contacts(wa_id);
CREATE INDEX idx_messages_project ON messages(project_id);
CREATE INDEX idx_messages_contact ON messages(contact_id);
CREATE INDEX idx_messages_direction ON messages(direction);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_media_storage_project ON media_storage(project_id);
CREATE INDEX idx_api_keys_project ON api_keys(project_id);
CREATE INDEX idx_webhooks_project ON webhooks(project_id);
CREATE INDEX idx_webhook_logs_webhook ON webhook_logs(webhook_id);
CREATE INDEX idx_broadcasts_project ON broadcasts(project_id);
CREATE INDEX idx_activity_logs_project ON activity_logs(project_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (should be refined with auth context in production)
CREATE POLICY "Public access on projects" ON projects FOR ALL USING (true);
CREATE POLICY "Public access on whatsapp_numbers" ON whatsapp_numbers FOR ALL USING (true);
CREATE POLICY "Public access on message_templates" ON message_templates FOR ALL USING (true);
CREATE POLICY "Public access on templates" ON templates FOR ALL USING (true);
CREATE POLICY "Public access on contacts" ON contacts FOR ALL USING (true);
CREATE POLICY "Public access on messages" ON messages FOR ALL USING (true);
CREATE POLICY "Public access on media_storage" ON media_storage FOR ALL USING (true);
CREATE POLICY "Public access on ai_configurations" ON ai_configurations FOR ALL USING (true);
CREATE POLICY "Public access on api_keys" ON api_keys FOR ALL USING (true);
CREATE POLICY "Public access on webhooks" ON webhooks FOR ALL USING (true);
CREATE POLICY "Public access on webhook_logs" ON webhook_logs FOR ALL USING (true);
CREATE POLICY "Public access on broadcasts" ON broadcasts FOR ALL USING (true);
CREATE POLICY "Public access on activity_logs" ON activity_logs FOR ALL USING (true);

-- ============================================================================
-- SEED INITIAL DATA
-- ============================================================================
INSERT INTO projects (name, slug, owner_email) 
VALUES ('نظام العزب', 'alazab-system', 'admin@alazab.com')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO ai_configurations (project_id, is_enabled, provider, model, system_prompt)
SELECT id, true, 'openai', 'gpt-4o', 'أنت مساعد ذكي لشركة العزب. رد بلباقة واحترافية على استفسارات العملاء باللغة العربية.'
FROM projects WHERE slug = 'alazab-system'
ON CONFLICT (project_id) DO NOTHING;
