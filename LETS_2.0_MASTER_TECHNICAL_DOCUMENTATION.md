# 📘 LETS 2.0 - MASTER TECHNICAL DOCUMENTATION
**Version:** 2.0.2 (Stable Release Candidate)
**Date:** November 29, 2025
**Scope:** Architecture, Database, Codebase, and Deployment Rules.

---

## 1. 🏗️ SYSTEM ARCHITECTURE & STACK

### Core Technologies
*   **Framework:** Next.js 14.2 (App Router, Strict TypeScript).
*   **Styling:** Tailwind CSS + Shadcn/UI + Lucide React.
*   **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage).
*   **State Management:**
    *   **Server State:** TanStack Query v5 (Caching, Optimistic Updates).
    *   **Form State:** React Hook Form + Zod Validation.
*   **Maps:** React-Leaflet (Client-side only).

### Directory Structure (Domain-Driven)
```bash
/app
  /admin          # Admin Panel (Protected, Grey Theme)
    /trips        # Trip Management (CRUD)
    layout.tsx    # Forces "Admin Theme" reset
  /dashboard      # Client Dashboard (Protected, Luxury Theme)
  /itinerary      # Client Itinerary View
  /login          # Auth Pages
  /api            # Server-side route handlers (if needed)
/components
  /ui             # Shadcn primitive components
  /features       # Domain-specific components (e.g., /itinerary/TimelineItem.tsx)
  /layout         # Global layout components (ConciergeRing, Sidebar)
/lib
  /supabase       # Client & Server connection utilities
/hooks            # Custom React Hooks (useItinerary, useToast)
```

---

## 2. 🎨 DESIGN SYSTEM & THEMING RULES

### Typography (Hybrid System)
Defined in `app/layout.tsx` and `tailwind.config.ts`.
*   **Headings:** `Playfair Display` (Serif). Usage: `font-heading`.
*   **Body:** `Inter` (Sans-Serif). Usage: `font-body`.

### Dual Theming Strategy (Critical)
The application runs two distinct visual themes based on the route.

**1. Client Theme (Luxury Atmosphere)**
*   **Base:** Cream (`#F5EFE6`).
*   **Accents:** Forest Green (`#1B4734`), Gold (`#C9A24E`).
*   **Feel:** Boutique hotel, organic, warm.

**2. Admin Theme (Operational Efficiency)**
*   **Base:** Slate Gray (`#F8FAFC`).
*   **Sidebar:** Dark Slate (`#0F172A`).
*   **Feel:** SaaS, clean, high-contrast, data-dense.
*   **Implementation:** `app/admin/layout.tsx` enforces this via a wrapper:
    ```tsx
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-900">...</div>
    ```

---

## 3. 🗄️ DATABASE SCHEMA (SUPABASE SQL)

### A. Users Table (Extends Auth)
```sql
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  full_name TEXT,
  username TEXT UNIQUE, -- e.g., JohnDoeUS123
  internal_code TEXT,   -- e.g., LTS-A9B8C7
  country_code TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### B. Trips Table
```sql
CREATE TABLE public.trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### C. Itinerary Items Table (The Core)
```sql
CREATE TABLE public.itinerary_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,       -- Calculated day number (1, 2, 3...)
  day_date DATE,              -- Actual date string (2024-12-01) - ADDED FOR CORRELATION
  time TEXT NOT NULL,         -- HH:mm format
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('flight', 'hotel', 'activity', 'food', 'transport')),
  location TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 4. 🛡️ SECURITY & AUTHENTICATION FLOW

### Initialization Pattern
To prevent memory leaks and silent failures, the Supabase client is initialized using a safe pattern:

```typescript
// Pattern used in login/signup/dashboard
useEffect(() => {
  let isMounted = true;
  try {
    const client = createClient();
    if (isMounted) setSupabase(client);
  } catch (error) {
    if (isMounted) toast.error("Supabase config error");
  }
  return () => { isMounted = false; };
}, []);
```

### Role-Based Redirects
Located in `app/login/page.tsx` and `app/signup/page.tsx`.
1.  User authenticates via `supabase.auth.signInWithPassword`.
2.  System fetches `role` from `public.users`.
3.  **Logic:**
    ```typescript
    if (profile?.role === 'admin') router.push('/admin');
    else router.push('/dashboard');
    ```

---

## 5. 💻 KEY FUNCTIONALITIES & CODE SNIPPETS

### A. Admin Trip Creator (`/admin/trips/new`)
Uses native HTML `<select>` to avoid conflicts with React Hook Form found in previous iterations.

```tsx
<select
  value={clientId}
  onChange={(e) => setClientId(e.target.value)}
  className="..." // Tailwind classes
>
  {clients.map(c => <option value={c.id}>{c.full_name}</option>)}
</select>
```

### B. Itinerary Logic: Date to Day Calculation
Used in the Trip Editor to automatically assign the "Day Number" based on the selected date.

```typescript
function calculateDayNumber(dateString: string): number {
  const tripStart = new Date(trip.start_date);
  const selectedDate = new Date(dateString);
  // Normalize time to midnight to compare dates only
  tripStart.setHours(0,0,0,0);
  selectedDate.setHours(0,0,0,0);
  
  const diffTime = selectedDate.getTime() - tripStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Day 1 is start date
}
```

### C. Safe Data Fetching (Preventing Infinite Loops)
In `app/dashboard/page.tsx`, we validate the user ID before querying to prevent bad requests.

```typescript
async function fetchUserTrip(client, userId) {
  if (!userId) return; // Guard clause
  
  const { data, error } = await client
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  // Handle 'PGRST116' (No rows found) gracefully
}
```

---

## 6. 🐛 KNOWN ISSUES & FIXES (War Log)

1.  **Shadcn Select vs. Forms:**
    *   *Issue:* Shadcn's Select component was returning `undefined` in Admin forms.
    *   *Fix:* Replaced with native `<select>` for critical Admin inputs.

2.  **Date/Day Correlation:**
    *   *Issue:* Server rejected inserts missing the `day` column.
    *   *Fix:* Payload now includes BOTH `day` (integer) and `day_date` (string) to ensure frontend-backend alignment.

3.  **Memory Leaks:**
    *   *Issue:* `useEffect` hooks updating state after component unmount.
    *   *Fix:* Implemented `isMounted` flags and cleanup functions in all data-fetching hooks.

4.  **Mock Data:**
    *   *Status:* **ELIMINATED.** All references to `getMockItinerary` have been purged. The system now fails gracefully (empty state) rather than showing fake data.

---

## 7. 🚀 ROADMAP & NEXT STEPS

### Immediate Priorities
1.  **Edit Activity:** Add functionality to edit an existing itinerary item (currently only Create/Delete exists).
2.  **Documents Module:** Implement Supabase Storage for PDF uploads (Vouchers, Tickets).
3.  **Admin Clients:** Build the `/admin/clients` page for full user management.

### Future
1.  **Realtime Chat:** Connect the Concierge Ring to a real messaging backend.
2.  **Push Notifications:** For trip updates.

---

**Generated by LETS 2.0 AI Architect**

