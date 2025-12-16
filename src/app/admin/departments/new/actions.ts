'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/database.types';
import { DEFAULT_UNIVERSITY_ID } from '@/lib/university';
import { redirect } from 'next/navigation';

export async function addDepartment(formData: FormData) {
  const supabase = createServerSupabaseClient();

  const universityId = (formData.get('universityId') as string) || DEFAULT_UNIVERSITY_ID;
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

