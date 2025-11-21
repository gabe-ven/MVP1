-- CRM Tables for Load Insights MVP
-- Run this SQL in your Supabase SQL Editor to create the tables

-- 1. Brokers table
CREATE TABLE IF NOT EXISTS brokers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  broker_name TEXT NOT NULL,
  broker_email TEXT,
  broker_phone TEXT,
  first_load_date TIMESTAMP,
  last_load_date TIMESTAMP,
  total_loads INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  avg_rate DECIMAL(10, 2) DEFAULT 0,
  avg_rpm DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_email, broker_email)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_brokers_user_email ON brokers(user_email);
CREATE INDEX IF NOT EXISTS idx_brokers_status ON brokers(status);

-- 2. Broker Interactions table
CREATE TABLE IF NOT EXISTS broker_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('email', 'call', 'meeting', 'note')),
  subject TEXT,
  notes TEXT,
  interaction_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_interactions_user_email ON broker_interactions(user_email);
CREATE INDEX IF NOT EXISTS idx_interactions_broker_id ON broker_interactions(broker_id);
CREATE INDEX IF NOT EXISTS idx_interactions_date ON broker_interactions(interaction_date DESC);

-- 3. Broker Tasks table
CREATE TABLE IF NOT EXISTS broker_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_email ON broker_tasks(user_email);
CREATE INDEX IF NOT EXISTS idx_tasks_broker_id ON broker_tasks(broker_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON broker_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON broker_tasks(due_date);

-- Update timestamp trigger for brokers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_brokers_updated_at
  BEFORE UPDATE ON brokers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON broker_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

