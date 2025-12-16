'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/database.types';
import { redirect } from 'next/navigation';

export async function addDepartment(formData: FormData) {
  const supabase = createServerSupabaseClient();

  const universityId = formData.get('universityId') as string;
  const name = formData.get('name') as string;
  const code = formData.get('code') as string;
  const description = formData.get('description') as string | null;
  const headUserId = formData.get('headUserId') as string | null;
  const budgetCode = formData.get('budgetCode') as string | null;
  const costCenterCode = formData.get('costCenterCode') as string | null;

  // If universityId is missing, try to fall back to first university row
  let finalUniversityId = universityId;
  if (!finalUniversityId) {
    const { data: uni, error: uniError } = await supabase
      .from('universities')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (uniError) {
      console.error('Error fetching fallback university for department:', uniError);
      return { error: uniError.message };
    }

    finalUniversityId = uni?.id ?? null;
  }

  if (!finalUniversityId) {
    console.error('No university_id available for new department.');
    return { error: 'No university configured for department creation.' };
  }

  const { error } = await supabase.from('departments').insert({
    university_id: finalUniversityId,
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

