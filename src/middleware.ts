import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Database } from './lib/supabase/database.types';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log('🔵 MIDDLEWARE:', {
    path: req.nextUrl.pathname,
    hasUser: !!user,
    userId: user?.id,
  });

  // If user is not signed in and the current path is not /signin, /signup, or /forgot-password,
  // redirect the user to /signin
  if (!user && !['/signin', '/signup', '/forgot-password'].includes(req.nextUrl.pathname)) {
    console.log('❌ MIDDLEWARE: No user, redirecting to /signin');
    return NextResponse.redirect(new URL('/signin', req.url));
  }

  // If no user, skip role check
  if (!user) {
    console.log('✅ MIDDLEWARE: No user, allowing access to', req.nextUrl.pathname);
    return res;
  }

  // Get user profile to check role for redirects
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  console.log('🔵 MIDDLEWARE: Profile role:', profile?.role);

  const isAdmin = profile?.role && ['university_admin', 'system_admin', 'hr_staff', 'payroll_officer', 'department_head'].includes(profile.role);

  // If user is signed in and trying to access auth pages, redirect based on role
  if (user && ['/signin', '/signup', '/forgot-password'].includes(req.nextUrl.pathname)) {
    console.log('✅ MIDDLEWARE: Has user on auth page, checking role...');
    
    // Redirect admins to admin dashboard, others to employee dashboard
    if (isAdmin) {
      console.log('✅ MIDDLEWARE: Admin user, redirecting to /admin/employees');
      return NextResponse.redirect(new URL('/admin/employees', req.url));
    } else {
      console.log('✅ MIDDLEWARE: Regular user, redirecting to /dashboard');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Redirect admins trying to access /dashboard to admin panel
  if (user && isAdmin && req.nextUrl.pathname === '/dashboard') {
    console.log('✅ MIDDLEWARE: Admin accessing /dashboard, redirecting to /admin/employees');
    return NextResponse.redirect(new URL('/admin/employees', req.url));
  }

  // Redirect non-admins trying to access /admin pages
  if (user && !isAdmin && req.nextUrl.pathname.startsWith('/admin')) {
    console.log('❌ MIDDLEWARE: Non-admin trying to access /admin, redirecting to /dashboard');
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  console.log('✅ MIDDLEWARE: Allowing access to', req.nextUrl.pathname);
  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

