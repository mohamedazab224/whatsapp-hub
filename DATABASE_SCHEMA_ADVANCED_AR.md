# تصميم قاعدة البيانات المتقدم - WhatsApp Hub SaaS

## 1. الجداول الأساسية الموصى بها

### جدول المستخدمين (Users)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user', -- admin, user, agent
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### جدول Workspaces (المشاريع/الوكالات)
```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  
  -- البيانات المتقدمة
  max_messages_per_month INT DEFAULT 10000,
  max_team_members INT DEFAULT 5,
  max_whatsapp_numbers INT DEFAULT 10,
  
  -- الحالة
  status VARCHAR(50) DEFAULT 'active', -- active, suspended, deleted
  is_premium BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workspaces_owner_id ON workspaces(owner_id);
```

### جدول أعضاء الفريق (Workspace Members)
```sql
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- owner, admin, member, agent
  
  -- الصلاحيات التفصيلية
  can_view_messages BOOLEAN DEFAULT true,
  can_send_messages BOOLEAN DEFAULT true,
  can_manage_contacts BOOLEAN DEFAULT true,
  can_manage_numbers BOOLEAN DEFAULT false,
  can_manage_workflows BOOLEAN DEFAULT false,
  can_manage_team BOOLEAN DEFAULT false,
  can_view_analytics BOOLEAN DEFAULT true,
  
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
```

### جدول أرقام WhatsApp (WhatsApp Numbers)
```sql
CREATE TABLE whatsapp_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- معلومات Meta
  phone_number_id VARCHAR(255) UNIQUE NOT NULL,
  display_phone_number VARCHAR(20) NOT NULL,
  verified_name VARCHAR(255),
  waba_id VARCHAR(255), -- WhatsApp Business Account ID
  
  -- التوكنات (مشفرة في البيانات الفعلية)
  access_token_encrypted TEXT NOT NULL,
  api_version VARCHAR(20) DEFAULT 'v24.0',
  
  -- الحالة
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  
  -- الإحصائيات
  total_messages_sent INT DEFAULT 0,
  total_messages_received INT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_numbers_workspace_id ON whatsapp_numbers(workspace_id);
CREATE INDEX idx_whatsapp_numbers_phone_number_id ON whatsapp_numbers(phone_number_id);
```

### جدول الجهات (Contacts)
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  whatsapp_number_id UUID NOT NULL REFERENCES whatsapp_numbers(id) ON DELETE CASCADE,
  
  -- المعلومات الشخصية
  phone_number VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  company VARCHAR(255),
  avatar_url TEXT,
  
  -- البيانات المخصصة (JSON)
  metadata JSONB DEFAULT '{}',
  
  -- الحالة
  do_not_contact BOOLEAN DEFAULT false,
  do_not_call BOOLEAN DEFAULT false,
  is_blocked BOOLEAN DEFAULT false,
  
  -- الإحصائيات
  total_messages INT DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_direction VARCHAR(20), -- inbound, outbound
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(workspace_id, phone_number)
);

CREATE INDEX idx_contacts_workspace_id ON contacts(workspace_id);
CREATE INDEX idx_contacts_phone_number ON contacts(phone_number);
CREATE INDEX idx_contacts_whatsapp_number_id ON contacts(whatsapp_number_id);
```

### جدول الرسائل (Messages)
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  whatsapp_number_id UUID NOT NULL REFERENCES whatsapp_numbers(id) ON DELETE CASCADE,
  
  -- معرف رسالة Meta
  meta_message_id VARCHAR(255) UNIQUE,
  
  -- محتوى الرسالة
  message_type VARCHAR(50) DEFAULT 'text', -- text, image, video, audio, document, button, interactive
  body TEXT,
  
  -- الاتجاه والحالة
  direction VARCHAR(20) NOT NULL, -- inbound, outbound
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, read, failed
  
  -- معلومات الوسائط
  media_id VARCHAR(255),
  media_url TEXT,
  media_type VARCHAR(50),
  media_filename VARCHAR(255),
  
  -- الرد التلقائي / Workflow
  triggered_by_workflow_id UUID,
  is_automated BOOLEAN DEFAULT false,
  
  -- الملاحظات والعلامات
  internal_notes TEXT,
  tags JSONB DEFAULT '[]',
  
  -- المعلومات الإضافية
  error_message TEXT,
  meta_response JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_workspace_id ON messages(workspace_id);
CREATE INDEX idx_messages_contact_id ON messages(contact_id);
CREATE INDEX idx_messages_whatsapp_number_id ON messages(whatsapp_number_id);
CREATE INDEX idx_messages_direction_status ON messages(direction, status);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

### جدول Workflows (الأتمتة)
```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- المعلومات الأساسية
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- التكوين
  trigger_type VARCHAR(50) NOT NULL, -- message_received, keyword, time_based, api
  trigger_config JSONB NOT NULL, -- يحتوي على تفاصيل الـ Trigger
  
  -- الخطوات (Array من الخطوات)
  steps JSONB NOT NULL DEFAULT '[]',
  
  -- الحالة
  is_active BOOLEAN DEFAULT true,
  
  -- الإحصائيات
  total_runs INT DEFAULT 0,
  successful_runs INT DEFAULT 0,
  failed_runs INT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workflows_workspace_id ON workflows(workspace_id);
```

### جدول تسجيل الأحداث (Message Logs)
```sql
CREATE TABLE message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- المرجع
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  
  -- الحدث
  event_type VARCHAR(100) NOT NULL, -- sent, delivered, read, failed, unsupported, etc
  event_data JSONB,
  
  -- المعالجة
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  webhook_received_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_message_logs_workspace_id ON message_logs(workspace_id);
CREATE INDEX idx_message_logs_message_id ON message_logs(message_id);
CREATE INDEX idx_message_logs_event_type ON message_logs(event_type);
```

### جدول قوالب الرسائل (Message Templates)
```sql
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- المعلومات الأساسية
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) DEFAULT 'custom', -- marketing, notifications, custom
  
  -- المحتوى
  body TEXT NOT NULL,
  header TEXT,
  footer TEXT,
  buttons JSONB DEFAULT '[]',
  
  -- المتغيرات
  variables JSONB DEFAULT '[]', -- e.g., ["{{name}}", "{{product}}"]
  
  -- Meta Template Info (للقوالب المعتمدة من Meta)
  meta_template_id VARCHAR(255),
  meta_status VARCHAR(50), -- pending, approved, rejected
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_message_templates_workspace_id ON message_templates(workspace_id);
```

---

## 2. الجداول الإضافية للـ Analytics

### جدول الإحصائيات اليومية (Daily Stats)
```sql
CREATE TABLE daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  whatsapp_number_id UUID NOT NULL REFERENCES whatsapp_numbers(id) ON DELETE CASCADE,
  
  -- التاريخ
  date DATE NOT NULL,
  
  -- الإحصائيات
  messages_sent INT DEFAULT 0,
  messages_received INT DEFAULT 0,
  messages_failed INT DEFAULT 0,
  unique_contacts INT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(workspace_id, whatsapp_number_id, date)
);

CREATE INDEX idx_daily_stats_workspace_id ON daily_stats(workspace_id);
CREATE INDEX idx_daily_stats_date ON daily_stats(date DESC);
```

---

## 3. Policies (Row Level Security)

```sql
-- مثال: كل مستخدم يرى فقط بيانات workspace الخاصة به
CREATE POLICY "Users can view own workspaces"
  ON workspaces FOR SELECT
  USING (auth.uid() = owner_id OR 
         id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view workspace messages"
  ON messages FOR SELECT
  USING (workspace_id IN (
    SELECT id FROM workspaces 
    WHERE owner_id = auth.uid() OR 
    id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  ));
```

---

## 4. ملاحظات مهمة

1. **التشفير**: التوكنات يجب أن تُشفر قبل الحفظ (استخدم pgcrypto أو library مخصصة)
2. **Soft Deletes**: ضع في الاعتبار إضافة `deleted_at` للجداول الحرجة
3. **Backup Strategy**: نسخ احتياطية يومية على الأقل
4. **Monitoring**: راقب حجم الجداول خاصة `messages` و `message_logs`
5. **Performance**: استخدم VACUUM و ANALYZE دورياً
