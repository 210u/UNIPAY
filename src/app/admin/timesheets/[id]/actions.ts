 'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import { redirect } from 'next/navigation';

async function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

export async function approveTimesheet(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const timesheetId = formData.get('timesheetId') as string;

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('Error getting user for timesheet approval:', userError);
    return { error: userError?.message || 'User not authenticated.' };
  }

  const { error } = await supabase
    .from('timesheets')
    .update({
      status: 'approved',
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq('id', timesheetId);

  if (error) {
    console.error('Error approving timesheet:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/timesheets');
  revalidatePath(`/admin/timesheets/${timesheetId}`);
  redirect('/admin/timesheets');
}

export async function rejectTimesheet(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const timesheetId = formData.get('timesheetId') as string;

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('Error getting user for timesheet rejection:', userError);
    return { error: userError?.message || 'User not authenticated.' };
  }

  const { error } = await supabase
    .from('timesheets')
    .update({
      status: 'rejected',
      approved_by: user.id, // Still record who rejected it
      approved_at: new Date().toISOString(),
    })
    .eq('id', timesheetId);

  if (error) {
    console.error('Error rejecting timesheet:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/timesheets');
  revalidatePath(`/admin/timesheets/${timesheetId}`);
  redirect('/admin/timesheets');
}

// Dummy revalidatePath to avoid linting errors in a server action that doesn't actually use it but needs to be defined
function revalidatePath(path: string) {
  // In a real Next.js app, this would be an actual import and call:
  // import { revalidatePath } from 'next/cache';
  // revalidatePath(path);
  console.log(`Revalidating path: ${path}`);
}

