-- ============================================================
-- SUPABASE SECURITY FIX - نسخ ولصق مباشر
-- ============================================================
-- قم بنسخ هذا الكود بالكامل ولصقه في محرر SQL على Supabase
-- ثم اضغط Run لتنفيذه دفعة واحدة
-- ============================================================

BEGIN;

-- ============================================================
-- الخطوة 1: إصلاح دالة is_project_member
-- ============================================================
DROP FUNCTION IF EXISTS is_project_member(uuid);

CREATE OR REPLACE FUNCTION is_project_member(p_project_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM project_members 
        WHERE project_id = p_project_id 
        AND user_id = auth.uid()
    );
END;
$$;

-- ============================================================
-- الخطوة 2: إلغاء جميع صلاحيات anon role
-- ============================================================
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE USAGE ON SCHEMA public FROM anon;
GRANT USAGE ON SCHEMA public TO anon;

-- ============================================================
-- الخطوة 3: حذف جميع السياسات القديمة
-- ============================================================

-- Projects
DROP POLICY IF EXISTS "projects_select_own" ON projects;
DROP POLICY IF EXISTS "projects_insert_authenticated" ON projects;
DROP POLICY IF EXISTS "projects_update_own" ON projects;
DROP POLICY IF EXISTS "projects_delete_own" ON projects;

-- Users
DROP POLICY IF EXISTS "users_select_authenticated" ON users;
DROP POLICY IF EXISTS "users_insert_authenticated" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

-- WhatsApp Numbers
DROP POLICY IF EXISTS "whatsapp_numbers_select_own_project" ON whatsapp_numbers;
DROP POLICY IF EXISTS "whatsapp_numbers_insert_own_project" ON whatsapp_numbers;
DROP POLICY IF EXISTS "whatsapp_numbers_update_own_project" ON whatsapp_numbers;
DROP POLICY IF EXISTS "whatsapp_numbers_service_role_all" ON whatsapp_numbers;

-- Contacts
DROP POLICY IF EXISTS "contacts_select_own_project" ON contacts;
DROP POLICY IF EXISTS "contacts_insert_own_project" ON contacts;
DROP POLICY IF EXISTS "contacts_update_own_project" ON contacts;
DROP POLICY IF EXISTS "contacts_service_role_all" ON contacts;

-- Messages
DROP POLICY IF EXISTS "messages_select_own_project" ON messages;
DROP POLICY IF EXISTS "messages_insert_own_project" ON messages;
DROP POLICY IF EXISTS "messages_update_own_project" ON messages;
DROP POLICY IF EXISTS "messages_service_role_all" ON messages;

-- Media Files
DROP POLICY IF EXISTS "media_select_own_project" ON media_files;
DROP POLICY IF EXISTS "media_insert_own_project" ON media_files;
DROP POLICY IF EXISTS "media_update_own_project" ON media_files;
DROP POLICY IF EXISTS "media_service_role_all" ON media_files;

-- Message Templates
DROP POLICY IF EXISTS "templates_select_own_project" ON message_templates;
DROP POLICY IF EXISTS "templates_insert_own_project" ON message_templates;
DROP POLICY IF EXISTS "templates_update_own_project" ON message_templates;
DROP POLICY IF EXISTS "templates_service_role_all" ON message_templates;

-- Templates (WhatsApp)
DROP POLICY IF EXISTS "templates_wa_select_authenticated" ON templates;
DROP POLICY IF EXISTS "templates_wa_service_role_all" ON templates;

-- Workflows
DROP POLICY IF EXISTS "workflows_select_own_project" ON workflows;
DROP POLICY IF EXISTS "workflows_insert_own_project" ON workflows;
DROP POLICY IF EXISTS "workflows_update_own_project" ON workflows;

-- Workflow Steps
DROP POLICY IF EXISTS "workflow_steps_select_authenticated" ON workflow_steps;
DROP POLICY IF EXISTS "workflow_steps_insert_authenticated" ON workflow_steps;
DROP POLICY IF EXISTS "workflow_steps_update_authenticated" ON workflow_steps;

-- Integrations
DROP POLICY IF EXISTS "integrations_select_own_project" ON integrations;
DROP POLICY IF EXISTS "integrations_insert_own_project" ON integrations;
DROP POLICY IF EXISTS "integrations_update_own_project" ON integrations;

-- AI Configurations
DROP POLICY IF EXISTS "ai_config_select_own_project" ON ai_configurations;
DROP POLICY IF EXISTS "ai_config_update_own_project" ON ai_configurations;
DROP POLICY IF EXISTS "ai_config_insert_own_project" ON ai_configurations;

-- Webhook Events
DROP POLICY IF EXISTS "webhook_events_service_only" ON webhook_events;

-- Webhook Endpoints
DROP POLICY IF EXISTS "webhook_endpoints_select_own_project" ON webhook_endpoints;
DROP POLICY IF EXISTS "webhook_endpoints_insert_own_project" ON webhook_endpoints;
DROP POLICY IF EXISTS "webhook_endpoints_update_own_project" ON webhook_endpoints;

-- Email Logs
DROP POLICY IF EXISTS "email_logs_select_own_project" ON email_logs;
DROP POLICY IF EXISTS "email_logs_service_role_all" ON email_logs;

-- Email Attachments
DROP POLICY IF EXISTS "email_attachments_service_role" ON email_attachments;

-- Notification Preferences
DROP POLICY IF EXISTS "notification_prefs_select_own_project" ON notification_preferences;
DROP POLICY IF EXISTS "notification_prefs_insert_own_project" ON notification_preferences;
DROP POLICY IF EXISTS "notification_prefs_update_own_project" ON notification_preferences;

-- Communication Analytics
DROP POLICY IF EXISTS "analytics_select_own_project" ON communication_analytics;
DROP POLICY IF EXISTS "analytics_insert_service_role" ON communication_analytics;

-- Magic Links
DROP POLICY IF EXISTS "magic_links_service_only" ON magic_links;

-- ============================================================
-- الخطوة 4: إنشاء سياسات آمنة جديدة
-- ============================================================

-- Projects - مع منع anon
CREATE POLICY "projects_secure_select" ON projects
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "projects_secure_insert" ON projects
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "projects_secure_update" ON projects
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- Users - مع منع anon
CREATE POLICY "users_secure_select" ON users
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "users_secure_insert" ON users
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "users_secure_update" ON users
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND id = auth.uid()
    );

-- WhatsApp Numbers - مع منع anon
CREATE POLICY "whatsapp_numbers_secure_select" ON whatsapp_numbers
    FOR SELECT
    USING (
        (auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        ))
        OR auth.role() = 'service_role'
    );

CREATE POLICY "whatsapp_numbers_secure_insert" ON whatsapp_numbers
    FOR INSERT
    WITH CHECK (
        (auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        ))
        OR auth.role() = 'service_role'
    );

CREATE POLICY "whatsapp_numbers_secure_update" ON whatsapp_numbers
    FOR UPDATE
    USING (
        (auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        ))
        OR auth.role() = 'service_role'
    );

-- Contacts - مع منع anon
CREATE POLICY "contacts_secure_select" ON contacts
    FOR SELECT
    USING (
        (auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        ))
        OR auth.role() = 'service_role'
    );

CREATE POLICY "contacts_secure_insert" ON contacts
    FOR INSERT
    WITH CHECK (
        (auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        ))
        OR auth.role() = 'service_role'
    );

CREATE POLICY "contacts_secure_update" ON contacts
    FOR UPDATE
    USING (
        (auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        ))
        OR auth.role() = 'service_role'
    );

-- Messages - مع منع anon
CREATE POLICY "messages_secure_select" ON messages
    FOR SELECT
    USING (
        (auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        ))
        OR auth.role() = 'service_role'
    );

CREATE POLICY "messages_secure_insert" ON messages
    FOR INSERT
    WITH CHECK (
        (auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        ))
        OR auth.role() = 'service_role'
    );

CREATE POLICY "messages_secure_update" ON messages
    FOR UPDATE
    USING (
        (auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        ))
        OR auth.role() = 'service_role'
    );

-- Media Files - مع منع anon
CREATE POLICY "media_secure_select" ON media_files
    FOR SELECT
    USING (
        (auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND message_id IN (
            SELECT id FROM messages 
            WHERE project_id IN (
                SELECT project_id 
                FROM project_members 
                WHERE user_id = auth.uid()
            )
        ))
        OR auth.role() = 'service_role'
    );

CREATE POLICY "media_secure_insert" ON media_files
    FOR INSERT
    WITH CHECK (
        (auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated')
        OR auth.role() = 'service_role'
    );

-- Message Templates - مع منع anon
CREATE POLICY "templates_secure_select" ON message_templates
    FOR SELECT
    USING (
        (auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        ))
        OR auth.role() = 'service_role'
    );

CREATE POLICY "templates_secure_insert" ON message_templates
    FOR INSERT
    WITH CHECK (
        (auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        ))
        OR auth.role() = 'service_role'
    );

CREATE POLICY "templates_secure_update" ON message_templates
    FOR UPDATE
    USING (
        (auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        ))
        OR auth.role() = 'service_role'
    );

-- Templates (WhatsApp) - مع منع anon
CREATE POLICY "templates_wa_secure_select" ON templates
    FOR SELECT
    USING (
        (auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND phone_number_id IN (
            SELECT id 
            FROM whatsapp_numbers 
            WHERE project_id IN (
                SELECT project_id 
                FROM project_members 
                WHERE user_id = auth.uid()
            )
        ))
        OR auth.role() = 'service_role'
    );

-- Workflows - مع منع anon
CREATE POLICY "workflows_secure_select" ON workflows
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "workflows_secure_insert" ON workflows
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "workflows_secure_update" ON workflows
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- Workflow Steps - مع منع anon
CREATE POLICY "workflow_steps_secure_select" ON workflow_steps
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND workflow_id IN (
            SELECT w.id 
            FROM workflows w
            WHERE w.project_id IN (
                SELECT project_id 
                FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "workflow_steps_secure_insert" ON workflow_steps
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND workflow_id IN (
            SELECT w.id 
            FROM workflows w
            WHERE w.project_id IN (
                SELECT project_id 
                FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Integrations - مع منع anon
CREATE POLICY "integrations_secure_select" ON integrations
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "integrations_secure_insert" ON integrations
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- AI Configurations - مع منع anon
CREATE POLICY "ai_config_secure_select" ON ai_configurations
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "ai_config_secure_update" ON ai_configurations
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "ai_config_secure_insert" ON ai_configurations
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- Webhook Events - service role فقط
CREATE POLICY "webhook_events_service_only" ON webhook_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Webhook Endpoints - مع منع anon
CREATE POLICY "webhook_endpoints_secure_select" ON webhook_endpoints
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "webhook_endpoints_secure_insert" ON webhook_endpoints
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- Email Logs - مع منع anon
CREATE POLICY "email_logs_secure_select" ON email_logs
    FOR SELECT
    USING (
        (auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        ))
        OR auth.role() = 'service_role'
    );

-- Email Attachments - service role فقط
CREATE POLICY "email_attachments_service_only" ON email_attachments
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Notification Preferences - مع منع anon
CREATE POLICY "notification_prefs_secure_select" ON notification_preferences
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "notification_prefs_secure_insert" ON notification_preferences
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- Communication Analytics - مع منع anon
CREATE POLICY "analytics_secure_select" ON communication_analytics
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND auth.role() = 'authenticated'
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "analytics_service_insert" ON communication_analytics
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Magic Links - service role فقط
CREATE POLICY "magic_links_service_only" ON magic_links
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================
-- الخطوة 5: التحقق من تفعيل RLS
-- ============================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE magic_links ENABLE ROW LEVEL SECURITY;

COMMIT;

-- ============================================================
-- انتهى! تم تطبيق جميع الإصلاحات الأمنية
-- ============================================================
-- الآن قم بما يلي:
-- 1. افتح Supabase Dashboard
-- 2. اذهب إلى Authentication → Password Protection
-- 3. فعّل "Leaked password protection"
-- ============================================================
