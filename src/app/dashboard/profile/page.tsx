import React from 'react';
import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import DashboardCard from '@/components/common/DashboardCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Label from '@/components/ui/Label';
import { Save } from 'lucide-react';
import Select from '@/components/ui/Select';
import { updateEmployeeProfile } from './actions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Profile | University Payroll System',
  description: 'Manage your personal and employment details',
};

type EmployeeProfile = Database['public']['Tables']['user_profiles']['Row'] & {
  employees: (Database['public']['Tables']['employees']['Row'] & {
    departments: Database['public']['Tables']['departments']['Row'] | null;
  }) | null;
};

async function getEmployeeProfile(userId: string): Promise<EmployeeProfile | null> {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data, error } = await supabase
    .from('user_profiles')
    .select(
      `
        *,
        employees(*, departments(name))
      `
    )
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching employee profile:', error);
    return null;
  }

  return data;
}

export default async function EmployeeProfilePage() {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/signin');
  }

  const profile = await getEmployeeProfile(user.id);

  if (!profile) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="text-textSecondary">Your employee profile could not be loaded.</p>
      </div>
    );
  }

  const employee = profile.employees;

  return (
    <div className="space-y-8">
      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">My Profile</h1>

        <form className="space-y-6" action={updateEmployeeProfile}>
          <input type="hidden" name="userId" value={profile.id} />
          <input type="hidden" name="employeeId" value={employee?.id || ''} />

          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" type="text" placeholder="John" required defaultValue={profile.first_name || ''} />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" type="text" placeholder="Doe" required defaultValue={profile.last_name || ''} />
            </div>
            <div>
              <Label htmlFor="middleName">Middle Name (Optional)</Label>
              <Input id="middleName" name="middleName" type="text" placeholder="A." defaultValue={profile.middle_name || ''} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required defaultValue={profile.email || ''} disabled />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input id="phoneNumber" name="phoneNumber" type="tel" placeholder="+1 (555) 123-4567" defaultValue={profile.phone_number || ''} />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={profile.date_of_birth || ''} />
            </div>
            <div>
              <Label htmlFor="addressLine1">Address Line 1 (Optional)</Label>
              <Input id="addressLine1" name="addressLine1" type="text" placeholder="123 Main St" defaultValue={profile.address_line1 || ''} />
            </div>
            <div>
              <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
              <Input id="addressLine2" name="addressLine2" type="text" placeholder="Apt 4B" defaultValue={profile.address_line2 || ''} />
            </div>
            <div>
              <Label htmlFor="city">City (Optional)</Label>
              <Input id="city" name="city" type="text" placeholder="Anytown" defaultValue={profile.city || ''} />
            </div>
            <div>
              <Label htmlFor="stateProvince">State/Province (Optional)</Label>
              <Input id="stateProvince" name="stateProvince" type="text" placeholder="CA" defaultValue={profile.state_province || ''} />
            </div>
            <div>
              <Label htmlFor="country">Country (Optional)</Label>
              <Input id="country" name="country" type="text" placeholder="USA" defaultValue={profile.country || ''} />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code (Optional)</Label>
              <Input id="postalCode" name="postalCode" type="text" placeholder="90210" defaultValue={profile.postal_code || ''} />
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4 mt-8">Employment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeNumber">Employee Number</Label>
              <Input id="employeeNumber" name="employeeNumber" type="text" required defaultValue={employee?.employee_number || ''} disabled />
            </div>
            <div>
              <Label htmlFor="hireDate">Hire Date</Label>
              <Input id="hireDate" name="hireDate" type="date" required defaultValue={employee?.hire_date || ''} disabled />
            </div>
            <div>
              <Label htmlFor="employmentStatus">Employment Status</Label>
              <Input id="employmentStatus" name="employmentStatus" type="text" required defaultValue={employee?.employment_status || ''} disabled />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" type="text" required defaultValue={employee?.departments?.name || ''} disabled />
            </div>
            <div>
              <Label htmlFor="taxId">Tax ID (Optional)</Label>
              <Input id="taxId" name="taxId" type="text" placeholder="XXX-XX-XXXX" defaultValue={employee?.tax_id || ''} />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        </form>
      </DashboardCard>
    </div>
  );
}

