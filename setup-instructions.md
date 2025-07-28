# Sparqio Database Setup Instructions

## Step 1: Run the Main Database Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database-setup.sql`
4. Click **Run** to execute all the commands

This will create:
- All necessary tables with proper relationships
- Row Level Security (RLS) policies
- Indexes for performance
- Auto-user creation trigger
- The requested seed data for Power Pings, Rescue Kit, Fuel Plan, and Knowledge Garden

## Step 2: Create Storage Buckets

1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Create two public buckets:
   - Name: `circle-photos` (Public: Yes)
   - Name: `dream-images` (Public: Yes)

## Step 3: Verify the Setup

1. Check that all tables are created in **Table Editor**
2. Verify RLS is enabled on all tables
3. Test the app by:
   - Creating a new user account
   - Setting up a dream
   - Adding people to your circle
   - Performing check-ins

## What's Fixed

### Error 1: "Failed to load echoes"
- **Root cause**: Missing tables and RLS policies
- **Fix**: Created all tables with proper RLS policies
- **Added**: Better error handling in EchoesFeed component
- **Added**: Auto-user creation when user doesn't exist in users table

### Error 2: "Failed to save Dream"
- **Root cause**: Missing users table and RLS policies
- **Fix**: Created users table with proper relationships
- **Added**: Better error handling and user creation in DreamSetupScreen
- **Added**: Graceful handling of missing user records

### Additional Improvements
- **Better Error Messages**: Users now see helpful error messages instead of technical errors
- **Auto-Recovery**: App automatically creates missing user records
- **Seed Data**: Added all requested seed content for Power Pings, Rescue Kit, Fuel Plan, and Knowledge Garden
- **Performance**: Added proper indexes for faster queries

## Testing the Fix

After running the setup:

1. **Test Echoes**: 
   - Log in and navigate to Profile
   - Check that echoes load without errors
   - Perform a check-in to generate new echoes

2. **Test Dreams**:
   - Go to Dream Setup
   - Try saving a dream with and without images
   - Verify no error messages appear

3. **Test Admin Dashboard** (if you have admin access):
   - Navigate to `/admin-dashboard`
   - Verify analytics data displays correctly

The app should now work smoothly without the previous database errors!