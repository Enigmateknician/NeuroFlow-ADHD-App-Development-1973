# Supabase Database Analysis for NeuroFlow

## Public Tables Overview

Based on the code analysis, here are all the Supabase tables used in your project:

### 1. **users** (Core User Profile Table)
**Purpose**: Stores user profile information and preferences
**Columns**:
- `id` (UUID, Primary Key) - Supabase Auth user ID
- `email` (TEXT) - User's email address
- `display_name` (TEXT, Optional) - User's display name
- `dream_text` (TEXT, Optional) - User's dream/vision text
- `dream_image_url` (TEXT, Optional) - URL to user's dream image
- `echoes_enabled` (BOOLEAN, Default: true) - Whether echoes feature is enabled
- `role` (TEXT, Optional) - User role (e.g., 'admin')
- `is_admin` (BOOLEAN, Default: false) - Admin flag
- `created_at` (TIMESTAMP, Default: NOW())
- `updated_at` (TIMESTAMP, Default: NOW())

**Relationships**: References Supabase Auth users

---

### 2. **relationships_7fb42a5e9d** (User's Circle/Support Network)
**Purpose**: Stores the people in each user's support circle
**Columns**:
- `id` (UUID, Primary Key, Default: gen_random_uuid())
- `user_id` (UUID, Foreign Key) - References users.id
- `name` (TEXT, NOT NULL) - Name of the person
- `relationship_type` (TEXT, NOT NULL) - Type: 'partner', 'family', 'friend', 'mentor', 'child', 'colleague', 'other'
- `photo_url` (TEXT, Optional) - URL to person's photo
- `notes` (TEXT, Optional) - User's notes about this person
- `created_at` (TIMESTAMP, Default: NOW())
- `updated_at` (TIMESTAMP, Default: NOW())

**Relationships**: 
- Foreign Key: `user_id` → `users.id`

---

### 3. **circle_checkins_8f3d72c1e4** (Daily Connection Tracking)
**Purpose**: Records when users connect with people in their circle
**Columns**:
- `id` (UUID, Primary Key, Default: gen_random_uuid())
- `user_id` (UUID, Foreign Key) - References users.id
- `relationship_id` (UUID, Foreign Key) - References relationships_7fb42a5e9d.id
- `type` (TEXT, NOT NULL) - 'pinged' or 'thought'
- `note` (TEXT, Optional) - Optional note about the interaction
- `created_at` (TIMESTAMP, Default: NOW())

**Relationships**:
- Foreign Key: `user_id` → `users.id`
- Foreign Key: `relationship_id` → `relationships_7fb42a5e9d.id`

---

### 4. **echoes_6e82a3a1** (Self-Trust Building Messages)
**Purpose**: Stores automatically generated positive reinforcement messages
**Columns**:
- `id` (UUID, Primary Key, Default: gen_random_uuid())
- `user_id` (UUID, Foreign Key) - References users.id
- `relationship_id` (UUID, Optional Foreign Key) - References relationships_7fb42a5e9d.id
- `source` (TEXT, NOT NULL) - 'checkin', 'dream', 'gratitude'
- `text` (TEXT, NOT NULL) - The echo message text
- `importance_score` (INTEGER, Default: 1) - Relevance score
- `created_at` (TIMESTAMP, Default: NOW())

**Relationships**:
- Foreign Key: `user_id` → `users.id`
- Foreign Key: `relationship_id` → `relationships_7fb42a5e9d.id` (Optional)

---

### 5. **event_logs_analytics_admin** (Analytics & Admin Dashboard)
**Purpose**: Tracks user interactions for analytics and admin insights
**Columns**:
- `id` (UUID, Primary Key, Default: gen_random_uuid())
- `user_id` (UUID, Optional) - References users.id
- `event_name` (TEXT, NOT NULL) - Event type: 'session_start', 'dream_saved', 'checkin_complete', 'feedback_opened', etc.
- `metadata` (JSONB, Optional) - Additional event data
- `timestamp` (TIMESTAMP, Default: NOW())

**Relationships**:
- Foreign Key: `user_id` → `users.id` (Optional)

---

## Storage Buckets

### 1. **circle-photos**
**Purpose**: Stores profile photos for people in users' circles

### 2. **dream-images** 
**Purpose**: Stores dream/vision images uploaded by users

---

## Table Analysis

### Well-Utilized Tables:
- **users**: Core table, well-integrated
- **relationships_7fb42a5e9d**: Central to the circle feature
- **circle_checkins_8f3d72c1e4**: Core functionality for daily connections
- **event_logs_analytics_admin**: Good for analytics and admin features

### Potentially Underutilized:
- **echoes_6e82a3a1**: Good concept but could be expanded with more interaction features

### Recommendations:
1. Consider adding indexes on frequently queried columns
2. Add RLS policies for security
3. Consider adding a `notifications` table for future features

---

## Sample Seed Data

Here's realistic seed data for testing your MVP: