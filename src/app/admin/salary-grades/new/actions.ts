 'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import { redirect } from 'next/navigation';

export async function addSalaryGrade(formData: FormData) {
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
  const gradeName = formData.get('gradeName') as string;
  const gradeLevel = parseInt(formData.get('gradeLevel') as string);
  const description = formData.get('description') as string | null;
  const minSalary = parseFloat(formData.get('minSalary') as string);
  const midSalary = parseFloat(formData.get('midSalary') as string);
  const maxSalary = parseFloat(formData.get('maxSalary') as string);
  const minHourlyRate = formData.get('minHourlyRate') ? parseFloat(formData.get('minHourlyRate') as string) : null;
  const maxHourlyRate = formData.get('maxHourlyRate') ? parseFloat(formData.get('maxHourlyRate') as string) : null;
  const currency = formData.get('currency') as string;
  const isActive = formData.get('isActive') === 'true';

  const { error } = await supabase.from('salary_grades').insert({
    university_id: universityId,
    grade_name: gradeName,
    grade_level: gradeLevel,
    description: description || null,
    min_salary: minSalary,
    mid_salary: midSalary,
    max_salary: maxSalary,
    min_hourly_rate: minHourlyRate,
    max_hourly_rate: maxHourlyRate,
    currency,
    is_active: isActive,
  });

  if (error) {
    console.error('Error adding salary grade:', error);
    return { error: error.message };
  }

  redirect('/admin/salary-grades');
}

