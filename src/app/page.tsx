import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';

export default async function Home() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in, check their role and redirect accordingly
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Redirect admins to admin dashboard, employees to employee dashboard
    if (profile?.role && ['university_admin', 'system_admin', 'hr_staff', 'payroll_officer'].includes(profile.role)) {
      redirect('/admin/employees');
    } else {
      redirect('/dashboard');
    }
  }

  // If not logged in, redirect to signin
  redirect('/signin');
}
