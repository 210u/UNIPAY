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
import { updateEmployeeAssignment } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit Employee Assignment | University Payroll System',
  description: 'Edit an existing employee assignment record',
};


type Employee = Database['public']['Tables']['employees']['Row'] & {
  user_profiles: Database['public']['Tables']['user_profiles']['Row'] | null;
};
type JobPosition = Database['public']['Tables']['job_positions']['Row'];
type Department = Database['public']['Tables']['departments']['Row'];
type EmployeeAssignment = Database['public']['Tables']['employee_assignments']['Row'] & {
  employees: (Database['public']['Tables']['employees']['Row'] & {
    user_profiles: Database['public']['Tables']['user_profiles']['Row'] | null;
  }) | null;
  job_positions: Database['public']['Tables']['job_positions']['Row'] | null;
  departments: Database['public']['Tables']['departments']['Row'] | null;
};

async function getEmployeeAssignmentDetails(assignmentId: string): Promise<EmployeeAssignment | null> {
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
    .from('employee_assignments')
    .select(
      `
        *,
        employees(user_profiles(first_name, last_name)),
        job_positions(title, pay_rate_type),
        departments(name)
      `
    )
    .eq('id', assignmentId)
    .single();

  if (error) {
    console.error('Error fetching employee assignment details:', error);
    return null;
  }

  return data;
}

async function getEmployees(): Promise<Employee[]> {
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

  const { data, error } = await supabase.from('employees').select('id, user_profiles(first_name, last_name, email)').order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
  return data;
}

async function getJobPositions(): Promise<JobPosition[]> {
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

  const { data, error } = await supabase.from('job_positions').select('id, title, pay_rate_type').order('title', { ascending: true });

  if (error) {
    console.error('Error fetching job positions:', error);
    return [];
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

export default async function EditEmployeeAssignmentPage({ params }: { params: { id: string } }) {
  const assignment = await getEmployeeAssignmentDetails(params.id);
  const employees = await getEmployees();
  const jobPositions = await getJobPositions();
  const departments = await getDepartments();

  if (!assignment) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Employee Assignment Not Found</h1>
        <p className="text-textSecondary">The employee assignment you are looking for does not exist.</p>
        <Link href="/admin/employee-assignments" className="mt-4 inline-block">
          <Button>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Employee Assignments List
          </Button>
        </Link>
      </div>
    );
  }

  const [selectedJobPositionId, setSelectedJobPositionId] = useState<string | null>(assignment.job_position_id);
  const [selectedPayRateType, setSelectedPayRateType] = useState<Database['public']['Enums']['pay_rate_type'] | null>(assignment.pay_rate_type);

  useEffect(() => {
    if (selectedJobPositionId) {
      const job = jobPositions.find(jp => jp.id === selectedJobPositionId);
      if (job) {
        setSelectedPayRateType(job.pay_rate_type);
      }
    } else {
      setSelectedPayRateType(null);
    }
  }, [selectedJobPositionId, jobPositions]);

  return (
    <div className="space-y-8">
      <Link href="/admin/employee-assignments">
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Employee Assignments List
        </Button>
      </Link>

      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Edit Employee Assignment: {assignment.assignment_number}</h1>

        <form className="space-y-6" action={updateEmployeeAssignment}>
          <input type="hidden" name="id" value={assignment.id} />
          <input type="hidden" name="payRateType" value={selectedPayRateType || ''} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeId">Employee</Label>
              <Select id="employeeId" name="employeeId" required defaultValue={assignment.employee_id || ''}>
                <option value="">Select an employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.user_profiles?.first_name} {emp.user_profiles?.last_name} ({emp.user_profiles?.email})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="jobPositionId">Job Position</Label>
              <Select id="jobPositionId" name="jobPositionId" required defaultValue={selectedJobPositionId || ''} onChange={(e) => setSelectedJobPositionId(e.target.value)}>
                <option value="">Select a job position</option>
                {jobPositions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.title} ({pos.pay_rate_type})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="departmentId">Department</Label>
              <Select id="departmentId" name="departmentId" required defaultValue={assignment.department_id || ''}>
                <option value="">Select a department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="assignmentNumber">Assignment Number</Label>
              <Input id="assignmentNumber" name="assignmentNumber" type="text" placeholder="EMP001-01" required defaultValue={assignment.assignment_number || ''} />
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" name="startDate" type="date" required defaultValue={assignment.start_date || ''} />
            </div>
            <div>
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input id="endDate" name="endDate" type="date" defaultValue={assignment.end_date || ''} />
            </div>

            {selectedPayRateType === 'hourly' && (
              <div>
                <Label htmlFor="hourlyRate">Hourly Rate</Label>
                <Input id="hourlyRate" name="hourlyRate" type="number" step="0.01" placeholder="25.00" required defaultValue={assignment.hourly_rate || 0} />
              </div>
            )}
            {selectedPayRateType === 'salary' && (
              <div>
                <Label htmlFor="salaryAmount">Salary Amount</Label>
                <Input id="salaryAmount" name="salaryAmount" type="number" step="0.01" placeholder="50000.00" required defaultValue={assignment.salary_amount || 0} />
              </div>
            )}
            {selectedPayRateType === 'stipend' && (
              <div>
                <Label htmlFor="stipendAmount">Stipend Amount</Label>
                <Input id="stipendAmount" name="stipendAmount" type="number" step="0.01" placeholder="500.00" required defaultValue={assignment.stipend_amount || 0} />
              </div>
            )}

            <div>
              <Label htmlFor="maxHoursPerWeek">Max Hours Per Week (Optional)</Label>
              <Input id="maxHoursPerWeek" name="maxHoursPerWeek" type="number" step="0.1" defaultValue={assignment.max_hours_per_week || ''} />
            </div>
            <div>
              <Label htmlFor="maxHoursPerPayPeriod">Max Hours Per Pay Period (Optional)</Label>
              <Input id="maxHoursPerPayPeriod" name="maxHoursPerPayPeriod" type="number" step="0.1" defaultValue={assignment.max_hours_per_pay_period || ''} />
            </div>
            <div>
              <Label htmlFor="isApproved">Is Approved</Label>
              <Select id="isApproved" name="isApproved" defaultValue={assignment.is_approved ? 'true' : 'false'}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="isActive">Is Active</Label>
              <Select id="isActive" name="isActive" defaultValue={assignment.is_active ? 'true' : 'false'}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input id="notes" name="notes" type="text" placeholder="Any additional notes" defaultValue={assignment.notes || ''} />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button type="button" variant="secondary" asChild>
              <Link href="/admin/employee-assignments">
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

