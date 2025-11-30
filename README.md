# LETS 2.0 - Luxury Travel Companion

Progressive Web App (PWA) for luxury travel management built with Next.js 14, TypeScript, and a high-end Design System. Installable on iOS and Android devices.

## 🏗️ Architecture

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **Icons**: Lucide React
- **Backend**: Supabase (@supabase/ssr)
- **Server State**: TanStack Query v5
- **Client State**: Zustand
- **PWA**: Fully installable Progressive Web App

## 🎨 Design System

### Typography
- **Headings**: Playfair Display (Serif) - Luxury & Tradition
- **Body**: Inter (Sans) - Modern & Legible

### Color Palette
- **Primary**: `#1B4734` (Forest Green) - Trust
- **Accent/Luxury**: `#C9A24E` (Gold) - Status
- **Background Day**: `#F5EFE6` (Cream) - Warmth
- **Background Night**: `#0F2A21` (Deep Forest) - Elegance
- **Error**: `#B91C1C` (Red) - Subtle

## 📁 Project Structure

```
/app              # Next.js App Router
/components
  /ui             # Shadcn/UI primitives
  /features       # Business modules (trips, tracking, concierge)
  /layout         # Navbar, Sidebar, ConciergeRing
/lib              # Utilities, Supabase clients
/hooks            # Custom React hooks
/types            # TypeScript definitions
```

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Create .env.local file with your Supabase credentials
# Required variables:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Initialize Shadcn/UI (optional):
```bash
npx shadcn-ui@latest init
```

4. Run development server:
```bash
npm run dev
```

## 📱 Progressive Web App (PWA)

LETS is a fully installable PWA. To complete the setup:

1. **Create PWA Icons**: Add icon files to `public/icons/`:
   - `icon-192.png` (192x192 pixels)
   - `icon-512.png` (512x512 pixels)
   - See `public/icons/README.md` for detailed instructions

2. **Install on Device**:
   - **Android**: Open in Chrome → Menu → "Add to Home Screen"
   - **iOS**: Open in Safari → Share → "Add to Home Screen"

3. **PWA Features**:
   - Standalone app mode (no browser UI)
   - Offline-ready architecture
   - App shortcuts (Dashboard, Messages)
   - Custom theme colors

## 📝 Next Steps

- Initialize Shadcn/UI components as needed
- Configure Supabase tables and authentication
- Implement feature modules in `/components/features`
- Add custom hooks in `/hooks`
- Define TypeScript types in `/types`
- Add PWA icons to `public/icons/`

