import React from 'react';
import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import DashboardCard from '@/components/common/DashboardCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Label from '@/components/ui/Label';
import { ChevronLeft, Save } from 'lucide-react';
import Link from 'next/link';
import Select from '@/components/ui/Select';
import { addSalaryGrade } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Add New Salary Grade | University Payroll System',
  description: 'Add a new salary grade to the system',
};

async function getUniversityId(): Promise<string | null> {
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

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error('Error fetching user:', userError);
    return null;
  }

  if (!user) {
    console.warn('No user found to fetch university ID.');
    return null;
  }

  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .select('university_id')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching user profile:', profileError);
    return null;
  }

  return profileData?.university_id || null;
}

export default async function AddSalaryGradePage() {
  const universityId = await getUniversityId();

  return (
    <div className="space-y-8">
      <Link href="/admin/salary-grades">
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Salary Grades List
        </Button>
      </Link>

      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Add New Salary Grade</h1>

        <form className="space-y-6" action={addSalaryGrade}>
          <input type="hidden" name="universityId" value={universityId || ''} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gradeName">Grade Name</Label>
              <Input id="gradeName" name="gradeName" type="text" placeholder="Associate Professor" required />
            </div>
            <div>
              <Label htmlFor="gradeLevel">Grade Level</Label>
              <Input id="gradeLevel" name="gradeLevel" type="number" placeholder="5" required />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input id="description" name="description" type="text" placeholder="Salary grade for associate professors" />
            </div>
            <div>
              <Label htmlFor="minSalary">Minimum Salary</Label>
              <Input id="minSalary" name="minSalary" type="number" step="0.01" placeholder="60000.00" required />
            </div>
            <div>
              <Label htmlFor="midSalary">Midpoint Salary</Label>
              <Input id="midSalary" name="midSalary" type="number" step="0.01" placeholder="80000.00" required />
            </div>
            <div>
              <Label htmlFor="maxSalary">Maximum Salary</Label>
              <Input id="maxSalary" name="maxSalary" type="number" step="0.01" placeholder="100000.00" required />
            </div>
            <div>
              <Label htmlFor="minHourlyRate">Minimum Hourly Rate (Optional)</Label>
              <Input id="minHourlyRate" name="minHourlyRate" type="number" step="0.01" placeholder="30.00" />
            </div>
            <div>
              <Label htmlFor="maxHourlyRate">Maximum Hourly Rate (Optional)</Label>
              <Input id="maxHourlyRate" name="maxHourlyRate" type="number" step="0.01" placeholder="50.00" />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" name="currency" type="text" placeholder="USD" required defaultValue="USD" />
            </div>
            <div>
              <Label htmlFor="isActive">Is Active</Label>
              <Select id="isActive" name="isActive">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button type="button" variant="secondary" asChild>
              <Link href="/admin/salary-grades">
                Cancel
              </Link>
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" /> Add Salary Grade
            </Button>
          </div>
        </form>
      </DashboardCard>
    </div>
  );
}

