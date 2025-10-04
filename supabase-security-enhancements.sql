-- Enhanced Security Features
-- 1. Login History Tracking
-- 2. Suspicious Activity Detection
-- 3. 2FA Support
-- 4. Session Management

-- ============================================
-- TABLE 1: Login History
-- ============================================

DROP TABLE IF EXISTS login_history CASCADE;

CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Login Details
  login_time TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  device_type TEXT, -- mobile, desktop, tablet
  browser TEXT,
  os TEXT,
  location_country TEXT,
  location_city TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('success', 'failed', 'blocked')),
  failure_reason TEXT,
  
  -- Security
  is_suspicious BOOLEAN DEFAULT false,
  risk_score INTEGER DEFAULT 0, -- 0-100
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_login_history_user_id ON login_history(user_id);
CREATE INDEX idx_login_history_login_time ON login_history(login_time DESC);
CREATE INDEX idx_login_history_suspicious ON login_history(is_suspicious) WHERE is_suspicious = true;
CREATE INDEX idx_login_history_status ON login_history(status);

-- ============================================
-- TABLE 2: Two-Factor Authentication
-- ============================================

DROP TABLE IF EXISTS user_2fa CASCADE;

CREATE TABLE user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- 2FA Settings
  enabled BOOLEAN DEFAULT false,
  method TEXT CHECK (method IN ('totp', 'sms', 'email')) DEFAULT 'totp',
  secret TEXT, -- TOTP secret (encrypted)
  backup_codes TEXT[], -- Emergency backup codes (hashed)
  
  -- Phone for SMS
  phone_number TEXT,
  phone_verified BOOLEAN DEFAULT false,
  
  -- Status
  verified_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_user_2fa_user_id ON user_2fa(user_id);
CREATE INDEX idx_user_2fa_enabled ON user_2fa(enabled) WHERE enabled = true;

-- ============================================
-- TABLE 3: Suspicious Activities
-- ============================================

DROP TABLE IF EXISTS suspicious_activities CASCADE;

CREATE TABLE suspicious_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Activity Details
  activity_type TEXT CHECK (activity_type IN (
    'multiple_failed_logins',
    'unusual_location',
    'unusual_device',
    'rapid_requests',
    'privilege_escalation_attempt',
    'data_scraping',
    'unusual_time',
    'vpn_detected',
    'password_change',
    'email_change'
  )),
  
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  description TEXT,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  metadata JSONB, -- Additional context
  
  -- Status
  status TEXT CHECK (status IN ('detected', 'investigating', 'resolved', 'false_positive')) DEFAULT 'detected',
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  resolution_notes TEXT,
  
  -- Auto-actions taken
  action_taken TEXT, -- blocked, alerted, logged, etc.
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_suspicious_activities_user_id ON suspicious_activities(user_id);
CREATE INDEX idx_suspicious_activities_created_at ON suspicious_activities(created_at DESC);
CREATE INDEX idx_suspicious_activities_status ON suspicious_activities(status);
CREATE INDEX idx_suspicious_activities_severity ON suspicious_activities(severity);

-- ============================================
-- TABLE 4: Active Sessions
-- ============================================

DROP TABLE IF EXISTS active_sessions CASCADE;

CREATE TABLE active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Session Details
  session_token TEXT NOT NULL UNIQUE,
  device_name TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  ip_address INET,
  location_country TEXT,
  location_city TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_active_sessions_user_id ON active_sessions(user_id);
CREATE INDEX idx_active_sessions_token ON active_sessions(session_token);
CREATE INDEX idx_active_sessions_is_active ON active_sessions(is_active) WHERE is_active = true;

-- ============================================
-- TABLE 5: Security Settings (per user)
-- ============================================

DROP TABLE IF EXISTS user_security_settings CASCADE;

CREATE TABLE user_security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Login Security
  require_2fa BOOLEAN DEFAULT false,
  login_notifications BOOLEAN DEFAULT true,
  unusual_activity_alerts BOOLEAN DEFAULT true,
  
  -- Session Management
  auto_logout_minutes INTEGER DEFAULT 60,
  require_password_change BOOLEAN DEFAULT false,
  password_changed_at TIMESTAMPTZ,
  
  -- Failed Login Protection
  max_failed_attempts INTEGER DEFAULT 5,
  lockout_duration_minutes INTEGER DEFAULT 15,
  current_failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  
  -- Trusted Devices
  trusted_device_ids TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_user_security_settings_user_id ON user_security_settings(user_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Login History
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own login history
CREATE POLICY "users_view_own_login_history"
ON login_history FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all login history
CREATE POLICY "admins_view_all_login_history"
ON login_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- System can insert login history (via service role)
CREATE POLICY "system_insert_login_history"
ON login_history FOR INSERT
TO authenticated
WITH CHECK (true);

-- Two-Factor Authentication
ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_2fa"
ON user_2fa FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "admins_view_2fa"
ON user_2fa FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Suspicious Activities
ALTER TABLE suspicious_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_suspicious_activities"
ON suspicious_activities FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "admins_manage_suspicious_activities"
ON suspicious_activities FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Active Sessions
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_sessions"
ON active_sessions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "users_delete_own_sessions"
ON active_sessions FOR DELETE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "admins_view_all_sessions"
ON active_sessions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Security Settings
ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_security_settings"
ON user_security_settings FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "admins_view_security_settings"
ON user_security_settings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to detect suspicious login
CREATE OR REPLACE FUNCTION detect_suspicious_login(
  p_user_id UUID,
  p_ip_address INET,
  p_user_agent TEXT,
  p_location_country TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_risk_score INTEGER := 0;
  v_is_suspicious BOOLEAN := false;
  v_last_login_country TEXT;
  v_recent_failed_attempts INTEGER;
BEGIN
  -- Check 1: Multiple failed attempts recently
  SELECT COUNT(*)
  INTO v_recent_failed_attempts
  FROM login_history
  WHERE user_id = p_user_id
    AND status = 'failed'
    AND login_time > NOW() - INTERVAL '15 minutes';
  
  IF v_recent_failed_attempts >= 3 THEN
    v_risk_score := v_risk_score + 40;
  END IF;
  
  -- Check 2: New country
  SELECT location_country
  INTO v_last_login_country
  FROM login_history
  WHERE user_id = p_user_id
    AND status = 'success'
  ORDER BY login_time DESC
  LIMIT 1;
  
  IF v_last_login_country IS NOT NULL 
     AND v_last_login_country != p_location_country THEN
    v_risk_score := v_risk_score + 30;
  END IF;
  
  -- Check 3: Login at unusual time (1 AM - 5 AM)
  IF EXTRACT(HOUR FROM NOW()) BETWEEN 1 AND 5 THEN
    v_risk_score := v_risk_score + 20;
  END IF;
  
  -- Determine if suspicious
  IF v_risk_score >= 50 THEN
    v_is_suspicious := true;
  END IF;
  
  RETURN v_is_suspicious;
END;
$$;

-- Function to log suspicious activity
CREATE OR REPLACE FUNCTION log_suspicious_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_severity TEXT,
  p_description TEXT,
  p_ip_address INET DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO suspicious_activities (
    user_id,
    activity_type,
    severity,
    description,
    ip_address,
    metadata,
    status
  )
  VALUES (
    p_user_id,
    p_activity_type,
    p_severity,
    p_description,
    p_ip_address,
    p_metadata,
    'detected'
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$;

-- Function to create default security settings for new users
CREATE OR REPLACE FUNCTION create_default_security_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_security_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to create security settings on user creation
DROP TRIGGER IF EXISTS on_user_created_security_settings ON profiles;

CREATE TRIGGER on_user_created_security_settings
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_security_settings();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE login_history IS 'Tracks all login attempts for security auditing';
COMMENT ON TABLE user_2fa IS 'Stores 2FA configuration for users';
COMMENT ON TABLE suspicious_activities IS 'Logs and tracks suspicious activities on the platform';
COMMENT ON TABLE active_sessions IS 'Manages active user sessions across devices';
COMMENT ON TABLE user_security_settings IS 'Per-user security preferences and settings';

COMMENT ON FUNCTION detect_suspicious_login IS 'Analyzes login attempt and returns risk assessment';
COMMENT ON FUNCTION log_suspicious_activity IS 'Creates a new suspicious activity record';
COMMENT ON FUNCTION create_default_security_settings IS 'Auto-creates security settings for new users';
