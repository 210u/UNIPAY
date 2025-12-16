 'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import { redirect } from 'next/navigation';

export async function updatePayrollPeriod(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
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

  const id = formData.get('id') as string;
  const periodName = formData.get('periodName') as string;
  const periodStartDate = formData.get('periodStartDate') as string;
  const periodEndDate = formData.get('periodEndDate') as string;
  const paymentDate = formData.get('paymentDate') as string;
  const frequency = formData.get('frequency') as Database['public']['Enums']['payroll_frequency'];
  const isClosed = formData.get('isClosed') === 'true';
  const closedAt = formData.get('closedAt') as string | null;
  const closedBy = formData.get('closedBy') as string | null;

  const { error } = await supabase
    .from('payroll_periods')
    .update({
      period_name: periodName,
      period_start_date: periodStartDate,
      period_end_date: periodEndDate,
      payment_date: paymentDate,
      frequency,
      is_closed: isClosed,
      closed_at: closedAt,
      closed_by: closedBy || null,
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating payroll period:', error);
    return { error: error.message };
  }

  redirect('/admin/payroll-periods');
}

