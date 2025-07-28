import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xcfpugrehglzaraljhcf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZnB1Z3JlaGdsemFyYWxqaGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NTMwMTgsImV4cCI6MjA2OTIyOTAxOH0.OYObmVAKizj4WoKvbXJBxI1sci3J7l9bxIFixMSJw8A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // Enable detecting auth parameters in URL
    flowType: 'pkce', // Use PKCE flow for added security
  }
});

export default supabase;