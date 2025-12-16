 'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
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
}

export async function updateEmployeeProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const userId = formData.get('userId') as string;
  const employeeId = formData.get('employeeId') as string;

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const middleName = formData.get('middleName') as string | null;
  // Email is disabled and not updated via this form, so we don't retrieve it.
  const phoneNumber = formData.get('phoneNumber') as string | null;
  const dateOfBirth = formData.get('dateOfBirth') as string | null;
  const addressLine1 = formData.get('addressLine1') as string | null;
  const addressLine2 = formData.get('addressLine2') as string | null;
  const city = formData.get('city') as string | null;
  const stateProvince = formData.get('stateProvince') as string | null;
  const country = formData.get('country') as string | null;
  const postalCode = formData.get('postalCode') as string | null;

  const taxId = formData.get('taxId') as string | null;

  // 1. Update user_profile entry
  const { error: userProfileError } = await supabase
    .from('user_profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      middle_name: middleName,
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

  // 2. Update employees table (only tax_id is editable from here)
  if (employeeId) {
    const { error: employeeError } = await supabase
      .from('employees')
      .update({
        tax_id: taxId,
      })
      .eq('id', employeeId);

    if (employeeError) {
      console.error('Error updating employee:', employeeError);
      return { error: employeeError.message };
    }
  }

  revalidatePath('/dashboard/profile');
  redirect('/dashboard/profile');
}

