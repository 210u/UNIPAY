 'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import { redirect } from 'next/navigation';

export async function updateEmployeeAssignment(formData: FormData) {
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
  const employeeId = formData.get('employeeId') as string;
  const jobPositionId = formData.get('jobPositionId') as string;
  const departmentId = formData.get('departmentId') as string;
  const assignmentNumber = formData.get('assignmentNumber') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string | null;
  const payRateType = formData.get('payRateType') as Database['public']['Enums']['pay_rate_type'];
  const hourlyRate = formData.get('hourlyRate') ? parseFloat(formData.get('hourlyRate') as string) : null;
  const salaryAmount = formData.get('salaryAmount') ? parseFloat(formData.get('salaryAmount') as string) : null;
  const stipendAmount = formData.get('stipendAmount') ? parseFloat(formData.get('stipendAmount') as string) : null;
  const maxHoursPerWeek = formData.get('maxHoursPerWeek') ? parseFloat(formData.get('maxHoursPerWeek') as string) : null;
  const maxHoursPerPayPeriod = formData.get('maxHoursPerPayPeriod') ? parseFloat(formData.get('maxHoursPerPayPeriod') as string) : null;
  const isApproved = formData.get('isApproved') === 'true';
  const isActive = formData.get('isActive') === 'true';
  const notes = formData.get('notes') as string | null;

  const { error } = await supabase
    .from('employee_assignments')
    .update({
      employee_id: employeeId,
      job_position_id: jobPositionId,
      department_id: departmentId,
      assignment_number: assignmentNumber,
      pay_rate_type: payRateType,
      hourly_rate: hourlyRate,
      salary_amount: salaryAmount,
      stipend_amount: stipendAmount,
      max_hours_per_week: maxHoursPerWeek,
      max_hours_per_pay_period: maxHoursPerPayPeriod,
      start_date: startDate,
      end_date: endDate,
      is_approved: isApproved,
      is_active: isActive,
      notes,
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating employee assignment:', error);
    return { error: error.message };
  }

  redirect('/admin/employee-assignments');
}

