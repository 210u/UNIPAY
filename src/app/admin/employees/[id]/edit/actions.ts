 'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import { redirect } from 'next/navigation';

export async function updateEmployee(formData: FormData) {
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
  const userId = formData.get('userId') as string;

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const middleName = formData.get('middleName') as string | null;
  const email = formData.get('email') as string;
  const phoneNumber = formData.get('phoneNumber') as string | null;
  const dateOfBirth = formData.get('dateOfBirth') as string | null;
  const addressLine1 = formData.get('addressLine1') as string | null;
  const addressLine2 = formData.get('addressLine2') as string | null;
  const city = formData.get('city') as string | null;
  const stateProvince = formData.get('stateProvince') as string | null;
  const country = formData.get('country') as string | null;
  const postalCode = formData.get('postalCode') as string | null;

  const employeeNumber = formData.get('employeeNumber') as string;
  const hireDate = formData.get('hireDate') as string;
  const employeeType = formData.get('employeeType') as Database['public']['Enums']['employee_type'];
  const employmentStatus = formData.get('employmentStatus') as Database['public']['Enums']['employment_status'];
  const taxId = formData.get('taxId') as string | null;
  const departmentId = formData.get('departmentId') as string;
  const jobPositionId = formData.get('jobPositionId') as string;
  const payRateType = formData.get('payRateType') as Database['public']['Enums']['pay_rate_type'];
  const hourlyRate = formData.get('hourlyRate') ? parseFloat(formData.get('hourlyRate') as string) : null;
  const salaryAmount = formData.get('salaryAmount') ? parseFloat(formData.get('salaryAmount') as string) : null;

  // 1. Update user_profile entry
  const { error: userProfileError } = await supabase
    .from('user_profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      middle_name: middleName,
      email: email,
      phone_number: phoneNumber,
      date_of_birth: dateOfBirth,
      address_line1: addressLine1,
      address_line2: addressLine2,
      city: city,
      state_province: stateProvince,
      country: country,
      postal_code: postalCode,
    })
    .eq('id', userId);

  if (userProfileError) {
    console.error('Error updating user profile:', userProfileError);
    return { error: userProfileError.message };
  }

  // 2. Update employees table
  const { error: employeeError } = await supabase
    .from('employees')
    .update({
      department_id: departmentId,
      employee_number: employeeNumber,
      hire_date: hireDate,
      employee_type: employeeType,
      employment_status: employmentStatus,
      tax_id: taxId,
    })
    .eq('id', employeeId);

  if (employeeError) {
    console.error('Error updating employee:', employeeError);
    return { error: employeeError.message };
  }

  // 3. Update active employee_assignments table entry
  // For simplicity, we'll assume there's always one active assignment to update.
  // In a real-world scenario, you might want to handle multiple assignments, effective dates, etc.
  const { error: assignmentError } = await supabase
    .from('employee_assignments')
    .update({
      job_position_id: jobPositionId,
      department_id: departmentId,
      pay_rate_type: payRateType,
      hourly_rate: payRateType === 'hourly' ? hourlyRate : null,
      salary_amount: payRateType === 'salary' ? salaryAmount : null,
    })
    .eq('employee_id', employeeId)
    .eq('is_active', true);

  if (assignmentError) {
    console.error('Error updating employee assignment:', assignmentError);
    return { error: assignmentError.message };
  }

  redirect(`/admin/employees/${employeeId}`);
}

