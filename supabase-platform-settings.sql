-- Create platform_settings table for storing admin configurations

-- Drop existing table if it exists
DROP TABLE IF EXISTS platform_settings CASCADE;

-- Create platform_settings table
CREATE TABLE platform_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  
  -- General Settings
  site_name TEXT DEFAULT 'Adaze Marketplace',
  site_description TEXT DEFAULT 'Your trusted online marketplace in Kenya',
  site_logo_url TEXT,
  contact_email TEXT DEFAULT 'support@adaze.com',
  support_phone TEXT DEFAULT '+254700000000',
  
  -- Email Settings
  smtp_host TEXT,
  smtp_port TEXT DEFAULT '587',
  smtp_user TEXT,
  smtp_password TEXT,
  smtp_from_email TEXT,
  smtp_from_name TEXT DEFAULT 'Adaze Marketplace',
  
  -- Payment Settings
  mpesa_consumer_key TEXT,
  mpesa_consumer_secret TEXT,
  mpesa_passkey TEXT,
  mpesa_shortcode TEXT,
  platform_commission_rate DECIMAL(5,2) DEFAULT 10.00,
  
  -- Feature Toggles
  enable_reviews BOOLEAN DEFAULT true,
  enable_wishlist BOOLEAN DEFAULT true,
  enable_chat BOOLEAN DEFAULT false,
  enable_notifications BOOLEAN DEFAULT true,
  maintenance_mode BOOLEAN DEFAULT false,
  
  -- Appearance Settings
  primary_color TEXT DEFAULT '#8b5cf6',
  secondary_color TEXT DEFAULT '#3b82f6',
  theme_mode TEXT DEFAULT 'light',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint to ensure only one row
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default settings
INSERT INTO platform_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "admins_read_settings" ON platform_settings;
DROP POLICY IF EXISTS "admins_update_settings" ON platform_settings;

-- Allow admins to read settings
CREATE POLICY "admins_read_settings"
ON platform_settings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Allow admins to update settings
CREATE POLICY "admins_update_settings"
ON platform_settings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Allow admins to insert settings (for upsert)
DROP POLICY IF EXISTS "admins_insert_settings" ON platform_settings;

CREATE POLICY "admins_insert_settings"
ON platform_settings FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_platform_settings_id ON platform_settings(id);

-- Add comments
COMMENT ON TABLE platform_settings IS 'Stores platform-wide configuration settings';
COMMENT ON COLUMN platform_settings.id IS 'Always 1 - ensures single row';
COMMENT ON COLUMN platform_settings.platform_commission_rate IS 'Percentage commission taken from each transaction';
COMMENT ON COLUMN platform_settings.maintenance_mode IS 'When true, only admins can access the platform';
