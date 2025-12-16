 'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import { redirect } from 'next/navigation';

export async function addEmployeeAdvance(formData: FormData) {
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

  const employeeId = formData.get('employeeId') as string;
  const advanceNumber = formData.get('advanceNumber') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const reason = formData.get('reason') as string;
  const repaymentStartDate = formData.get('repaymentStartDate') as string;
  const repaymentAmountPerPeriod = parseFloat(formData.get('repaymentAmountPerPeriod') as string);
  const approvedBy = formData.get('approvedBy') as string | null;
  const approvedAt = formData.get('approvedAt') as string | null;
  const paidAt = formData.get('paidAt') as string | null;
  const paidBy = formData.get('paidBy') as string | null;
  const paymentReference = formData.get('paymentReference') as string | null;
  const notes = formData.get('notes') as string | null;

  // Calculate initial balance remaining
  const balanceRemaining = amount;

  const { error } = await supabase.from('employee_advances').insert({
    employee_id: employeeId,
    advance_number: advanceNumber,
    amount,
    reason,
    repayment_start_date: repaymentStartDate,
    repayment_amount_per_period: repaymentAmountPerPeriod,
    balance_remaining: balanceRemaining,
    is_fully_repaid: false, // Initially false
    approved_by: approvedBy || null,
    approved_at: approvedAt,
    paid_at: paidAt,
    paid_by: paidBy || null,
    payment_reference: paymentReference,
    notes,
  });

  if (error) {
    console.error('Error adding employee advance:', error);
    return { error: error.message };
  }

  redirect('/admin/employee-advances');
}

