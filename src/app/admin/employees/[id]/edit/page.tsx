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
import { updateEmployee } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit Employee | University Payroll System',
  description: 'Edit an existing employee record',
};

type Department = Database['public']['Tables']['departments']['Row'];
type JobPosition = Database['public']['Tables']['job_positions']['Row'];

type EmployeeDetails = Database['public']['Tables']['employees']['Row'] & {
  user_profiles: Database['public']['Tables']['user_profiles']['Row'] | null;
  departments: Database['public']['Tables']['departments']['Row'] | null;
  employee_assignments: (Database['public']['Tables']['employee_assignments']['Row'] & {
    job_positions: Database['public']['Tables']['job_positions']['Row'] | null;
  })[];
};

async function getEmployeeDetails(employeeId: string): Promise<EmployeeDetails | null> {
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
    .from('employees')
    .select(
      `
        *,
        user_profiles(*),
        departments(*),
        employee_assignments(*, job_positions(*))
      `
    )
    .eq('id', employeeId)
    .single();

  if (error) {
    console.error('Error fetching employee details:', error);
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

export default async function EditEmployeePage({ params }: { params: { id: string } }) {
  const employee = await getEmployeeDetails(params.id);
  const departments = await getDepartments();
  const jobPositions = await getJobPositions();

  if (!employee) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Employee Not Found</h1>
        <p className="text-textSecondary">The employee you are looking for does not exist.</p>
        <Link href="/admin/employees" className="mt-4 inline-block">
          <Button>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Employee List
          </Button>
        </Link>
      </div>
    );
  }

  const [selectedJobPositionId, setSelectedJobPositionId] = useState<string | null>(employee.employee_assignments[0]?.job_position_id || null);
  const [selectedPayRateType, setSelectedPayRateType] = useState<Database['public']['Enums']['pay_rate_type'] | null>(employee.employee_assignments[0]?.pay_rate_type || null);

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

  const currentAssignment = employee.employee_assignments[0];

  return (
    <div className="space-y-8">
      <Link href={`/admin/employees/${employee.id}`}>
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Employee Details
        </Button>
      </Link>

      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Edit Employee: {employee.user_profiles?.first_name} {employee.user_profiles?.last_name}</h1>

        <form className="space-y-6" action={updateEmployee}>
          <input type="hidden" name="employeeId" value={employee.id} />
          <input type="hidden" name="userId" value={employee.user_id} />
          <input type="hidden" name="payRateType" value={selectedPayRateType || ''} />

          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" type="text" placeholder="John" required defaultValue={employee.user_profiles?.first_name || ''} />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" type="text" placeholder="Doe" required defaultValue={employee.user_profiles?.last_name || ''} />
            </div>
            <div>
              <Label htmlFor="middleName">Middle Name (Optional)</Label>
              <Input id="middleName" name="middleName" type="text" placeholder="A." defaultValue={employee.user_profiles?.middle_name || ''} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required defaultValue={employee.user_profiles?.email || ''} />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input id="phoneNumber" name="phoneNumber" type="tel" placeholder="+1 (555) 123-4567" defaultValue={employee.user_profiles?.phone_number || ''} />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={employee.user_profiles?.date_of_birth || ''} />
            </div>
            <div>
              <Label htmlFor="addressLine1">Address Line 1 (Optional)</Label>
              <Input id="addressLine1" name="addressLine1" type="text" placeholder="123 Main St" defaultValue={employee.user_profiles?.address_line1 || ''} />
            </div>
            <div>
              <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
              <Input id="addressLine2" name="addressLine2" type="text" placeholder="Apt 4B" defaultValue={employee.user_profiles?.address_line2 || ''} />
            </div>
            <div>
              <Label htmlFor="city">City (Optional)</Label>
              <Input id="city" name="city" type="text" placeholder="Anytown" defaultValue={employee.user_profiles?.city || ''} />
            </div>
            <div>
              <Label htmlFor="stateProvince">State/Province (Optional)</Label>
              <Input id="stateProvince" name="stateProvince" type="text" placeholder="CA" defaultValue={employee.user_profiles?.state_province || ''} />
            </div>
            <div>
              <Label htmlFor="country">Country (Optional)</Label>
              <Input id="country" name="country" type="text" placeholder="USA" defaultValue={employee.user_profiles?.country || ''} />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code (Optional)</Label>
              <Input id="postalCode" name="postalCode" type="text" placeholder="90210" defaultValue={employee.user_profiles?.postal_code || ''} />
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4 mt-8">Employment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeNumber">Employee Number</Label>
              <Input id="employeeNumber" name="employeeNumber" type="text" placeholder="EMP001" required defaultValue={employee.employee_number || ''} />
            </div>
            <div>
              <Label htmlFor="hireDate">Hire Date</Label>
              <Input id="hireDate" name="hireDate" type="date" required defaultValue={employee.hire_date || ''} />
            </div>
            <div>
              <Label htmlFor="employeeType">Employee Type</Label>
              <Select id="employeeType" name="employeeType" required defaultValue={employee.employee_type || ''}>
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="contractor">Contractor</option>
                <option value="student">Student</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="employmentStatus">Employment Status</Label>
              <Select id="employmentStatus" name="employmentStatus" required defaultValue={employee.employment_status || ''}>
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="taxId">Tax ID (Optional)</Label>
              <Input id="taxId" name="taxId" type="text" placeholder="XXX-XX-XXXX" defaultValue={employee.tax_id || ''} />
            </div>
            <div>
              <Label htmlFor="departmentId">Department</Label>
              <Select id="departmentId" name="departmentId" required defaultValue={employee.department_id || ''}>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="jobPositionId">Job Position</Label>
              <Select id="jobPositionId" name="jobPositionId" required defaultValue={selectedJobPositionId || ''} onChange={(e) => setSelectedJobPositionId(e.target.value)}>
                {jobPositions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.title} ({pos.pay_rate_type})
                  </option>
                ))}
              </Select>
            </div>

            {selectedPayRateType === 'hourly' && (
              <div>
                <Label htmlFor="hourlyRate">Hourly Rate</Label>
                <Input id="hourlyRate" name="hourlyRate" type="number" step="0.01" placeholder="25.00" required defaultValue={currentAssignment?.hourly_rate || 0} />
              </div>
            )}
            {selectedPayRateType === 'salary' && (
              <div>
                <Label htmlFor="salaryAmount">Salary Amount</Label>
                <Input id="salaryAmount" name="salaryAmount" type="number" step="0.01" placeholder="50000.00" required defaultValue={currentAssignment?.salary_amount || 0} />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button type="button" variant="secondary" asChild>
              <Link href={`/admin/employees/${employee.id}`}>
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

