-- =====================================================
-- Block Anonymous Access Completely
-- =====================================================
-- This migration explicitly blocks all anon role access
-- by adding auth.role() = 'authenticated' check to all policies
-- =====================================================

BEGIN;

-- Drop all existing policies that allow anon access
DROP POLICY IF EXISTS "ai_config_select_own_project" ON ai_configurations;
DROP POLICY IF EXISTS "ai_config_update_own_project" ON ai_configurations;
DROP POLICY IF EXISTS "ai_config_insert_own_project" ON ai_configurations;
DROP POLICY IF EXISTS "analytics_select_own_project" ON communication_analytics;
DROP POLICY IF EXISTS "contacts_select_own_project" ON contacts;
DROP POLICY IF EXISTS "contacts_update_own_project" ON contacts;
DROP POLICY IF EXISTS "email_attachments_select_own_project" ON email_attachments;
DROP POLICY IF EXISTS "email_logs_select_own_project" ON email_logs;
DROP POLICY IF EXISTS "integrations_select_own_project" ON integrations;
DROP POLICY IF EXISTS "integrations_update_own_project" ON integrations;
DROP POLICY IF EXISTS "integrations_insert_own_project" ON integrations;
DROP POLICY IF EXISTS "media_select_own_project" ON media_files;
DROP POLICY IF EXISTS "templates_select_own_project" ON message_templates;
DROP POLICY IF EXISTS "templates_update_own_project" ON message_templates;
DROP POLICY IF EXISTS "messages_select_own_project" ON messages;
DROP POLICY IF EXISTS "notification_prefs_select_own_project" ON notification_preferences;
DROP POLICY IF EXISTS "notification_prefs_update_own_project" ON notification_preferences;
DROP POLICY IF EXISTS "notification_prefs_insert_own_project" ON notification_preferences;
DROP POLICY IF EXISTS "members_select_own_projects" ON project_members;
DROP POLICY IF EXISTS "projects_select_member" ON projects;
DROP POLICY IF EXISTS "projects_update_member" ON projects;
DROP POLICY IF EXISTS "templates_wa_select_authenticated" ON templates;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_select_own_authenticated" ON public.users;
DROP POLICY IF EXISTS "users_select_team_members" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own_authenticated" ON public.users;
DROP POLICY IF EXISTS "webhook_endpoints_select_own_project" ON webhook_endpoints;
DROP POLICY IF EXISTS "webhook_endpoints_update_own_project" ON webhook_endpoints;
DROP POLICY IF EXISTS "webhook_endpoints_insert_own_project" ON webhook_endpoints;
DROP POLICY IF EXISTS "whatsapp_numbers_select_own_project" ON whatsapp_numbers;
DROP POLICY IF EXISTS "whatsapp_numbers_update_own_project" ON whatsapp_numbers;
DROP POLICY IF EXISTS "workflow_steps_select_authenticated" ON workflow_steps;
DROP POLICY IF EXISTS "workflow_steps_update_authenticated" ON workflow_steps;
DROP POLICY IF EXISTS "workflow_steps_insert_authenticated" ON workflow_steps;
DROP POLICY IF EXISTS "workflows_select_own_project" ON workflows;
DROP POLICY IF EXISTS "workflows_update_own_project" ON workflows;
DROP POLICY IF EXISTS "workflows_insert_own_project" ON workflows;

-- Drop auth.users policies
DROP POLICY IF EXISTS "users_select_own" ON auth.users;
DROP POLICY IF EXISTS "users_select_own_authenticated" ON auth.users;
DROP POLICY IF EXISTS "users_select_team_members" ON auth.users;
DROP POLICY IF EXISTS "users_update_own" ON auth.users;
DROP POLICY IF EXISTS "users_update_own_authenticated" ON auth.users;

-- Recreate all policies with explicit auth.role() check
-- =====================================================

-- AI Configurations
CREATE POLICY "ai_config_select_own_project" ON ai_configurations
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "ai_config_update_own_project" ON ai_configurations
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "ai_config_insert_own_project" ON ai_configurations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

-- Communication Analytics
CREATE POLICY "analytics_select_own_project" ON communication_analytics
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

-- Contacts
CREATE POLICY "contacts_select_own_project" ON contacts
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "contacts_update_own_project" ON contacts
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

-- Email Attachments
CREATE POLICY "email_attachments_select_own_project" ON email_attachments
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        email_log_id IN (
            SELECT id FROM email_logs 
            WHERE project_id IN (
                SELECT project_id FROM project_members WHERE user_id = auth.uid()
            )
        )
    );

-- Email Logs
CREATE POLICY "email_logs_select_own_project" ON email_logs
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

-- Integrations
CREATE POLICY "integrations_select_own_project" ON integrations
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "integrations_update_own_project" ON integrations
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "integrations_insert_own_project" ON integrations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

-- Media Files
CREATE POLICY "media_select_own_project" ON media_files
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        message_id IN (
            SELECT id FROM messages 
            WHERE project_id IN (
                SELECT project_id FROM project_members WHERE user_id = auth.uid()
            )
        )
    );

-- Message Templates
CREATE POLICY "templates_select_own_project" ON message_templates
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "templates_update_own_project" ON message_templates
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

-- Messages
CREATE POLICY "messages_select_own_project" ON messages
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

-- Notification Preferences
CREATE POLICY "notification_prefs_select_own_project" ON notification_preferences
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "notification_prefs_update_own_project" ON notification_preferences
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "notification_prefs_insert_own_project" ON notification_preferences
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

-- Project Members
CREATE POLICY "members_select_own_projects" ON project_members
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        user_id = auth.uid()
    );

-- Projects
CREATE POLICY "projects_select_member" ON projects
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "projects_update_member" ON projects
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

-- Templates (WhatsApp)
CREATE POLICY "templates_wa_select_authenticated" ON templates
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        phone_number_id IN (
            SELECT id FROM whatsapp_numbers 
            WHERE project_id IN (
                SELECT project_id FROM project_members WHERE user_id = auth.uid()
            )
        )
    );

-- Public Users Table
CREATE POLICY "users_select_own_authenticated" ON public.users
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        id = auth.uid()
    );

CREATE POLICY "users_update_own_authenticated" ON public.users
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        id = auth.uid()
    );

-- Webhook Endpoints
CREATE POLICY "webhook_endpoints_select_own_project" ON webhook_endpoints
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "webhook_endpoints_update_own_project" ON webhook_endpoints
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "webhook_endpoints_insert_own_project" ON webhook_endpoints
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

-- WhatsApp Numbers
CREATE POLICY "whatsapp_numbers_select_own_project" ON whatsapp_numbers
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "whatsapp_numbers_update_own_project" ON whatsapp_numbers
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

-- Workflow Steps
CREATE POLICY "workflow_steps_select_authenticated" ON workflow_steps
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        workflow_id IN (
            SELECT w.id FROM workflows w
            WHERE w.project_id IN (
                SELECT project_id FROM project_members WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "workflow_steps_update_authenticated" ON workflow_steps
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        workflow_id IN (
            SELECT w.id FROM workflows w
            WHERE w.project_id IN (
                SELECT project_id FROM project_members WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "workflow_steps_insert_authenticated" ON workflow_steps
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.role() = 'authenticated' AND
        workflow_id IN (
            SELECT w.id FROM workflows w
            WHERE w.project_id IN (
                SELECT project_id FROM project_members WHERE user_id = auth.uid()
            )
        )
    );

-- Workflows
CREATE POLICY "workflows_select_own_project" ON workflows
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "workflows_update_own_project" ON workflows
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "workflows_insert_own_project" ON workflows
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.role() = 'authenticated' AND
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

COMMIT;
