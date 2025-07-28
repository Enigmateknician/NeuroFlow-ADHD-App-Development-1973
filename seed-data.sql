-- Sample Seed Data for NeuroFlow MVP Testing
-- Run these INSERT statements in your Supabase SQL editor

-- 1. USERS TABLE
INSERT INTO users (id, email, display_name, dream_text, dream_image_url, echoes_enabled, role, is_admin, created_at, updated_at) VALUES
-- Admin user
('550e8400-e29b-41d4-a716-446655440001', 'admin@neuroflow.app', 'Admin User', 'Build a platform that helps ADHD entrepreneurs thrive', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center', true, 'admin', true, NOW() - interval '30 days', NOW() - interval '30 days'),

-- Regular users
('550e8400-e29b-41d4-a716-446655440002', 'sarah.johnson@email.com', 'Sarah Johnson', 'Launch my sustainable fashion brand and impact 10,000 women', 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&h=600&fit=crop&crop=center', true, NULL, false, NOW() - interval '25 days', NOW() - interval '2 days'),

('550e8400-e29b-41d4-a716-446655440003', 'mike.chen@email.com', 'Mike Chen', 'Create a tech startup that solves real problems for small businesses', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center', true, NULL, false, NOW() - interval '20 days', NOW() - interval '1 day'),

('550e8400-e29b-41d4-a716-446655440004', 'emily.rodriguez@email.com', 'Emily Rodriguez', 'Become a full-time freelance designer and work from anywhere', NULL, true, NULL, false, NOW() - interval '15 days', NOW() - interval '3 hours'),

('550e8400-e29b-41d4-a716-446655440005', 'alex.thompson@email.com', 'Alex Thompson', 'Write and publish my first novel while building my coaching practice', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center', false, NULL, false, NOW() - interval '10 days', NOW() - interval '1 hour'),

('550e8400-e29b-41d4-a716-446655440006', 'jessica.kim@email.com', 'Jessica Kim', NULL, NULL, true, NULL, false, NOW() - interval '5 days', NOW() - interval '30 minutes');

-- 2. RELATIONSHIPS (Circle Members)
INSERT INTO relationships_7fb42a5e9d (id, user_id, name, relationship_type, photo_url, notes, created_at, updated_at) VALUES
-- Sarah's Circle
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'David Johnson', 'partner', NULL, 'My husband and biggest supporter. Always believes in my dreams.', NOW() - interval '25 days', NOW() - interval '25 days'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Mom', 'family', NULL, 'Check in weekly, she worries but always encourages me.', NOW() - interval '25 days', NOW() - interval '25 days'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Lisa Park', 'friend', NULL, 'Fellow entrepreneur, great for brainstorming sessions.', NOW() - interval '24 days', NOW() - interval '24 days'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Rachel Green', 'mentor', NULL, 'Fashion industry veteran, meets monthly for guidance.', NOW() - interval '23 days', NOW() - interval '23 days'),

-- Mike's Circle
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'Jenny Chen', 'partner', NULL, 'My wife, keeps me grounded when I get too excited about new ideas.', NOW() - interval '20 days', NOW() - interval '20 days'),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 'Dad', 'family', NULL, 'Retired engineer, great for technical advice.', NOW() - interval '20 days', NOW() - interval '20 days'),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'Sam Rodriguez', 'friend', NULL, 'College roommate, now successful founder. Great reality check.', NOW() - interval '19 days', NOW() - interval '19 days'),
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'Dr. Maria Santos', 'mentor', NULL, 'Business professor, helps with strategic thinking.', NOW() - interval '18 days', NOW() - interval '18 days'),

-- Emily's Circle
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440004', 'Carlos Rodriguez', 'family', NULL, 'My brother, always honest feedback about my work.', NOW() - interval '15 days', NOW() - interval '15 days'),
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440004', 'Maya Patel', 'friend', NULL, 'Design school friend, we critique each other\'s work.', NOW() - interval '14 days', NOW() - interval '14 days'),
('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440004', 'Tom Wilson', 'colleague', NULL, 'Former boss, now freelance mentor and reference.', NOW() - interval '13 days', NOW() - interval '13 days'),

-- Alex's Circle
('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440005', 'Jordan Thompson', 'partner', NULL, 'My spouse, helps me stay focused on writing goals.', NOW() - interval '10 days', NOW() - interval '10 days'),
('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440005', 'Writing Group', 'other', NULL, 'Weekly writing accountability group.', NOW() - interval '9 days', NOW() - interval '9 days'),
('660e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440005', 'Sarah Mitchell', 'mentor', NULL, 'Published author who guides my writing journey.', NOW() - interval '8 days', NOW() - interval '8 days'),

-- Jessica's Circle (smaller, newer user)
('660e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440006', 'James Kim', 'family', NULL, 'My supportive older brother.', NOW() - interval '5 days', NOW() - interval '5 days'),
('660e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440006', 'Best Friend', 'friend', NULL, 'College best friend, always there for me.', NOW() - interval '4 days', NOW() - interval '4 days');

-- 3. CIRCLE CHECK-INS (Recent activity)
INSERT INTO circle_checkins_8f3d72c1e4 (id, user_id, relationship_id, type, note, created_at) VALUES
-- Sarah's recent check-ins
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'pinged', 'Texted about the new fabric samples I received', NOW() - interval '2 hours'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'thought', 'Remembered her advice about staying patient with the process', NOW() - interval '1 day'),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', 'pinged', 'Called to brainstorm marketing ideas', NOW() - interval '2 days'),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440004', 'thought', 'Thought about her suggestion to focus on sustainable materials', NOW() - interval '3 days'),

-- Mike's recent check-ins
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440005', 'pinged', 'Shared my latest prototype with her', NOW() - interval '3 hours'),
('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440006', 'pinged', 'Asked for his engineering perspective on the tech stack', NOW() - interval '1 day'),
('770e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440007', 'thought', 'Remembered his advice about focusing on MVP first', NOW() - interval '2 days'),

-- Emily's recent check-ins
('770e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440009', 'pinged', 'Sent him my latest logo designs for feedback', NOW() - interval '4 hours'),
('770e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440010', 'pinged', 'Video call to review portfolio updates', NOW() - interval '1 day'),

-- Alex's recent check-ins
('770e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440012', 'thought', 'Appreciated their patience with my writing schedule', NOW() - interval '6 hours'),
('770e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440013', 'pinged', 'Attended weekly writing session', NOW() - interval '2 days'),

-- Jessica's recent check-ins
('770e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440015', 'pinged', 'Caught up over coffee about life changes', NOW() - interval '1 day');

-- 4. ECHOES (Self-trust building messages)
INSERT INTO echoes_6e82a3a1 (id, user_id, relationship_id, source, text, importance_score, created_at) VALUES
-- Sarah's echoes
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'checkin', 'You reached out to David today. That counts.', 1, NOW() - interval '2 hours'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', 'checkin', 'You made time for Lisa. That\'s relationship building.', 1, NOW() - interval '2 days'),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', NULL, 'dream', 'You clarified your vision. That\'s rare and powerful.', 2, NOW() - interval '25 days'),

-- Mike's echoes
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440005', 'checkin', 'You invested in family. That builds roots.', 1, NOW() - interval '1 day'),
('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440007', 'checkin', 'You nurtured a friendship. That creates support.', 1, NOW() - interval '2 days'),
('880e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', NULL, 'dream', 'You made your dream visible. That brings it closer.', 2, NOW() - interval '20 days'),

-- Emily's echoes
('880e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440009', 'checkin', 'You invested in family. That builds roots.', 1, NOW() - interval '4 hours'),
('880e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440010', 'checkin', 'You nurtured a friendship. That creates support.', 1, NOW() - interval '1 day'),

-- Alex's echoes (echoes disabled, so fewer recent ones)
('880e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440005', NULL, 'dream', 'You articulated what matters. That creates direction.', 2, NOW() - interval '10 days'),

-- Jessica's echoes
('880e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440015', 'checkin', 'You invested in family. That builds roots.', 1, NOW() - interval '1 day');

-- 5. EVENT LOGS (Analytics data)
INSERT INTO event_logs_analytics_admin (id, user_id, event_name, metadata, timestamp) VALUES
-- Session starts
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'session_start', '{"referrer": "", "userAgent": "Mozilla/5.0"}', NOW() - interval '2 hours'),
('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'session_start', '{"referrer": "", "userAgent": "Mozilla/5.0"}', NOW() - interval '3 hours'),
('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'session_start', '{"referrer": "", "userAgent": "Mozilla/5.0"}', NOW() - interval '4 hours'),

-- Dream saves
('990e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'dream_saved', '{"is_new": true, "has_image": true, "text_length": 58}', NOW() - interval '25 days'),
('990e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'dream_saved', '{"is_new": true, "has_image": true, "text_length": 73}', NOW() - interval '20 days'),
('990e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440004', 'dream_saved', '{"is_new": true, "has_image": false, "text_length": 67}', NOW() - interval '15 days'),

-- Check-in completes
('990e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'checkin_complete', '{"relationship_id": "660e8400-e29b-41d4-a716-446655440001", "relationship_type": "partner", "check_in_type": "pinged"}', NOW() - interval '2 hours'),
('990e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 'checkin_complete', '{"relationship_id": "660e8400-e29b-41d4-a716-446655440002", "relationship_type": "family", "check_in_type": "thought"}', NOW() - interval '1 day'),
('990e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', 'checkin_complete', '{"relationship_id": "660e8400-e29b-41d4-a716-446655440005", "relationship_type": "partner", "check_in_type": "pinged"}', NOW() - interval '3 hours'),
('990e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440004', 'checkin_complete', '{"relationship_id": "660e8400-e29b-41d4-a716-446655440009", "relationship_type": "family", "check_in_type": "pinged"}', NOW() - interval '4 hours'),

-- Check-in round completes
('990e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 'checkin_round_complete', '{"circle_size": 4, "completion_time_ms": 180000, "completed_fully": true}', NOW() - interval '3 days'),
('990e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', 'checkin_round_complete', '{"circle_size": 4, "completion_time_ms": 210000, "completed_fully": true}', NOW() - interval '2 days'),

-- Feedback opens
('990e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', 'feedback_opened', '{}', NOW() - interval '5 days'),
('990e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440004', 'feedback_opened', '{}', NOW() - interval '3 days'),

-- Echo generated events
('990e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440002', 'echo_generated', '{"source": "checkin", "relationship_type": "partner"}', NOW() - interval '2 hours'),
('990e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440003', 'echo_generated', '{"source": "dream"}', NOW() - interval '20 days'),

-- Circle updates
('990e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440002', 'circle_updated', '{"actionType": "add", "size": 4, "relationship_type": "mentor"}', NOW() - interval '23 days'),
('990e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440006', 'circle_updated', '{"actionType": "save_and_continue", "size": 2}', NOW() - interval '4 days');

-- Add some older events for better analytics
INSERT INTO event_logs_analytics_admin (id, user_id, event_name, metadata, timestamp) VALUES
('990e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440002', 'checkin_complete', '{"relationship_type": "friend", "check_in_type": "thought"}', NOW() - interval '4 days'),
('990e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440002', 'checkin_complete', '{"relationship_type": "partner", "check_in_type": "pinged"}', NOW() - interval '5 days'),
('990e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440003', 'checkin_complete', '{"relationship_type": "family", "check_in_type": "pinged"}', NOW() - interval '3 days'),
('990e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440003', 'checkin_complete', '{"relationship_type": "mentor", "check_in_type": "thought"}', NOW() - interval '6 days'),
('990e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440004', 'checkin_complete', '{"relationship_type": "colleague", "check_in_type": "pinged"}', NOW() - interval '2 days'),
('990e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440005', 'checkin_complete', '{"relationship_type": "other", "check_in_type": "thought"}', NOW() - interval '2 days'),
('990e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440006', 'checkin_complete', '{"relationship_type": "friend", "check_in_type": "pinged"}', NOW() - interval '1 day');

-- Note: You'll need to create the storage buckets manually in Supabase:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create bucket: "circle-photos" (Public bucket)
-- 3. Create bucket: "dream-images" (Public bucket)

-- Row Level Security Policies (Run these after inserting data):
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE relationships_7fb42a5e9d ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE circle_checkins_8f3d72c1e4 ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE echoes_6e82a3a1 ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE event_logs_analytics_admin ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view own data" ON users FOR ALL USING (auth.uid() = id);
-- CREATE POLICY "Users can view own relationships" ON relationships_7fb42a5e9d FOR ALL USING (auth.uid() = user_id);
-- CREATE POLICY "Users can view own checkins" ON circle_checkins_8f3d72c1e4 FOR ALL USING (auth.uid() = user_id);
-- CREATE POLICY "Users can view own echoes" ON echoes_6e82a3a1 FOR ALL USING (auth.uid() = user_id);
-- CREATE POLICY "Admins can view all analytics" ON event_logs_analytics_admin FOR SELECT USING (
--   EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
-- );