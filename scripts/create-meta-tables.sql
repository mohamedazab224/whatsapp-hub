-- Create Meta Business Accounts table
CREATE TABLE IF NOT EXISTS meta_business_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id VARCHAR(255) UNIQUE NOT NULL,
  business_name VARCHAR(255),
  verification_status VARCHAR(100),
  created_time TIMESTAMP WITH TIME ZONE,
  meta_data JSONB,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Meta App Info table
CREATE TABLE IF NOT EXISTS meta_app_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id VARCHAR(255) UNIQUE NOT NULL,
  app_type VARCHAR(100),
  user_id VARCHAR(255),
  is_valid BOOLEAN DEFAULT TRUE,
  scopes TEXT[] DEFAULT ARRAY[]::TEXT[],
  granular_scopes JSONB,
  meta_data JSONB,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Meta WABAs table
CREATE TABLE IF NOT EXISTS meta_wabas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waba_id VARCHAR(255) UNIQUE NOT NULL,
  business_id VARCHAR(255) NOT NULL REFERENCES meta_business_accounts(business_id),
  waba_name VARCHAR(255),
  timezone_id VARCHAR(100),
  currency VARCHAR(10) DEFAULT 'USD',
  template_namespace VARCHAR(255),
  meta_data JSONB,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Meta Phone Numbers table
CREATE TABLE IF NOT EXISTS meta_phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_id VARCHAR(255) UNIQUE NOT NULL,
  waba_id VARCHAR(255) NOT NULL REFERENCES meta_wabas(waba_id),
  display_phone_number VARCHAR(20),
  verified_name VARCHAR(255),
  quality_rating VARCHAR(50),
  status VARCHAR(100),
  account_mode VARCHAR(100),
  meta_data JSONB,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Meta Templates table
CREATE TABLE IF NOT EXISTS meta_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id VARCHAR(255) UNIQUE NOT NULL,
  waba_id VARCHAR(255) NOT NULL REFERENCES meta_wabas(waba_id),
  template_name VARCHAR(255),
  language VARCHAR(50),
  status VARCHAR(100),
  category VARCHAR(100),
  components JSONB,
  parameter_format VARCHAR(100),
  meta_data JSONB,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE meta_business_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_app_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_wabas ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow service role full access
CREATE POLICY "meta_business_accounts_service_role" ON meta_business_accounts
  USING (TRUE) WITH CHECK (TRUE)
  FOR ALL TO authenticated USING (FALSE);

CREATE POLICY "meta_app_info_service_role" ON meta_app_info
  USING (TRUE) WITH CHECK (TRUE)
  FOR ALL TO authenticated USING (FALSE);

CREATE POLICY "meta_wabas_service_role" ON meta_wabas
  USING (TRUE) WITH CHECK (TRUE)
  FOR ALL TO authenticated USING (FALSE);

CREATE POLICY "meta_phone_numbers_service_role" ON meta_phone_numbers
  USING (TRUE) WITH CHECK (TRUE)
  FOR ALL TO authenticated USING (FALSE);

CREATE POLICY "meta_templates_service_role" ON meta_templates
  USING (TRUE) WITH CHECK (TRUE)
  FOR ALL TO authenticated USING (FALSE);

-- Create indexes for performance
CREATE INDEX idx_meta_business_accounts_business_id ON meta_business_accounts(business_id);
CREATE INDEX idx_meta_wabas_business_id ON meta_wabas(business_id);
CREATE INDEX idx_meta_wabas_waba_id ON meta_wabas(waba_id);
CREATE INDEX idx_meta_phone_numbers_waba_id ON meta_phone_numbers(waba_id);
CREATE INDEX idx_meta_templates_waba_id ON meta_templates(waba_id);
CREATE INDEX idx_meta_templates_status ON meta_templates(status);
