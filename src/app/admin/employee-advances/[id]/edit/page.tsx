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
import { updateEmployeeAdvance } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit Employee Advance | University Payroll System',
  description: 'Edit an existing employee advance record',
};

type EmployeeAdvance = Database['public']['Tables']['employee_advances']['Row'];
type Employee = Database['public']['Tables']['employees']['Row'] & {
  user_profiles: Database['public']['Tables']['user_profiles']['Row'] | null;
};
type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

async function getEmployeeAdvanceDetails(advanceId: string): Promise<EmployeeAdvance | null> {
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
    .from('employee_advances')
    .select('*')
    .eq('id', advanceId)
    .single();

  if (error) {
    console.error('Error fetching employee advance details:', error);
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

  const { data, error } = await supabase.from('employees').select('id, employee_number, user_profiles(first_name, last_name, email)').order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
  return data;
}

async function getUserProfiles(): Promise<UserProfile[]> {
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

  const { data, error } = await supabase.from('user_profiles').select('id, first_name, last_name, email').order('last_name', { ascending: true });

  if (error) {
    console.error('Error fetching user profiles:', error);
    return [];
  }
  return data;
}

export default async function EditEmployeeAdvancePage({ params }: { params: { id: string } }) {
  const employeeAdvance = await getEmployeeAdvanceDetails(params.id);
  const employees = await getEmployees();
  const userProfiles = await getUserProfiles();

  if (!employeeAdvance) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Employee Advance Not Found</h1>
        <p className="text-textSecondary">The employee advance you are looking for does not exist.</p>
        <Link href="/admin/employee-advances" className="mt-4 inline-block">
          <Button>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Employee Advances List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/admin/employee-advances">
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Employee Advances List
        </Button>
      </Link>

      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Edit Employee Advance: {employeeAdvance.advance_number}</h1>

        <form className="space-y-6" action={updateEmployeeAdvance}>
          <input type="hidden" name="id" value={employeeAdvance.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeId">Employee</Label>
              <Select id="employeeId" name="employeeId" required defaultValue={employeeAdvance.employee_id || ''}>
                <option value="">Select an employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.user_profiles?.first_name} {emp.user_profiles?.last_name} ({emp.employee_number})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="advanceNumber">Advance Number</Label>
              <Input id="advanceNumber" name="advanceNumber" type="text" placeholder="ADV-001" required defaultValue={employeeAdvance.advance_number || ''} />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" step="0.01" placeholder="1000.00" required defaultValue={employeeAdvance.amount || 0} />
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Input id="reason" name="reason" type="text" placeholder="Emergency medical expense" required defaultValue={employeeAdvance.reason || ''} />
            </div>
            <div>
              <Label htmlFor="repaymentStartDate">Repayment Start Date</Label>
              <Input id="repaymentStartDate" name="repaymentStartDate" type="date" required defaultValue={employeeAdvance.repayment_start_date || ''} />
            </div>
            <div>
              <Label htmlFor="repaymentAmountPerPeriod">Repayment Amount Per Period</Label>
              <Input id="repaymentAmountPerPeriod" name="repaymentAmountPerPeriod" type="number" step="0.01" placeholder="100.00" required defaultValue={employeeAdvance.repayment_amount_per_period || 0} />
            </div>
            <div>
              <Label htmlFor="totalRepaid">Total Repaid</Label>
              <Input id="totalRepaid" name="totalRepaid" type="number" step="0.01" placeholder="0.00" required defaultValue={employeeAdvance.total_repaid || 0} />
            </div>
            <div>
              <Label htmlFor="balanceRemaining">Balance Remaining</Label>
              <Input id="balanceRemaining" name="balanceRemaining" type="number" step="0.01" placeholder="1000.00" required defaultValue={employeeAdvance.balance_remaining || 0} />
            </div>
            <div>
              <Label htmlFor="isFullyRepaid">Is Fully Repaid</Label>
              <Select id="isFullyRepaid" name="isFullyRepaid" defaultValue={employeeAdvance.is_fully_repaid ? 'true' : 'false'}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="approvedBy">Approved By (Optional)</Label>
              <Select id="approvedBy" name="approvedBy" defaultValue={employeeAdvance.approved_by || ''}>
                <option value="">Select approver</option>
                {userProfiles.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="approvedAt">Approved At (Optional)</Label>
              <Input id="approvedAt" name="approvedAt" type="datetime-local" defaultValue={employeeAdvance.approved_at ? new Date(employeeAdvance.approved_at).toISOString().slice(0, 16) : ''} />
            </div>
            <div>
              <Label htmlFor="paidAt">Paid At (Optional)</Label>
              <Input id="paidAt" name="paidAt" type="datetime-local" defaultValue={employeeAdvance.paid_at ? new Date(employeeAdvance.paid_at).toISOString().slice(0, 16) : ''} />
            </div>
            <div>
              <Label htmlFor="paidBy">Paid By (Optional)</Label>
              <Select id="paidBy" name="paidBy" defaultValue={employeeAdvance.paid_by || ''}>
                <option value="">Select payer</option>
                {userProfiles.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentReference">Payment Reference (Optional)</Label>
              <Input id="paymentReference" name="paymentReference" type="text" placeholder="TRN-ADV-001" defaultValue={employeeAdvance.payment_reference || ''} />
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input id="notes" name="notes" type="text" placeholder="Additional notes" defaultValue={employeeAdvance.notes || ''} />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button type="button" variant="secondary" asChild>
              <Link href="/admin/employee-advances">
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

