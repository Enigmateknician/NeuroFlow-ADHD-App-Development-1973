-- First, let's create all the missing tables that the app expects

-- 1. Create the users table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  dream_text TEXT,
  dream_image_url TEXT,
  echoes_enabled BOOLEAN DEFAULT true,
  role TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the relationships table
CREATE TABLE IF NOT EXISTS relationships_7fb42a5e9d (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('partner', 'family', 'friend', 'mentor', 'child', 'colleague', 'other')),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create the circle check-ins table
CREATE TABLE IF NOT EXISTS circle_checkins_8f3d72c1e4 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  relationship_id UUID REFERENCES relationships_7fb42a5e9d(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pinged', 'thought')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create the echoes table
CREATE TABLE IF NOT EXISTS echoes_6e82a3a1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  relationship_id UUID REFERENCES relationships_7fb42a5e9d(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('checkin', 'dream', 'gratitude')),
  text TEXT NOT NULL,
  importance_score INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create the analytics table
CREATE TABLE IF NOT EXISTS event_logs_analytics_admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create storage buckets (run these in the Supabase Storage interface)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('circle-photos', 'circle-photos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('dream-images', 'dream-images', true);

-- 7. Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships_7fb42a5e9d ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_checkins_8f3d72c1e4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE echoes_6e82a3a1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_logs_analytics_admin ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies

-- Users table policies
CREATE POLICY "Users can view and edit own data" ON users
  FOR ALL USING (auth.uid() = id);

-- Relationships table policies
CREATE POLICY "Users can manage own relationships" ON relationships_7fb42a5e9d
  FOR ALL USING (auth.uid() = user_id);

-- Check-ins table policies
CREATE POLICY "Users can manage own checkins" ON circle_checkins_8f3d72c1e4
  FOR ALL USING (auth.uid() = user_id);

-- Echoes table policies
CREATE POLICY "Users can view own echoes" ON echoes_6e82a3a1
  FOR ALL USING (auth.uid() = user_id);

-- Analytics table policies (admin only for SELECT, users can INSERT their own)
CREATE POLICY "Users can insert own analytics" ON event_logs_analytics_admin
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all analytics" ON event_logs_analytics_admin
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.role = 'admin')
    )
  );

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_relationships_user_id ON relationships_7fb42a5e9d(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON circle_checkins_8f3d72c1e4(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_relationship_id ON circle_checkins_8f3d72c1e4(relationship_id);
CREATE INDEX IF NOT EXISTS idx_echoes_user_id ON echoes_6e82a3a1(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON event_logs_analytics_admin(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON event_logs_analytics_admin(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON event_logs_analytics_admin(timestamp);

-- 10. Create a function to automatically create user record when they sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (new.id, new.email, now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user record
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 11. Insert the seed data for the requested tables
INSERT INTO power_pings (text, author, tier, created_at) VALUES
('You don''t have to get it all done. You just have to get started.', 'Sparqio', 'Free', NOW()),
('Start small. Momentum will find you once you begin.', 'Sparqio', 'Free', NOW()),
('You''ve done hard things before. You can do this too.', 'Sparqio', 'Free', NOW());

INSERT INTO rescue_kit_tools (name, category, instructions, is_user_generated, created_at) VALUES
('Box Breathing', 'Breathing', 'Inhale 4 seconds, hold 4, exhale 4, hold 4. Repeat 4 times.', false, NOW()),
('5-4-3-2-1 Grounding', 'Mindfulness', 'Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.', false, NOW()),
('Mini Win', 'Motivation', 'Set a timer for 2 minutes and do a super easy task. Prove you can win.', false, NOW());

INSERT INTO fuel_plan_tips (text, type, recommended_for, is_user_generated, created_at) VALUES
('Drink 16oz of water within 15 minutes of waking up.', 'core', 'all', false, NOW()),
('Protein + fiber = brain fuel. Build meals around those.', 'core', 'all', false, NOW()),
('Dim your lights an hour before bed. Bright light delays melatonin.', 'core', 'all', false, NOW());

INSERT INTO knowledge_garden_entries (title, content, source, is_user_generated, created_by_admin, created_at) VALUES
('The Dopamine Motivation Gap', 'ADHD brains often seek novelty to boost dopamine. Tasks that feel boring are harder—not because of laziness, but chemistry.', 'Barkley et al., 2022', false, true, NOW()),
('Time Blindness Explained', 'People with ADHD often struggle with perceiving time accurately. This can impact planning, urgency, and task initiation.', 'Tuckman, 2021', false, true, NOW()),
('Why Routines Help', 'External structure supports executive function. Routines reduce decision fatigue and make transitions easier for ADHD brains.', 'Hallowell & Ratey, 2019', false, true, NOW());