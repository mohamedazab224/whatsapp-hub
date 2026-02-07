-- =====================================================
-- Complete Security Overhaul - Final Fix
-- =====================================================
-- This migration completely removes and recreates all RLS policies
-- to block anonymous access definitively by using:
-- 1. auth.role() = 'authenticated' in the policy condition itself
-- 2. TO authenticated role specification
-- 3. auth.uid() IS NOT NULL as additional safety
--
-- This approach is recognized by Supabase Advisor as blocking anon access
-- =====================================================

BEGIN;

-- =====================================================
-- 1. PROJECTS TABLE
-- =====================================================
DROP POLICY IF EXISTS "projects_select_member" ON projects;
DROP POLICY IF EXISTS "projects_update_member" ON projects;

CREATE POLICY "projects_select_member" ON projects
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "projects_update_member" ON projects
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- 2. PROJECT_MEMBERS TABLE
-- =====================================================
DROP POLICY IF EXISTS "members_select_own_projects" ON project_members;

CREATE POLICY "members_select_own_projects" ON project_members
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND user_id = auth.uid()
    );

-- =====================================================
-- 3. USERS TABLE (public schema)
-- =====================================================
DROP POLICY IF EXISTS "users_select_own_authenticated" ON users;
DROP POLICY IF EXISTS "users_update_own_authenticated" ON users;

CREATE POLICY "users_select_own_authenticated" ON users
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND id = auth.uid()
    );

CREATE POLICY "users_update_own_authenticated" ON users
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND id = auth.uid()
    )
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND id = auth.uid()
    );

-- =====================================================
-- 4. WHATSAPP_NUMBERS TABLE
-- =====================================================
DROP POLICY IF EXISTS "whatsapp_numbers_select_own_project" ON whatsapp_numbers;
DROP POLICY IF EXISTS "whatsapp_numbers_update_own_project" ON whatsapp_numbers;

CREATE POLICY "whatsapp_numbers_select_own_project" ON whatsapp_numbers
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "whatsapp_numbers_update_own_project" ON whatsapp_numbers
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- 5. MESSAGE_TEMPLATES TABLE
-- =====================================================
DROP POLICY IF EXISTS "templates_select_own_project" ON message_templates;
DROP POLICY IF EXISTS "templates_update_own_project" ON message_templates;

CREATE POLICY "templates_select_own_project" ON message_templates
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "templates_update_own_project" ON message_templates
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- 6. TEMPLATES TABLE (WhatsApp)
-- =====================================================
DROP POLICY IF EXISTS "templates_wa_select_authenticated" ON templates;

CREATE POLICY "templates_wa_select_authenticated" ON templates
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND phone_number_id IN (
            SELECT id 
            FROM whatsapp_numbers 
            WHERE project_id IN (
                SELECT project_id 
                FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- =====================================================
-- 7. CONTACTS TABLE
-- =====================================================
DROP POLICY IF EXISTS "contacts_select_own_project" ON contacts;
DROP POLICY IF EXISTS "contacts_update_own_project" ON contacts;

CREATE POLICY "contacts_select_own_project" ON contacts
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "contacts_update_own_project" ON contacts
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- 8. MESSAGES TABLE
-- =====================================================
DROP POLICY IF EXISTS "messages_select_own_project" ON messages;

CREATE POLICY "messages_select_own_project" ON messages
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- 9. MEDIA_FILES TABLE
-- =====================================================
DROP POLICY IF EXISTS "media_select_own_project" ON media_files;

CREATE POLICY "media_select_own_project" ON media_files
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- 10. EMAIL_LOGS TABLE
-- =====================================================
DROP POLICY IF EXISTS "email_logs_select_own_project" ON email_logs;

CREATE POLICY "email_logs_select_own_project" ON email_logs
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- 11. AI_CONFIGURATIONS TABLE
-- =====================================================
DROP POLICY IF EXISTS "ai_config_select_own_project" ON ai_configurations;
DROP POLICY IF EXISTS "ai_config_update_own_project" ON ai_configurations;

CREATE POLICY "ai_config_select_own_project" ON ai_configurations
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "ai_config_update_own_project" ON ai_configurations
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- 12. INTEGRATIONS TABLE
-- =====================================================
DROP POLICY IF EXISTS "integrations_select_own_project" ON integrations;
DROP POLICY IF EXISTS "integrations_update_own_project" ON integrations;

CREATE POLICY "integrations_select_own_project" ON integrations
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "integrations_update_own_project" ON integrations
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- 13. WORKFLOWS TABLE
-- =====================================================
DROP POLICY IF EXISTS "workflows_select_own_project" ON workflows;
DROP POLICY IF EXISTS "workflows_update_own_project" ON workflows;

CREATE POLICY "workflows_select_own_project" ON workflows
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "workflows_update_own_project" ON workflows
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- 14. WORKFLOW_STEPS TABLE
-- =====================================================
DROP POLICY IF EXISTS "workflow_steps_select_authenticated" ON workflow_steps;
DROP POLICY IF EXISTS "workflow_steps_update_authenticated" ON workflow_steps;

CREATE POLICY "workflow_steps_select_authenticated" ON workflow_steps
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
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

CREATE POLICY "workflow_steps_update_authenticated" ON workflow_steps
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND workflow_id IN (
            SELECT w.id 
            FROM workflows w
            WHERE w.project_id IN (
                SELECT project_id 
                FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
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

-- =====================================================
-- 15. WEBHOOK_ENDPOINTS TABLE
-- =====================================================
DROP POLICY IF EXISTS "webhook_endpoints_select_own_project" ON webhook_endpoints;
DROP POLICY IF EXISTS "webhook_endpoints_update_own_project" ON webhook_endpoints;

CREATE POLICY "webhook_endpoints_select_own_project" ON webhook_endpoints
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "webhook_endpoints_update_own_project" ON webhook_endpoints
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- 16. EMAIL_ATTACHMENTS TABLE
-- =====================================================
DROP POLICY IF EXISTS "email_attachments_select_own_project" ON email_attachments;

CREATE POLICY "email_attachments_select_own_project" ON email_attachments
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND email_log_id IN (
            SELECT id 
            FROM email_logs 
            WHERE project_id IN (
                SELECT project_id 
                FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- =====================================================
-- 17. NOTIFICATION_PREFERENCES TABLE
-- =====================================================
DROP POLICY IF EXISTS "notification_prefs_select_own_project" ON notification_preferences;
DROP POLICY IF EXISTS "notification_prefs_update_own_project" ON notification_preferences;

CREATE POLICY "notification_prefs_select_own_project" ON notification_preferences
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "notification_prefs_update_own_project" ON notification_preferences
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- 18. COMMUNICATION_ANALYTICS TABLE
-- =====================================================
DROP POLICY IF EXISTS "analytics_select_own_project" ON communication_analytics;

CREATE POLICY "analytics_select_own_project" ON communication_analytics
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- ADDITIONAL SECURITY: Block anon role completely
-- =====================================================

-- Revoke all privileges from anon role on all tables
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- Grant only what authenticated users need (SELECT through RLS)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

COMMIT;
