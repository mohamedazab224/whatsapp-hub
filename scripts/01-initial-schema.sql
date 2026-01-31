-- Create table for WhatsApp Numbers
CREATE TABLE IF NOT EXISTS whatsapp_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number_id TEXT UNIQUE NOT NULL,
    display_phone_number TEXT NOT NULL,
    verified_name TEXT,
    quality_rating TEXT DEFAULT 'GREEN',
    status TEXT DEFAULT 'APPROVED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for Message Templates
CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id TEXT UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    language TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    content JSONB NOT NULL,
    whatsapp_number_id UUID REFERENCES whatsapp_numbers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for WhatsApp API Templates (sync + UI management)
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS templates_unique_idx ON templates (wa_template_code, phone_number_id);

-- Create table for Contacts
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wa_id TEXT UNIQUE NOT NULL,
    name TEXT,
    profile_picture_url TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp_message_id TEXT UNIQUE NOT NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    whatsapp_number_id UUID REFERENCES whatsapp_numbers(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'text', 'image', 'video', 'template', etc.
    direction TEXT NOT NULL, -- 'inbound', 'outbound'
    status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'failed'
    body TEXT,
    media_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE whatsapp_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create Policies (Public access for now as requested for rapid implementation, should be refined for production)
CREATE POLICY "Allow all access" ON whatsapp_numbers FOR ALL USING (true);
CREATE POLICY "Allow all access" ON message_templates FOR ALL USING (true);
CREATE POLICY "Allow all access" ON templates FOR ALL USING (true);
CREATE POLICY "Allow all access" ON contacts FOR ALL USING (true);
CREATE POLICY "Allow all access" ON messages FOR ALL USING (true);
