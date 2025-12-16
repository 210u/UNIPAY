 'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import { redirect } from 'next/navigation';

export async function updateJobPosition(formData: FormData) {
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
  const title = formData.get('title') as string;
  const code = formData.get('code') as string;
  const description = formData.get('description') as string | null;
  const departmentId = formData.get('departmentId') as string | null;
  const payRateType = formData.get('payRateType') as Database['public']['Enums']['pay_rate_type'];
  const defaultHourlyRate = formData.get('defaultHourlyRate') ? parseFloat(formData.get('defaultHourlyRate') as string) : null;
  const defaultSalary = formData.get('defaultSalary') ? parseFloat(formData.get('defaultSalary') as string) : null;
  const stipendAmount = formData.get('stipendAmount') ? parseFloat(formData.get('stipendAmount') as string) : null;
  const maxHoursPerWeek = formData.get('maxHoursPerWeek') ? parseFloat(formData.get('maxHoursPerWeek') as string) : null;
  const maxHoursPerPayPeriod = formData.get('maxHoursPerPayPeriod') ? parseFloat(formData.get('maxHoursPerPayPeriod') as string) : null;
  const requiresApproval = formData.get('requiresApproval') === 'true';
  const minGpa = formData.get('minGpa') ? parseFloat(formData.get('minGpa') as string) : null;
  const status = formData.get('status') as Database['public']['Enums']['position_status'];

  const { error } = await supabase
    .from('job_positions')
    .update({
      title,
      code,
      description,
      department_id: departmentId || null,
      pay_rate_type: payRateType,
      default_hourly_rate: defaultHourlyRate,
      default_salary: defaultSalary,
      stipend_amount: stipendAmount,
      max_hours_per_week: maxHoursPerWeek,
      max_hours_per_pay_period: maxHoursPerPayPeriod,
      requires_approval: requiresApproval,
      min_gpa: minGpa,
      status,
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating job position:', error);
    return { error: error.message };
  }

  redirect('/admin/job-positions');
}

