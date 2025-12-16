'use client';

import React, { useEffect, useState } from 'react';
import DashboardCard from '@/components/common/DashboardCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Label from '@/components/ui/Label';
import Select from '@/components/ui/Select';
import Link from 'next/link';
import { ChevronLeft, Save } from 'lucide-react';
import type { Database } from '@/lib/supabase/database.types';
import { addEmployee } from './actions';

type Department = Database['public']['Tables']['departments']['Row'];
type JobPosition = Database['public']['Tables']['job_positions']['Row'];

interface AddEmployeeClientProps {
  departments: Department[];
  jobPositions: JobPosition[];
  universityId: string | null;
}

const AddEmployeeClient: React.FC<AddEmployeeClientProps> = ({
  departments,
  jobPositions,
  universityId,
}) => {
  const [selectedJobPositionId, setSelectedJobPositionId] = useState<string | null>(null);
  const [selectedPayRateType, setSelectedPayRateType] =
    useState<Database['public']['Enums']['pay_rate_type'] | null>(null);

  useEffect(() => {
    if (selectedJobPositionId) {
      const job = jobPositions.find((jp) => jp.id === selectedJobPositionId);
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
              <Select
                id="jobPositionId"
                name="jobPositionId"
                required
                onChange={(e) => setSelectedJobPositionId(e.target.value)}
              >
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
                <Input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  step="0.01"
                  placeholder="25.00"
                  required
                />
              </div>
            )}
            {selectedPayRateType === 'salary' && (
              <div>
                <Label htmlFor="salaryAmount">Salary Amount</Label>
                <Input
                  id="salaryAmount"
                  name="salaryAmount"
                  type="number"
                  step="0.01"
                  placeholder="50000.00"
                  required
                />
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
};

export default AddEmployeeClient;


