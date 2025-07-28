# Fix Database Setup Instructions

## The Problem
The app is failing because it's trying to use RPC (Remote Procedure Call) functions that don't exist in your Supabase database. These functions are supposed to create tables automatically if they don't exist.

## The Solution
You need to run the SQL script to create these RPC functions in your Supabase database.

## Step-by-Step Instructions

### 1. Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New query**

### 2. Run the RPC Functions Script
1. Copy the entire contents of the `create-rpc-functions.sql` file
2. Paste it into the SQL Editor
3. Click **Run** to execute the script

### 3. Create Storage Buckets (Manual Step)
The RPC functions will create all tables, but you need to manually create storage buckets:

1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Create these two buckets:
   - **Name**: `circle-photos` | **Public**: Yes
   - **Name**: `dream-images` | **Public**: Yes

### 4. Test the Fix
1. Refresh your app at https://enchanting-toffee-e50d7e.netlify.app
2. Try signing in with a test email
3. The onboarding flow should now work without errors

## What This Fixes
- ✅ **"Failed to load your profile"** errors
- ✅ **Missing table** errors  
- ✅ **RPC function not found** errors
- ✅ **User creation** issues
- ✅ **Dream setup** functionality
- ✅ **Circle setup** functionality
- ✅ **Echoes** functionality

## How It Works
The RPC functions will:
1. **Automatically create tables** when they're needed
2. **Set up proper security policies** (RLS)
3. **Create indexes** for performance
4. **Handle user creation** when someone signs up
5. **Gracefully handle** missing tables or data

## Expected Result
After running this script, your app should work smoothly:
- New users can complete onboarding
- Existing users can access their data
- All features should work without database errors
- The app will automatically create any missing database structures

## Verification
You can verify the fix worked by checking:
1. **Tables exist**: Go to Table Editor and see all the tables
2. **RLS is enabled**: Each table should show "RLS enabled"
3. **App works**: The onboarding flow completes without errors

This should completely resolve the database setup issues you're experiencing!