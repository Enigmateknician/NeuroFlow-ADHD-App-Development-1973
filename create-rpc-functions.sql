-- Create RPC functions that the app expects
-- These functions will create tables if they don't exist

-- Function to create users table if it doesn't exist
CREATE OR REPLACE FUNCTION create_users_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create users table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.users (
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

  -- Enable RLS if not already enabled
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

  -- Create policy if it doesn't exist
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'users' 
      AND policyname = 'Users can view and edit own data'
    ) THEN
      CREATE POLICY "Users can view and edit own data" 
      ON public.users 
      FOR ALL 
      USING (auth.uid() = id);
    END IF;
  END $$;

  -- Create index if it doesn't exist
  CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);
  CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
END;
$$;

-- Function to create relationships table if it doesn't exist
CREATE OR REPLACE FUNCTION create_relationships_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ensure users table exists first
  PERFORM create_users_table_if_not_exists();

  -- Create relationships table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.relationships_7fb42a5e9d (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('partner','family','friend','mentor','child','colleague','other')),
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Enable RLS if not already enabled
  ALTER TABLE public.relationships_7fb42a5e9d ENABLE ROW LEVEL SECURITY;

  -- Create policy if it doesn't exist
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'relationships_7fb42a5e9d' 
      AND policyname = 'Users can manage own relationships'
    ) THEN
      CREATE POLICY "Users can manage own relationships" 
      ON public.relationships_7fb42a5e9d 
      FOR ALL 
      USING (auth.uid() = user_id);
    END IF;
  END $$;

  -- Create indexes if they don't exist
  CREATE INDEX IF NOT EXISTS idx_relationships_user_id ON public.relationships_7fb42a5e9d(user_id);
  CREATE INDEX IF NOT EXISTS idx_relationships_created_at ON public.relationships_7fb42a5e9d(created_at);
END;
$$;

-- Function to create circle check-ins table if it doesn't exist
CREATE OR REPLACE FUNCTION create_checkins_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ensure prerequisite tables exist
  PERFORM create_users_table_if_not_exists();
  PERFORM create_relationships_table_if_not_exists();

  -- Create circle check-ins table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.circle_checkins_8f3d72c1e4 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    relationship_id UUID REFERENCES public.relationships_7fb42a5e9d(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('pinged','thought')),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Enable RLS if not already enabled
  ALTER TABLE public.circle_checkins_8f3d72c1e4 ENABLE ROW LEVEL SECURITY;

  -- Create policy if it doesn't exist
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'circle_checkins_8f3d72c1e4' 
      AND policyname = 'Users can manage own checkins'
    ) THEN
      CREATE POLICY "Users can manage own checkins" 
      ON public.circle_checkins_8f3d72c1e4 
      FOR ALL 
      USING (auth.uid() = user_id);
    END IF;
  END $$;

  -- Create indexes if they don't exist
  CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON public.circle_checkins_8f3d72c1e4(user_id);
  CREATE INDEX IF NOT EXISTS idx_checkins_relationship_id ON public.circle_checkins_8f3d72c1e4(relationship_id);
  CREATE INDEX IF NOT EXISTS idx_checkins_created_at ON public.circle_checkins_8f3d72c1e4(created_at);
END;
$$;

-- Function to create echoes table if it doesn't exist
CREATE OR REPLACE FUNCTION create_echoes_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ensure prerequisite tables exist
  PERFORM create_users_table_if_not_exists();
  PERFORM create_relationships_table_if_not_exists();

  -- Create echoes table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.echoes_6e82a3a1 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    relationship_id UUID REFERENCES public.relationships_7fb42a5e9d(id) ON DELETE CASCADE,
    source TEXT NOT NULL CHECK (source IN ('checkin','dream','gratitude')),
    text TEXT NOT NULL,
    importance_score INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Enable RLS if not already enabled
  ALTER TABLE public.echoes_6e82a3a1 ENABLE ROW LEVEL SECURITY;

  -- Create policy if it doesn't exist
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'echoes_6e82a3a1' 
      AND policyname = 'Users can view own echoes'
    ) THEN
      CREATE POLICY "Users can view own echoes" 
      ON public.echoes_6e82a3a1 
      FOR ALL 
      USING (auth.uid() = user_id);
    END IF;
  END $$;

  -- Create indexes if they don't exist
  CREATE INDEX IF NOT EXISTS idx_echoes_user_id ON public.echoes_6e82a3a1(user_id);
  CREATE INDEX IF NOT EXISTS idx_echoes_relationship_id ON public.echoes_6e82a3a1(relationship_id);
  CREATE INDEX IF NOT EXISTS idx_echoes_created_at ON public.echoes_6e82a3a1(created_at);
END;
$$;

-- Function to create analytics table if it doesn't exist
CREATE OR REPLACE FUNCTION create_analytics_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ensure users table exists first
  PERFORM create_users_table_if_not_exists();

  -- Create analytics table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.event_logs_analytics_admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Enable RLS if not already enabled
  ALTER TABLE public.event_logs_analytics_admin ENABLE ROW LEVEL SECURITY;

  -- Create policies if they don't exist
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'event_logs_analytics_admin' 
      AND policyname = 'Users can insert own analytics'
    ) THEN
      CREATE POLICY "Users can insert own analytics" 
      ON public.event_logs_analytics_admin 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'event_logs_analytics_admin' 
      AND policyname = 'Admins can view all analytics'
    ) THEN
      CREATE POLICY "Admins can view all analytics" 
      ON public.event_logs_analytics_admin 
      FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE users.id = auth.uid() 
          AND (users.is_admin = true OR users.role = 'admin')
        )
      );
    END IF;
  END $$;

  -- Create indexes if they don't exist
  CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.event_logs_analytics_admin(user_id);
  CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON public.event_logs_analytics_admin(event_name);
  CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON public.event_logs_analytics_admin(timestamp);
END;
$$;

-- Function to create sparks table if it doesn't exist
CREATE OR REPLACE FUNCTION create_sparks_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ensure users table exists first
  PERFORM create_users_table_if_not_exists();

  -- Create sparks table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.sparks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new','in_progress','completed','archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Enable RLS if not already enabled
  ALTER TABLE public.sparks ENABLE ROW LEVEL SECURITY;

  -- Create policy if it doesn't exist
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'sparks' 
      AND policyname = 'Users can manage own sparks'
    ) THEN
      CREATE POLICY "Users can manage own sparks" 
      ON public.sparks 
      FOR ALL 
      USING (auth.uid() = user_id);
    END IF;
  END $$;

  -- Create indexes if they don't exist
  CREATE INDEX IF NOT EXISTS idx_sparks_user_id ON public.sparks(user_id);
  CREATE INDEX IF NOT EXISTS idx_sparks_created_at ON public.sparks(created_at);
END;
$$;

-- Function to create all tables at once
CREATE OR REPLACE FUNCTION create_all_tables_if_not_exist()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM create_users_table_if_not_exists();
  PERFORM create_relationships_table_if_not_exists();
  PERFORM create_checkins_table_if_not_exists();
  PERFORM create_echoes_table_if_not_exists();
  PERFORM create_analytics_table_if_not_exists();
  PERFORM create_sparks_table_if_not_exists();
END;
$$;

-- Function to handle new user creation from auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ensure users table exists
  PERFORM create_users_table_if_not_exists();
  
  -- Insert new user record
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage buckets if they don't exist (this part needs to be run manually in Supabase)
-- You'll need to create these in the Supabase Storage interface:
-- 1. circle-photos (public bucket)
-- 2. dream-images (public bucket)