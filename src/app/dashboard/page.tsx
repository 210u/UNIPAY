import React from 'react';
import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Employee Dashboard | University Payroll System',
  description: 'Employee personal dashboard',
};

async function getEmployeeData(userId: string) {
  const cookieStore = cookies();
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

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select(
      `
        *,
        employees(*,
          departments(name),
          universities(name)
        )
      `
    )
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Error fetching user profile for dashboard:', profileError);
    return { profile: null, employee: null };
  }

  // Assuming a 1-to-1 or 1-to-many relationship where we take the first employee record
  const employee = profile.employees ? profile.employees[0] : null;

  return { profile, employee };
}

export default async function DashboardPage() {
  const cookieStore = cookies();
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

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  const { profile, employee } = await getEmployeeData(user.id);

  return (
    <DashboardContent profile={profile} employee={employee} />
  );
}

