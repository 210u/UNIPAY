 'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import { redirect } from 'next/navigation';

export async function createPayrollRun(formData: FormData) {
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

  const universityId = formData.get('universityId') as string;
  const payrollPeriodId = formData.get('payrollPeriodId') as string;
  const runNumber = formData.get('runNumber') as string;
  const runDate = formData.get('runDate') as string;
  const ranBy = formData.get('ranBy') as string;
  const notes = formData.get('notes') as string | null;

  // Initial status and counts
  const status = 'pending';
  const totalEmployeesProcessed = 0;
  const totalGrossPay = 0;
  const totalNetPay = 0;
  const totalDeductions = 0;
  const totalAllowances = 0;

  const { error } = await supabase.from('payroll_runs').insert({
    university_id: universityId,
    payroll_period_id: payrollPeriodId,
    run_number: runNumber,
    run_date: runDate,
    status,
    total_employees_processed: totalEmployeesProcessed,
    total_gross_pay: totalGrossPay,
    total_net_pay: totalNetPay,
    total_deductions: totalDeductions,
    total_allowances: totalAllowances,
    ran_by: ranBy,
    notes,
  });

  if (error) {
    console.error('Error creating payroll run:', error);
    return { error: error.message };
  }

  redirect('/admin/payroll-runs');
}

