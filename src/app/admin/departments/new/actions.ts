 'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import { redirect } from 'next/navigation';

export async function addDepartment(formData: FormData) {
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
  const description = formData.get('description') as string | null;
  const headUserId = formData.get('headUserId') as string | null;
  const budgetCode = formData.get('budgetCode') as string | null;
  const costCenterCode = formData.get('costCenterCode') as string | null;

  const { error } = await supabase.from('departments').insert({
    university_id: universityId,
    name,
    code,
    description,
    head_user_id: headUserId || null,
    budget_code: budgetCode || null,
    cost_center_code: costCenterCode || null,
  });

  if (error) {
    console.error('Error adding department:', error);
    return { error: error.message };
  }

  redirect('/admin/departments');
}

