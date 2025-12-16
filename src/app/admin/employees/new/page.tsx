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
import { addEmployee } from './actions';
import { useState } from 'react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Add New Employee | University Payroll System',
  description: 'Add a new employee to the system',
};

type Department = Database['public']['Tables']['departments']['Row'];
type JobPosition = Database['public']['Tables']['job_positions']['Row'];

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

export default async function AddEmployeePage() {
  const departments = await getDepartments();
  const jobPositions = await getJobPositions();
  const universityId = await getUniversityId();

  const [selectedJobPositionId, setSelectedJobPositionId] = useState<string | null>(null);
  const [selectedPayRateType, setSelectedPayRateType] = useState<Database['public']['Enums']['pay_rate_type'] | null>(null);

  React.useEffect(() => {
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
      <Link href="/admin/employees">
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Employee List
        </Button>
      </Link>

      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Add New Employee</h1>

        <form className="space-y-6" action={addEmployee}>
          <input type="hidden" name="universityId" value={universityId || ''} />
          <input type="hidden" name="payRateType" value={selectedPayRateType || ''} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" type="text" placeholder="John" required />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" type="text" placeholder="Doe" required />
            </div>
            <div>
              <Label htmlFor="middleName">Middle Name (Optional)</Label>
              <Input id="middleName" name="middleName" type="text" placeholder="A." />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input id="phoneNumber" name="phoneNumber" type="tel" placeholder="+1 (555) 123-4567" />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" />
            </div>
            <div>
              <Label htmlFor="addressLine1">Address Line 1 (Optional)</Label>
              <Input id="addressLine1" name="addressLine1" type="text" placeholder="123 Main St" />
            </div>
            <div>
              <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
              <Input id="addressLine2" name="addressLine2" type="text" placeholder="Apt 4B" />
            </div>
            <div>
              <Label htmlFor="city">City (Optional)</Label>
              <Input id="city" name="city" type="text" placeholder="Anytown" />
            </div>
            <div>
              <Label htmlFor="stateProvince">State/Province (Optional)</Label>
              <Input id="stateProvince" name="stateProvince" type="text" placeholder="CA" />
            </div>
            <div>
              <Label htmlFor="country">Country (Optional)</Label>
              <Input id="country" name="country" type="text" placeholder="USA" />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code (Optional)</Label>
              <Input id="postalCode" name="postalCode" type="text" placeholder="90210" />
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4 mt-8">Employment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeNumber">Employee Number</Label>
              <Input id="employeeNumber" name="employeeNumber" type="text" placeholder="EMP001" required />
            </div>
            <div>
              <Label htmlFor="hireDate">Hire Date</Label>
              <Input id="hireDate" name="hireDate" type="date" required />
            </div>
            <div>
              <Label htmlFor="employeeType">Employee Type</Label>
              <Select id="employeeType" name="employeeType" required>
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="contractor">Contractor</option>
                <option value="student">Student</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="employmentStatus">Employment Status</Label>
              <Select id="employmentStatus" name="employmentStatus" required>
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="taxId">Tax ID (Optional)</Label>
              <Input id="taxId" name="taxId" type="text" placeholder="XXX-XX-XXXX" />
            </div>
            <div>
              <Label htmlFor="departmentId">Department</Label>
              <Select id="departmentId" name="departmentId" required>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="jobPositionId">Job Position</Label>
              <Select id="jobPositionId" name="jobPositionId" required onChange={(e) => setSelectedJobPositionId(e.target.value)}>
                <option value="">Select a job position</option>
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
                <Input id="hourlyRate" name="hourlyRate" type="number" step="0.01" placeholder="25.00" required />
              </div>
            )}
            {selectedPayRateType === 'salary' && (
              <div>
                <Label htmlFor="salaryAmount">Salary Amount</Label>
                <Input id="salaryAmount" name="salaryAmount" type="number" step="0.01" placeholder="50000.00" required />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button type="button" variant="secondary" asChild>
              <Link href="/admin/employees">
                Cancel
              </Link>
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" /> Save Employee
            </Button>
          </div>
        </form>
      </DashboardCard>
    </div>
  );
}
