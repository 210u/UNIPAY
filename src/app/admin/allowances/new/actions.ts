 'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import { redirect } from 'next/navigation';

export async function addAllowanceConfig(formData: FormData) {
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
  const allowanceType = formData.get('allowanceType') as Database['public']['Enums']['allowance_type'];
  const description = formData.get('description') as string | null;
  const calculationMethod = formData.get('calculationMethod') as Database['public']['Enums']['allowance_calculation_method'];
  const defaultAmount = formData.get('defaultAmount') ? parseFloat(formData.get('defaultAmount') as string) : null;
  const defaultPercentage = formData.get('defaultPercentage') ? parseFloat(formData.get('defaultPercentage') as string) : null;
  const frequency = formData.get('frequency') as Database['public']['Enums']['allowance_frequency'];
  const isTaxable = formData.get('isTaxable') === 'true';
  const isActive = formData.get('isActive') === 'true';

  const { error } = await supabase.from('allowance_configs').insert({
    university_id: universityId,
    name,
    code,
    allowance_type: allowanceType,
    description,
    calculation_method: calculationMethod,
    default_amount: defaultAmount,
    default_percentage: defaultPercentage,
    frequency,
    is_taxable: isTaxable,
    is_active: isActive,
  });

  if (error) {
    console.error('Error adding allowance configuration:', error);
    return { error: error.message };
  }

  redirect('/admin/allowances');
}

