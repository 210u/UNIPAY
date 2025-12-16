import React, { useState } from 'react';
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
import { addJobPosition } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Add New Job Position | University Payroll System',
  description: 'Add a new job position to the system',
};

type Department = Database['public']['Tables']['departments']['Row'];

async function getDepartments(): Promise<Department[]> {
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

  const { data, error } = await supabase.from('departments').select('id, name').order('name', { ascending: true });

  if (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
  return data;
}

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

export default async function AddJobPositionPage() {
  const departments = await getDepartments();
  const universityId = await getUniversityId();
  const [payRateType, setPayRateType] = useState<Database['public']['Enums']['pay_rate_type']>('hourly');

  return (
    <div className="space-y-8">
      <Link href="/admin/job-positions">
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Job Positions List
        </Button>
      </Link>

      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Add New Job Position</h1>

        <form className="space-y-6" action={addJobPosition}>
          <input type="hidden" name="universityId" value={universityId || ''} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" name="title" type="text" placeholder="Teaching Assistant" required />
            </div>
            <div>
              <Label htmlFor="code">Job Code</Label>
              <Input id="code" name="code" type="text" placeholder="TA001" required />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input id="description" name="description" type="text" placeholder="Assists professors with teaching duties" />
            </div>
            <div>
              <Label htmlFor="departmentId">Department (Optional)</Label>
              <Select id="departmentId" name="departmentId">
                <option value="">Select a department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="payRateType">Pay Rate Type</Label>
              <Select id="payRateType" name="payRateType" value={payRateType} onChange={(e) => setPayRateType(e.target.value as Database['public']['Enums']['pay_rate_type'])} required>
                <option value="hourly">Hourly</option>
                <option value="salary">Salary</option>
                <option value="stipend">Stipend</option>
              </Select>
            </div>

            {payRateType === 'hourly' && (
              <div>
                <Label htmlFor="defaultHourlyRate">Default Hourly Rate</Label>
                <Input id="defaultHourlyRate" name="defaultHourlyRate" type="number" step="0.01" placeholder="20.00" required />
              </div>
            )}
            {payRateType === 'salary' && (
              <div>
                <Label htmlFor="defaultSalary">Default Salary</Label>
                <Input id="defaultSalary" name="defaultSalary" type="number" step="0.01" placeholder="40000.00" required />
              </div>
            )}
            {payRateType === 'stipend' && (
              <div>
                <Label htmlFor="stipendAmount">Stipend Amount</Label>
                <Input id="stipendAmount" name="stipendAmount" type="number" step="0.01" placeholder="500.00" required />
              </div>
            )}

            <div>
              <Label htmlFor="maxHoursPerWeek">Max Hours Per Week (Optional)</Label>
              <Input id="maxHoursPerWeek" name="maxHoursPerWeek" type="number" step="0.1" />
            </div>
            <div>
              <Label htmlFor="maxHoursPerPayPeriod">Max Hours Per Pay Period (Optional)</Label>
              <Input id="maxHoursPerPayPeriod" name="maxHoursPerPayPeriod" type="number" step="0.1" />
            </div>
            <div>
              <Label htmlFor="requiresApproval">Requires Approval</Label>
              <Select id="requiresApproval" name="requiresApproval">
                <option value="false">No</option>
                <option value="true">Yes</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="minGpa">Minimum GPA (Optional)</Label>
              <Input id="minGpa" name="minGpa" type="number" step="0.01" placeholder="2.5" />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" required>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_hold">On Hold</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button type="button" variant="secondary" asChild>
              <Link href="/admin/job-positions">
                Cancel
              </Link>
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" /> Add Job Position
            </Button>
          </div>
        </form>
      </DashboardCard>
    </div>
  );
}
