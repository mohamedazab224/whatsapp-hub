-- ============================================================================
-- Maintenance Request System for WhatsApp Flow Integration
-- ============================================================================

-- Create customers table (if not exists)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    name TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, phone)
);

-- Create maintenance_requests table
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL,
    description TEXT NOT NULL,
    address TEXT,
    preferred_date DATE,
    preferred_time TEXT,
    notes TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    technician_id UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customers_project_id ON customers(project_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_project_id ON maintenance_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_customer_id ON maintenance_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_created_at ON maintenance_requests(created_at DESC);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "View project customers" ON customers
    FOR SELECT TO authenticated
    USING (auth.uid() IS NOT NULL AND project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Service role full access customers" ON customers
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- RLS Policies for maintenance_requests
CREATE POLICY "View project maintenance requests" ON maintenance_requests
    FOR SELECT TO authenticated
    USING (auth.uid() IS NOT NULL AND project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Insert project maintenance requests" ON maintenance_requests
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL AND project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Update project maintenance requests" ON maintenance_requests
    FOR UPDATE TO authenticated
    USING (auth.uid() IS NOT NULL AND project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Service role full access maintenance requests" ON maintenance_requests
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_maintenance_requests_updated_at ON maintenance_requests;
CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
