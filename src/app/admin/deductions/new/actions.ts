 'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import { redirect } from 'next/navigation';

export async function addDeductionConfig(formData: FormData) {
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
  const name = formData.get('name') as string;
  const code = formData.get('code') as string;
  const deductionType = formData.get('deductionType') as Database['public']['Enums']['deduction_type'];
  const description = formData.get('description') as string | null;
  const calculationMethod = formData.get('calculationMethod') as Database['public']['Enums']['deduction_calculation_method'];
  const fixedAmount = formData.get('fixedAmount') ? parseFloat(formData.get('fixedAmount') as string) : null;
  const percentage = formData.get('percentage') ? parseFloat(formData.get('percentage') as string) : null;
  const minAmount = formData.get('minAmount') ? parseFloat(formData.get('minAmount') as string) : null;
  const maxAmount = formData.get('maxAmount') ? parseFloat(formData.get('maxAmount') as string) : null;
  const annualMaxAmount = formData.get('annualMaxAmount') ? parseFloat(formData.get('annualMaxAmount') as string) : null;
  const employerContributionPercentage = formData.get('employerContributionPercentage') ? parseFloat(formData.get('employerContributionPercentage') as string) : null;
  const employerContributionFixed = formData.get('employerContributionFixed') ? parseFloat(formData.get('employerContributionFixed') as string) : null;
  const isMandatory = formData.get('isMandatory') === 'true';
  const isActive = formData.get('isActive') === 'true';

  const { error } = await supabase.from('deduction_configs').insert({
    university_id: universityId,
    name,
    code,
    deduction_type: deductionType,
    description,
    calculation_method: calculationMethod,
    fixed_amount: fixedAmount,
    percentage: percentage,
    min_amount: minAmount,
    max_amount: maxAmount,
    annual_max_amount: annualMaxAmount,
    employer_contribution_percentage: employerContributionPercentage,
    employer_contribution_fixed: employerContributionFixed,
    is_mandatory: isMandatory,
    is_active: isActive,
  });

  if (error) {
    console.error('Error adding deduction configuration:', error);
    return { error: error.message };
  }

  redirect('/admin/deductions');
}

