-- ============================================
-- Security Fix: Remove Anonymous Access & Strengthen RLS Policies
-- Date: 2026-02-07
-- Purpose: Fix security warnings from Supabase Advisor
-- ============================================

-- ============================================
-- Drop Old Insecure Policies
-- ============================================

-- WhatsApp Numbers
DROP POLICY IF EXISTS "Allow all access" ON whatsapp_numbers;
DROP POLICY IF EXISTS "whatsapp_authenticated_only" ON whatsapp_numbers;
DROP POLICY IF EXISTS "whatsapp_insert_own_project" ON whatsapp_numbers;
DROP POLICY IF EXISTS "whatsapp_numbers_service_only" ON whatsapp_numbers;

-- Message Templates
DROP POLICY IF EXISTS "Allow all access" ON message_templates;
DROP POLICY IF EXISTS "templates_authenticated_only" ON message_templates;
DROP POLICY IF EXISTS "templates_insert_own_project" ON message_templates;
DROP POLICY IF EXISTS "message_templates_service_only" ON message_templates;

-- Templates
DROP POLICY IF EXISTS "Allow all access" ON templates;

-- Contacts
DROP POLICY IF EXISTS "Allow all access" ON contacts;
DROP POLICY IF EXISTS "contacts_authenticated_only" ON contacts;
DROP POLICY IF EXISTS "contacts_insert_own_project" ON contacts;
DROP POLICY IF EXISTS "contacts_select_own_project" ON contacts;
DROP POLICY IF EXISTS "contacts_update_own_project" ON contacts;

-- Messages
DROP POLICY IF EXISTS "Allow all access" ON messages;
DROP POLICY IF EXISTS "messages_authenticated_only" ON messages;
DROP POLICY IF EXISTS "messages_insert_own_project" ON messages;
DROP POLICY IF EXISTS "messages_select_own_project" ON messages;

-- Projects
DROP POLICY IF EXISTS "projects_authenticated_only" ON projects;
DROP POLICY IF EXISTS "projects_insert_own" ON projects;

-- Users
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_select_team" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

-- Project Members
DROP POLICY IF EXISTS "project_members_authenticated_only" ON project_members;
DROP POLICY IF EXISTS "members_insert_admin" ON project_members;

-- Communication Analytics
DROP POLICY IF EXISTS "analytics_authenticated_only" ON communication_analytics;
DROP POLICY IF EXISTS "analytics_insert_own_project" ON communication_analytics;

-- Magic Links
DROP POLICY IF EXISTS "magic_links_select_service" ON magic_links;
DROP POLICY IF EXISTS "magic_links_service_only" ON magic_links;
DROP POLICY IF EXISTS "magic_links_insert_authenticated" ON magic_links;

-- ============================================
-- Create Secure Policies - WhatsApp Numbers
-- ============================================

-- Only authenticated users can view their project's WhatsApp numbers
CREATE POLICY "whatsapp_numbers_select_own_project" ON whatsapp_numbers
    FOR SELECT
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- Only authenticated users can insert WhatsApp numbers to their projects
CREATE POLICY "whatsapp_numbers_insert_own_project" ON whatsapp_numbers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- Only authenticated users can update their project's WhatsApp numbers
CREATE POLICY "whatsapp_numbers_update_own_project" ON whatsapp_numbers
    FOR UPDATE
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- Service role can do anything (for webhooks)
CREATE POLICY "whatsapp_numbers_service_role_all" ON whatsapp_numbers
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Create Secure Policies - Message Templates
-- ============================================

CREATE POLICY "templates_select_own_project" ON message_templates
    FOR SELECT
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "templates_insert_own_project" ON message_templates
    FOR INSERT
    TO authenticated
    WITH CHECK (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "templates_update_own_project" ON message_templates
    FOR UPDATE
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "templates_service_role_all" ON message_templates
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Create Secure Policies - Templates (WhatsApp Sync)
-- ============================================

CREATE POLICY "templates_wa_select_authenticated" ON templates
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "templates_wa_service_role_all" ON templates
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Create Secure Policies - Contacts
-- ============================================

CREATE POLICY "contacts_select_own_project" ON contacts
    FOR SELECT
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "contacts_insert_own_project" ON contacts
    FOR INSERT
    TO authenticated
    WITH CHECK (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "contacts_update_own_project" ON contacts
    FOR UPDATE
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "contacts_service_role_all" ON contacts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Create Secure Policies - Messages
-- ============================================

CREATE POLICY "messages_select_own_project" ON messages
    FOR SELECT
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "messages_insert_own_project" ON messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "messages_service_role_all" ON messages
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Create Secure Policies - Projects
-- ============================================

CREATE POLICY "projects_select_member" ON projects
    FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "projects_insert_own" ON projects
    FOR INSERT
    TO authenticated
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "projects_update_member" ON projects
    FOR UPDATE
    TO authenticated
    USING (
        id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- ============================================
-- Create Secure Policies - Users
-- ============================================

CREATE POLICY "users_select_own" ON users
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "users_select_team_members" ON users
    FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT pm.user_id 
            FROM project_members pm
            WHERE pm.project_id IN (
                SELECT project_id 
                FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "users_update_own" ON users
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid());

-- ============================================
-- Create Secure Policies - Project Members
-- ============================================

CREATE POLICY "members_select_own_projects" ON project_members
    FOR SELECT
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "members_insert_admin" ON project_members
    FOR INSERT
    TO authenticated
    WITH CHECK (
        project_id IN (
            SELECT p.id 
            FROM projects p
            WHERE p.owner_id = auth.uid()
        )
    );

-- ============================================
-- Create Secure Policies - Communication Analytics
-- ============================================

CREATE POLICY "analytics_select_own_project" ON communication_analytics
    FOR SELECT
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "analytics_insert_service_role" ON communication_analytics
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- ============================================
-- Create Secure Policies - Magic Links
-- ============================================

-- Only service role can manage magic links
CREATE POLICY "magic_links_service_only" ON magic_links
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Create Secure Policies - Media Files
-- ============================================

CREATE POLICY "media_select_own_project" ON media_files
    FOR SELECT
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "media_insert_own_project" ON media_files
    FOR INSERT
    TO authenticated
    WITH CHECK (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "media_service_role_all" ON media_files
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Create Secure Policies - Email Logs
-- ============================================

CREATE POLICY "email_logs_select_own_project" ON email_logs
    FOR SELECT
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "email_logs_service_role_all" ON email_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Create Secure Policies - Other Tables
-- ============================================

-- AI Configurations
CREATE POLICY "ai_config_select_own_project" ON ai_configurations
    FOR SELECT
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "ai_config_update_own_project" ON ai_configurations
    FOR UPDATE
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "ai_config_insert_own_project" ON ai_configurations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- Integrations
CREATE POLICY "integrations_select_own_project" ON integrations
    FOR SELECT
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "integrations_insert_own_project" ON integrations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "integrations_update_own_project" ON integrations
    FOR UPDATE
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- Workflows
CREATE POLICY "workflows_select_own_project" ON workflows
    FOR SELECT
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "workflows_insert_own_project" ON workflows
    FOR INSERT
    TO authenticated
    WITH CHECK (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "workflows_update_own_project" ON workflows
    FOR UPDATE
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- Workflow Steps
CREATE POLICY "workflow_steps_select_authenticated" ON workflow_steps
    FOR SELECT
    TO authenticated
    USING (
        workflow_id IN (
            SELECT w.id 
            FROM workflows w
            WHERE w.project_id IN (
                SELECT project_id 
                FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "workflow_steps_insert_authenticated" ON workflow_steps
    FOR INSERT
    TO authenticated
    WITH CHECK (
        workflow_id IN (
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
        workflow_id IN (
            SELECT w.id 
            FROM workflows w
            WHERE w.project_id IN (
                SELECT project_id 
                FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Webhook Endpoints
CREATE POLICY "webhook_endpoints_select_own_project" ON webhook_endpoints
    FOR SELECT
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "webhook_endpoints_insert_own_project" ON webhook_endpoints
    FOR INSERT
    TO authenticated
    WITH CHECK (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "webhook_endpoints_update_own_project" ON webhook_endpoints
    FOR UPDATE
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- Webhook Events (Service role only for logging)
CREATE POLICY "webhook_events_service_only" ON webhook_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Email Attachments
CREATE POLICY "email_attachments_select_own_project" ON email_attachments
    FOR SELECT
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "email_attachments_service_role" ON email_attachments
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Notification Preferences
CREATE POLICY "notification_prefs_select_own_project" ON notification_preferences
    FOR SELECT
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "notification_prefs_insert_own_project" ON notification_preferences
    FOR INSERT
    TO authenticated
    WITH CHECK (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "notification_prefs_update_own_project" ON notification_preferences
    FOR UPDATE
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

-- ============================================
-- Create helper function for checking project membership
-- ============================================

CREATE OR REPLACE FUNCTION public.is_project_member(check_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM project_members
        WHERE project_id = check_project_id
        AND user_id = auth.uid()
    );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_project_member(UUID) TO authenticated;

-- ============================================
-- Summary:
-- ============================================
-- ✅ Removed all policies allowing anonymous access
-- ✅ All policies now require authenticated role
-- ✅ Service role maintained for webhook/system operations
-- ✅ Project-based access control enforced
-- ✅ Helper function created for easy membership checks
-- 
-- Next steps:
-- 1. Enable Leaked Password Protection in Supabase Dashboard
--    Auth > Settings > Password Security > Enable "Leaked password protection"
-- 2. Run this migration in your Supabase dashboard or via CLI
-- ============================================
