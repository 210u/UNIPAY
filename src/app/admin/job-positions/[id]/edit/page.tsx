import React, { useState, useEffect } from 'react';
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
import { updateJobPosition } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit Job Position | University Payroll System',
  description: 'Edit an existing job position record',
};

type Department = Database['public']['Tables']['departments']['Row'];
type JobPosition = Database['public']['Tables']['job_positions']['Row'];

async function getJobPositionDetails(jobPositionId: string): Promise<JobPosition | null> {
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
    .from('job_positions')
    .select('*')
    .eq('id', jobPositionId)
    .single();

  if (error) {
    console.error('Error fetching job position details:', error);
    return null;
  }

  return data;
}

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

export default async function EditJobPositionPage({ params }: { params: { id: string } }) {
  const jobPosition = await getJobPositionDetails(params.id);
  const departments = await getDepartments();

  if (!jobPosition) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Job Position Not Found</h1>
        <p className="text-textSecondary">The job position you are looking for does not exist.</p>
        <Link href="/admin/job-positions" className="mt-4 inline-block">
          <Button>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Job Positions List
          </Button>
        </Link>
      </div>
    );
  }

  const [payRateType, setPayRateType] = useState<Database['public']['Enums']['pay_rate_type']>(jobPosition.pay_rate_type);

  return (
    <div className="space-y-8">
      <Link href="/admin/job-positions">
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Job Positions List
        </Button>
      </Link>

      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Edit Job Position: {jobPosition.title}</h1>

        <form className="space-y-6" action={updateJobPosition}>
          <input type="hidden" name="id" value={jobPosition.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" name="title" type="text" placeholder="Teaching Assistant" required defaultValue={jobPosition.title || ''} />
            </div>
            <div>
              <Label htmlFor="code">Job Code</Label>
              <Input id="code" name="code" type="text" placeholder="TA001" required defaultValue={jobPosition.code || ''} />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input id="description" name="description" type="text" placeholder="Assists professors with teaching duties" defaultValue={jobPosition.description || ''} />
            </div>
            <div>
              <Label htmlFor="departmentId">Department (Optional)</Label>
              <Select id="departmentId" name="departmentId" defaultValue={jobPosition.department_id || ''}>
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
                <Input id="defaultHourlyRate" name="defaultHourlyRate" type="number" step="0.01" placeholder="20.00" required defaultValue={jobPosition.default_hourly_rate || 0} />
              </div>
            )}
            {payRateType === 'salary' && (
              <div>
                <Label htmlFor="defaultSalary">Default Salary</Label>
                <Input id="defaultSalary" name="defaultSalary" type="number" step="0.01" placeholder="40000.00" required defaultValue={jobPosition.default_salary || 0} />
              </div>
            )}
            {payRateType === 'stipend' && (
              <div>
                <Label htmlFor="stipendAmount">Stipend Amount</Label>
                <Input id="stipendAmount" name="stipendAmount" type="number" step="0.01" placeholder="500.00" required defaultValue={jobPosition.stipend_amount || 0} />
              </div>
            )}

            <div>
              <Label htmlFor="maxHoursPerWeek">Max Hours Per Week (Optional)</Label>
              <Input id="maxHoursPerWeek" name="maxHoursPerWeek" type="number" step="0.1" defaultValue={jobPosition.max_hours_per_week || ''} />
            </div>
            <div>
              <Label htmlFor="maxHoursPerPayPeriod">Max Hours Per Pay Period (Optional)</Label>
              <Input id="maxHoursPerPayPeriod" name="maxHoursPerPayPeriod" type="number" step="0.1" defaultValue={jobPosition.max_hours_per_pay_period || ''} />
            </div>
            <div>
              <Label htmlFor="requiresApproval">Requires Approval</Label>
              <Select id="requiresApproval" name="requiresApproval" defaultValue={jobPosition.requires_approval ? 'true' : 'false'}>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="minGpa">Minimum GPA (Optional)</Label>
              <Input id="minGpa" name="minGpa" type="number" step="0.01" placeholder="2.5" defaultValue={jobPosition.min_gpa || ''} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" required defaultValue={jobPosition.status || ''}>
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
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        </form>
      </DashboardCard>
    </div>
  );
}

