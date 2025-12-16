 'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import { redirect } from 'next/navigation';

export async function updateEmployeeDeduction(formData: FormData) {
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
  const deductionConfigId = formData.get('deductionConfigId') as string;
  const customAmount = formData.get('customAmount') ? parseFloat(formData.get('customAmount') as string) : null;
  const customPercentage = formData.get('customPercentage') ? parseFloat(formData.get('customPercentage') as string) : null;
  const effectiveFrom = formData.get('effectiveFrom') as string;
  const effectiveTo = formData.get('effectiveTo') as string | null;
  const isActive = formData.get('isActive') === 'true';
  const notes = formData.get('notes') as string | null;

  const { error } = await supabase
    .from('employee_deductions')
    .update({
      employee_id: employeeId,
      deduction_config_id: deductionConfigId,
      custom_amount: customAmount,
      custom_percentage: customPercentage,
      effective_from: effectiveFrom,
      effective_to: effectiveTo,
      is_active: isActive,
      notes,
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating employee deduction:', error);
    return { error: error.message };
  }

  redirect('/admin/employee-deductions');
}

