# Trip Management Setup Guide

## Overview

The Trip Management system has been implemented with the following features:

1. **Derived Status Logic**: Trips automatically get a status based on dates:
   - **Active**: `startDate <= today <= endDate`
   - **Starting Soon**: `today == (startDate - 1 day)`
   - **Upcoming**: `today < (startDate - 1 day)`
   - **Completed**: `today > endDate`

2. **Smart Sorting**: Trips are sorted by status priority:
   1. Active (highest priority)
   2. Starting Soon
   3. Upcoming
   4. Completed (lowest priority, visually faded)

3. **OPEN Templates**: Trips can be assigned to "OPEN" to create reusable templates
4. **Duplicate Feature**: Trips can be duplicated with all itinerary items

## Database Setup for "OPEN" Feature

Since the `trips` table requires `user_id` to be NOT NULL, you need to create a special "OPEN" user in your database:

### Option 1: Create an "OPEN" User (Recommended)

Run this SQL in your Supabase SQL Editor:

```sql
-- Create a special "OPEN" user for templates
-- This user should exist in auth.users first, then in public.users

-- Step 1: Create auth user (if using Supabase Auth)
-- Note: You may need to create this through the Supabase dashboard or use the admin API
-- For now, we'll use a special UUID that represents "OPEN"

-- Step 2: Insert into public.users table
INSERT INTO public.users (id, email, full_name, username, country_code, internal_code, role)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'open@lets.com',
  'OPEN (Template)',
  'open_template',
  'US',
  'OPEN-001',
  'staff'
)
ON CONFLICT (id) DO NOTHING;
```

### Option 2: Modify Schema to Allow NULL (Alternative)

If you prefer to allow NULL for templates, modify the schema:

```sql
-- Modify trips table to allow NULL user_id for templates
ALTER TABLE public.trips 
ALTER COLUMN user_id DROP NOT NULL;

-- Update the code to check for NULL instead of the special UUID
```

**Note**: If you choose Option 2, update the constant in `app/admin/trips/page.tsx`:
```typescript
// Change from:
const OPEN_CLIENT_ID = "00000000-0000-0000-0000-000000000000";

// To checking for null:
// In the code, check: trip.user_id === null
```

## Features Implemented

### 1. Status Calculation
- Automatically calculates trip status based on current date
- No manual status updates needed for date-based statuses

### 2. Sorting
- Trips are automatically sorted by status priority
- Within the same status, sorted by start date (most recent first)

### 3. OPEN Templates
- Select "OPEN (Template)" when creating a trip
- These trips appear in the "Defaults" tab
- They don't appear in the main "Trips" list
- Perfect for reusable trip templates

### 4. Duplicate Feature
- Click "Duplicate" button on any trip card
- Creates a new trip with:
  - All itinerary items copied
  - Title appended with " (Copy)"
  - Client field cleared (must be selected)
  - Dates preserved (but can be changed)
  - Status set to "draft"
  - All items marked as not completed

### 5. Visual Indicators
- Completed trips are shown with reduced opacity (60%)
- Status badges with color coding:
  - Active: Green
  - Starting Soon: Yellow
  - Upcoming: Blue
  - Completed: Gray (faded)

## Usage

### Creating a Template (OPEN Trip)
1. Go to "Trips Manager" → "Create New Trip"
2. Select "OPEN (Template)" from the client dropdown
3. Fill in trip details and itinerary
4. Save - it will appear in the "Defaults" tab

### Creating a Regular Trip
1. Go to "Trips Manager" → "Create New Trip"
2. Select a client from the dropdown
3. Fill in trip details
4. Save - it will appear in the "Trips" tab, sorted by status

### Duplicating a Trip
1. Find the trip in the list
2. Click the "Duplicate" button (purple icon)
3. You'll be redirected to edit the new trip
4. Assign a client and adjust dates as needed
5. Save

## Code Structure

### Main Files
- `app/admin/trips/page.tsx`: Main trips list with tabs and sorting logic
- `app/admin/trips/new/page.tsx`: Trip creation form (includes OPEN option)
- `app/admin/trips/[tripId]/page.tsx`: Trip editor (can be updated to support OPEN)

### Key Functions
- `calculateDerivedStatus()`: Calculates status from dates
- `getStatusPriority()`: Returns priority number for sorting
- `sortTripsByStatus()`: Sorts trips by status priority
- `handleDuplicate()`: Duplicates trip with all items

## Notes

- The "OPEN" feature requires either:
  - A special user with UUID `00000000-0000-0000-0000-000000000000` in the database, OR
  - Modified schema to allow NULL `user_id`
- Completed trips are visually distinct but still fully functional
- Status is recalculated on every render based on current date
- Duplicate preserves all itinerary items but resets completion status





