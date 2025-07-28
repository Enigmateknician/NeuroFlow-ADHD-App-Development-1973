# Testing Instructions for Sparqio MVP

## Admin Access Testing

To test the admin dashboard with the seed data:

1. **Sign in as admin user**: `admin@sparqio.app`
2. **Navigate to**: `/#/admin-dashboard`
3. **Expected results**:
   - Total Dreams: 4
   - Daily Check-ins: 12+
   - Feedback Entries: 2
   - Active Users: 5-6
   - Recent activity timeline with various events
   - Active users table showing engagement levels

## User Flow Testing

### Test User Accounts:
1. **sarah.johnson@email.com** - Complete profile with dream and 4 circle members
2. **mike.chen@email.com** - Complete profile with dream and 4 circle members  
3. **emily.rodriguez@email.com** - Profile with dream, 3 circle members
4. **alex.thompson@email.com** - Profile with dream, echoes disabled
5. **jessica.kim@email.com** - New user, minimal data

### Testing Scenarios:

**Dashboard Testing:**
- Login as any user to see personalized dashboard
- Check circle connection stats  
- View recent echoes
- Navigate between screens

**Daily Ping Testing:**
- Use users with complete circles (Sarah, Mike, Emily)
- Test check-in flow with different relationship types
- Test note-taking functionality
- Verify completion celebrations

**Admin Analytics Testing:**
- Login as admin user
- Verify all metrics display correctly
- Test date filtering on charts
- Check user activity tables
- Test refresh functionality

## Data Validation

The seed data includes:
- **6 users** with varying completion levels
- **16 relationships** across different types  
- **12 check-ins** with recent timestamps
- **10 echoes** showing the self-trust building feature
- **25+ analytics events** for comprehensive admin dashboard testing

## Expected User Behaviors

1. **Sarah** (Most active): Recent check-ins, complete profile, active echoes
2. **Mike** (Tech entrepreneur): Complete setup, regular engagement
3. **Emily** (Freelancer): Moderate activity, growing circle
4. **Alex** (Writer): Echoes disabled, focused on specific relationships
5. **Jessica** (New user): Minimal data, good for testing onboarding flows
6. **Admin** (System user): Access to all analytics and admin features

This seed data provides realistic scenarios for testing all major features while maintaining data relationships and realistic user engagement patterns.