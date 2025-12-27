import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UserRole } from './types/database';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;

  // 1. Public Routes: login, etc.
  const isPublicRoute = path.startsWith('/login');

  if (!session && !isPublicRoute) {
    // Not logged in -> Login
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (session) {
    // 2. Role-Based Routing
    // We assume the role is stored in user_metadata or we fetch it from the 'users' table
    // For the purpose of this architecture, metadata is faster for middleware
    const role = session.user.user_metadata.role as UserRole;

    const rolePaths: Record<UserRole, string> = {
      guest_short: '/short-term/dashboard',
      guest_long: '/long-term/community',
      tribe: '/missions',
      staff_harmony: '/harmony/rooms',
      staff_regeneration: '/regeneration/tickets',
      admin_guardian: '/guardian/dashboard',
    };

    const targetPath = rolePaths[role];

    // Redirect to role-specific home if at root or login
    if (path === '/' || path === '/login') {
      return NextResponse.redirect(new URL(targetPath, req.url));
    }

    // 3. Security: Prevent cross-role access
    // This logic ensures e.g. a guest can't access /guardian/ dashboard
    const rolePrefixes: Record<UserRole, string[]> = {
      guest_short: ['/short-term'],
      guest_long: ['/long-term'],
      tribe: ['/missions'],
      staff_harmony: ['/harmony'],
      staff_regeneration: ['/regeneration'],
      admin_guardian: ['/guardian'],
    };

    const allowedPrefixes = rolePrefixes[role] || [];
    const isAccessingAllowed = allowedPrefixes.some(prefix => path.startsWith(prefix));

    // If logged in but trying to access a path not in their allowed prefixes
    // (and not at their target path already), redirect them back home.
    if (!isAccessingAllowed && !isPublicRoute && path !== '/') {
        return NextResponse.redirect(new URL(targetPath, req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};


