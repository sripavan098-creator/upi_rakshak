-- UPI Rakshak Database Schema
-- Migration: 001_initial_schema.sql

-- =====================================================
-- TABLE: profiles
-- Extends auth.users with user profile information
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  preferred_language TEXT DEFAULT 'en',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'support')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (triggered automatically)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- TABLE: scans
-- Stores all fraud analysis scans performed by users
-- =====================================================
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('manual', 'notification', 'qr', 'voice')),
  original_text TEXT NOT NULL,
  threat_level TEXT NOT NULL CHECK (threat_level IN ('HIGH', 'MEDIUM', 'SAFE')),
  reasons JSONB DEFAULT '[]'::jsonb,
  suggested_action TEXT,
  official_route TEXT,
  matched_patterns JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for scans
CREATE INDEX IF NOT EXISTS idx_scans_user_id_created_at ON scans(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_threat_level ON scans(threat_level);

-- Enable RLS
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scans
-- Users can view their own scans
CREATE POLICY "Users can view own scans"
  ON scans FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own scans
CREATE POLICY "Users can insert own scans"
  ON scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own scans
CREATE POLICY "Users can delete own scans"
  ON scans FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: user_preferences
-- Stores user-specific settings and preferences
-- =====================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_enabled BOOLEAN DEFAULT true,
  haptics_enabled BOOLEAN DEFAULT true,
  overlay_enabled BOOLEAN DEFAULT true,
  notification_monitoring BOOLEAN DEFAULT true,
  guardian_mode_enabled BOOLEAN DEFAULT false,
  guardian_contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own preferences (triggered automatically)
CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TABLE: shared_reports
-- Stores reports shared with guardian contacts
-- =====================================================
CREATE TABLE IF NOT EXISTS shared_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id),
  shared_with_phone TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for shared_reports
CREATE INDEX IF NOT EXISTS idx_shared_reports_shared_with_phone_status 
  ON shared_reports(shared_with_phone, status);

-- Enable RLS
ALTER TABLE shared_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shared_reports
-- Users can view reports they shared
CREATE POLICY "Users can view own shared reports"
  ON shared_reports FOR SELECT
  USING (auth.uid() = shared_by);

-- Users can insert reports they're sharing
CREATE POLICY "Users can insert own shared reports"
  ON shared_reports FOR INSERT
  WITH CHECK (auth.uid() = shared_by);

-- Users can update reports they shared
CREATE POLICY "Users can update own shared reports"
  ON shared_reports FOR UPDATE
  USING (auth.uid() = shared_by);

-- Guardian contacts can view pending reports shared with them
CREATE POLICY "Guardians can view pending reports"
  ON shared_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.phone = shared_reports.shared_with_phone
    )
    AND status = 'pending'
  );

-- =====================================================
-- TABLE: cash_flow_snapshots
-- Stores periodic cash flow analysis snapshots
-- =====================================================
CREATE TABLE IF NOT EXISTS cash_flow_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  runway_days INTEGER NOT NULL,
  income NUMERIC NOT NULL,
  expenses NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for cash_flow_snapshots
CREATE INDEX IF NOT EXISTS idx_cash_flow_snapshots_user_id_created_at 
  ON cash_flow_snapshots(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE cash_flow_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cash_flow_snapshots
CREATE POLICY "Users can view own cash flow snapshots"
  ON cash_flow_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cash flow snapshots"
  ON cash_flow_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TABLE: events
-- Stores analytics events (privacy-safe, no PII)
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for events
CREATE INDEX IF NOT EXISTS idx_events_user_id_created_at ON events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
CREATE POLICY "Users can view own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TABLE: audit_log
-- Stores security audit events
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id_created_at ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- Enable RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_log
-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON audit_log FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert audit logs (via edge functions)
CREATE POLICY "Service role can insert audit logs"
  ON audit_log FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- TABLE: threat_patterns
-- Stores detection patterns for the rules engine
-- =====================================================
CREATE TABLE IF NOT EXISTS threat_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  regex TEXT,
  keywords JSONB DEFAULT '[]'::jsonb,
  threat_level TEXT NOT NULL CHECK (threat_level IN ('HIGH', 'MEDIUM', 'SAFE')),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for threat_patterns
CREATE INDEX IF NOT EXISTS idx_threat_patterns_category ON threat_patterns(category);
CREATE INDEX IF NOT EXISTS idx_threat_patterns_enabled ON threat_patterns(enabled);

-- Enable RLS
ALTER TABLE threat_patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for threat_patterns
-- Only admins can view threat patterns
CREATE POLICY "Admins can view threat patterns"
  ON threat_patterns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Only admins can insert threat patterns
CREATE POLICY "Admins can insert threat patterns"
  ON threat_patterns FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Only admins can update threat patterns
CREATE POLICY "Admins can update threat patterns"
  ON threat_patterns FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Only admins can delete threat patterns
CREATE POLICY "Admins can delete threat patterns"
  ON threat_patterns FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- TRIGGERS
-- Auto-create profile and preferences on user signup
-- =====================================================

-- Function to create profile and preferences
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name, phone, preferred_language)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
  );
  
  -- Create user preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- TRIGGERS
-- Auto-update updated_at timestamp
-- =====================================================

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
DROP TRIGGER IF EXISTS set_updated_at ON profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for user_preferences
DROP TRIGGER IF EXISTS set_updated_at ON user_preferences;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for threat_patterns
DROP TRIGGER IF EXISTS set_updated_at ON threat_patterns;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON threat_patterns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SEED DATA
-- Initial threat patterns from the rules engine
-- =====================================================

INSERT INTO threat_patterns (name, category, keywords, threat_level) VALUES
-- Urgency manipulation
('urgency_manipulation', 'urgency', 
 '["urgent", "immediately", "disconnected", "blocked", "suspend", "bandh", "kat jayega", "turant", "abhi", "aaj hi"]'::jsonb,
 'HIGH'),

-- Suspicious UPI patterns
('suspicious_upi_ids', 'upi',
 '["care@", "urgent@", "verify@", "help@", "support@", "refund@", "helpline@", "customer@"]'::jsonb,
 'HIGH'),

-- Payment traps
('payment_traps', 'payment',
 '["qr code scan karo", "upi pin enter karo", "money receive karne ke liye", "refund ke liye pay karo"]'::jsonb,
 'HIGH'),

-- Lookalike domains
('lookalike_domains', 'domain',
 '["bses-", "sbi-", "paytm-", "phonepe-", "gpay-", "hdfc-", "icici-", "axis-", "kyc-", "verify-"]'::jsonb,
 'HIGH'),

-- Digital arrest scams
('digital_arrest', 'scam',
 '["digital arrest", "virtual custody", "online arrest", "police verification", "cbi verification"]'::jsonb,
 'HIGH'),

-- APK malware
('malware_apk', 'malware',
 '["install apk", "download apk", "e-challan apk", "wedding invitation apk", "traffic fine apk"]'::jsonb,
 'HIGH'),

-- Remote access
('remote_access', 'scam',
 '["anydesk", "teamviewer", "quicksupport", "screen share", "screen sharing", "remote access"]'::jsonb,
 'HIGH'),

-- Autopay traps
('autopay_trap', 'payment',
 '["autopay", "auto-pay", "mandate", "recurring payment", "verify with ₹1", "trial activation"]'::jsonb,
 'HIGH'),

-- AI/Deepfake
('ai_deepfake', 'scam',
 '["deepfake", "voice clone", "ai voice", "video call police", "cbi officer"]'::jsonb,
 'HIGH'),

-- Investment scams
('investment_scam', 'scam',
 '["guaranteed returns", "guaranteed profit", "double your money", "trading group", "crypto signals"]'::jsonb,
 'HIGH'),

-- Loan app traps
('loan_app_trap', 'scam',
 '["instant loan", "quick loan", "loan in minutes", "contact access", "gallery access"]'::jsonb,
 'HIGH'),

-- Job scams
('job_scam', 'scam',
 '["work from home", "part time job", "registration fee job", "daily income", "rating task"]'::jsonb,
 'HIGH'),

-- Lottery scams
('lottery_scam', 'scam',
 '["kbc winner", "lucky draw", "lucky winner", "bumper prize", "jackpot winner"]'::jsonb,
 'HIGH'),

-- Customer care scams
('customer_care_scam', 'scam',
 '["customer care number", "toll free number", "helpline number", "call this number"]'::jsonb,
 'HIGH'),

-- Courier scams
('courier_scam', 'scam',
 '["parcel seized", "parcel contains drugs", "parcel customs", "courier customs"]'::jsonb,
 'HIGH'),

-- Sextortion
('sextortion', 'scam',
 '["video call recording", "your video viral", "upload your video", "morphed video"]'::jsonb,
 'HIGH'),

-- Romance scams
('romance_scam', 'scam',
 '["matrimonial profile", "dating profile", "foreign boyfriend", "nri fiancé"]'::jsonb,
 'MEDIUM'),

-- Charity scams
('charity_scam', 'scam',
 '["donate via upi", "donation upi", "gaza relief", "palestine relief"]'::jsonb,
 'MEDIUM'),

-- Refund scams
('refund_scam', 'scam',
 '["refund via qr", "refund scan qr", "cashback scan", "qr to receive"]'::jsonb,
 'HIGH'),

-- SIM swap
('sim_swap', 'scam',
 '["sim swap", "sim replace", "sim blocked", "sim upgrade"]'::jsonb,
 'HIGH'),

-- Fake screenshots
('fake_screenshot', 'scam',
 '["payment screenshot", "check your phone i paid", "screenshot proof"]'::jsonb,
 'MEDIUM'),

-- Suspicious apps
('suspicious_apps', 'malware',
 '["e-challan", "wedding-invite", "kyc-update", "crypto-trade", "loan-radar"]'::jsonb,
 'HIGH'),

-- Golden rule: PIN for receiving
('pin_for_receiving', 'payment',
 '["receive money", "money receive", "refund", "cashback", "prize money"]'::jsonb,
 'HIGH');

-- =====================================================
-- COMMENTS
-- Documentation for each table
-- =====================================================

COMMENT ON TABLE profiles IS 'User profile information extending auth.users';
COMMENT ON TABLE scans IS 'Fraud analysis scans performed by users';
COMMENT ON TABLE user_preferences IS 'User-specific settings and preferences';
COMMENT ON TABLE shared_reports IS 'Reports shared with guardian contacts';
COMMENT ON TABLE cash_flow_snapshots IS 'Periodic cash flow analysis snapshots';
COMMENT ON TABLE events IS 'Privacy-safe analytics events';
COMMENT ON TABLE audit_log IS 'Security audit events';
COMMENT ON TABLE threat_patterns IS 'Detection patterns for the rules engine';

COMMENT ON COLUMN profiles.role IS 'User role: user, admin, or support';
COMMENT ON COLUMN scans.source IS 'How the scan was initiated: manual, notification, qr, or voice';
COMMENT ON COLUMN scans.threat_level IS 'Detected threat level: HIGH, MEDIUM, or SAFE';
COMMENT ON COLUMN shared_reports.status IS 'Report status: pending, approved, or rejected';
