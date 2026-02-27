-- Fintech OS Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spending categories
CREATE TABLE IF NOT EXISTS spending_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📦',
  color TEXT DEFAULT '#3b82f6',
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  raw_description TEXT,
  category TEXT DEFAULT 'Uncategorized',
  source TEXT DEFAULT 'manual',
  type TEXT DEFAULT 'expense' CHECK (type IN ('expense', 'income', 'transfer')),
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Decoded transactions
CREATE TABLE IF NOT EXISTS decoded_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  decoded_text TEXT,
  merchant TEXT,
  category TEXT,
  confidence DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voice logs
CREATE TABLE IF NOT EXISTS voice_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transcript TEXT,
  audio_url TEXT,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  limit_amount DECIMAL(12,2) NOT NULL,
  current_spend DECIMAL(12,2) DEFAULT 0,
  period TEXT DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'yearly')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial health score
CREATE TABLE IF NOT EXISTS financial_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  components JSONB DEFAULT '{}',
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI chat history
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  messages JSONB DEFAULT '[]',
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investment plans
CREATE TABLE IF NOT EXISTS investment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_level TEXT CHECK (risk_level IN ('low', 'mid', 'high')),
  allocations JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT,
  severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automations
CREATE TABLE IF NOT EXISTS automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_config JSONB NOT NULL DEFAULT '{}',
  action_config JSONB NOT NULL DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  last_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Linked accounts
CREATE TABLE IF NOT EXISTS linked_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT DEFAULT 'setu',
  account_name TEXT,
  account_type TEXT,
  consent_status TEXT DEFAULT 'pending' CHECK (consent_status IN ('pending', 'active', 'revoked', 'expired')),
  last_sync TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE decoded_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE linked_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users manage own categories" ON spending_categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own decoded" ON decoded_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own voice_logs" ON voice_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own budgets" ON budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own health" ON financial_health FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own chat" ON ai_chat_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own investments" ON investment_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own alerts" ON alerts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own automations" ON automations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own accounts" ON linked_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own audit_logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System inserts audit_logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- Create profile on user signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  
  -- Insert default spending categories
  INSERT INTO public.spending_categories (user_id, name, icon, color) VALUES
    (NEW.id, 'Healthcare', '🏥', '#ef4444'),
    (NEW.id, 'Rent', '🏠', '#f97316'),
    (NEW.id, 'Shopping', '🛍️', '#8b5cf6'),
    (NEW.id, 'Food', '🍔', '#10b981'),
    (NEW.id, 'Travel', '✈️', '#3b82f6'),
    (NEW.id, 'Utilities', '💡', '#f59e0b'),
    (NEW.id, 'Entertainment', '🎮', '#ec4899'),
    (NEW.id, 'Education', '📚', '#06b6d4'),
    (NEW.id, 'Salary', '💰', '#22c55e'),
    (NEW.id, 'Investment', '📈', '#6366f1');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed some default data for demo purposes (indexes)
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(user_id, category);
CREATE INDEX idx_alerts_user_read ON alerts(user_id, read);
CREATE INDEX idx_ai_chat_user_agent ON ai_chat_history(user_id, agent_type);
