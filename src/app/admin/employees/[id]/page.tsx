import React from 'react';
import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import DashboardCard from '@/components/common/DashboardCard';
import { Avatar } from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { ChevronLeft, Mail, Phone, MapPin, Briefcase, Calendar, DollarSign, Banknote, Users, GitCommit } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Employee Details | University Payroll System',
  description: 'View and manage employee details',
};

type EmployeeDetails = Database['public']['Tables']['employees']['Row'] & {
  user_profiles: Database['public']['Tables']['user_profiles']['Row'] | null;
  departments: Database['public']['Tables']['departments']['Row'] | null;
  employee_assignments: (Database['public']['Tables']['employee_assignments']['Row'] & {
    job_positions: Database['public']['Tables']['job_positions']['Row'] | null;
  })[];
  employee_bank_accounts: Database['public']['Tables']['employee_bank_accounts']['Row'][];
  employee_allowances: Database['public']['Tables']['employee_allowances']['Row'][];
  employee_deductions: Database['public']['Tables']['employee_deductions']['Row'][];
  employee_salary_history: Database['public']['Tables']['employee_salary_history']['Row'][];
  employee_supervisors: (Database['public']['Tables']['employee_supervisors']['Row'] & {
    user_profiles: Database['public']['Tables']['user_profiles']['Row'] | null;
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
        employee_assignments(*, job_positions(*)),
        employee_bank_accounts(*),
        employee_allowances(*),
        employee_deductions(*),
        employee_salary_history(*),
        employee_supervisors(*, user_profiles(*))
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

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const employee = await getEmployeeDetails(params.id);

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

  const fullName = `${employee.user_profiles?.first_name || ''} ${employee.user_profiles?.last_name || ''}`.trim();

  return (
    <div className="space-y-8">
      <Link href="/admin/employees">
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Employee List
        </Button>
      </Link>

      <DashboardCard>
        <div className="flex items-center space-x-6">
          <Avatar
            alt={fullName}
            src={employee.user_profiles?.profile_image_url || undefined}
            className="w-24 h-24 text-4xl"
          />
          <div>
            <h1 className="text-3xl font-bold text-textPrimary">{fullName}</h1>
            <p className="text-textSecondary">{employee.employee_number}</p>
            <Badge variant={employee.employment_status === 'active' ? 'success' : 'warning'} className="mt-2">
              {employee.employment_status}
            </Badge>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="space-y-3">
              <p className="flex items-center text-textSecondary">
                <Mail className="h-4 w-4 mr-2 text-textAccent" />
                {employee.user_profiles?.email || 'N/A'}
              </p>
              <p className="flex items-center text-textSecondary">
                <Phone className="h-4 w-4 mr-2 text-textAccent" />
                {employee.user_profiles?.phone_number || 'N/A'}
              </p>
              <p className="flex items-center text-textSecondary">
                <MapPin className="h-4 w-4 mr-2 text-textAccent" />
                {`${employee.user_profiles?.address_line1 || ''}, ${employee.user_profiles?.city || ''}, ${employee.user_profiles?.state_province || ''}, ${employee.user_profiles?.country || ''}`.replace(/, \s*,/g, ',').replace(/^,/, '').trim() || 'N/A'}
              </p>
              <p className="flex items-center text-textSecondary">
                <Calendar className="h-4 w-4 mr-2 text-textAccent" />
                Date of Birth: {employee.user_profiles?.date_of_birth || 'N/A'}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Employment Information</h2>
            <div className="space-y-3">
              <p className="flex items-center text-textSecondary">
                <Briefcase className="h-4 w-4 mr-2 text-textAccent" />
                Department: {employee.departments?.name || 'N/A'}
              </p>
              <p className="flex items-center text-textSecondary">
                <Calendar className="h-4 w-4 mr-2 text-textAccent" />
                Hire Date: {employee.hire_date || 'N/A'}
              </p>
              <p className="flex items-center text-textSecondary">
                <GitCommit className="h-4 w-4 mr-2 text-textAccent" />
                Employee Type: {employee.employee_type || 'N/A'}
              </p>
              <p className="flex items-center text-textSecondary">
                <DollarSign className="h-4 w-4 mr-2 text-textAccent" />
                Tax ID: {employee.tax_id || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </DashboardCard>

      {employee.employee_assignments.length > 0 && (
        <DashboardCard>
          <h2 className="text-xl font-semibold mb-4">Assignments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">Position</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">Department</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">Pay Rate</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">Start Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">End Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employee.employee_assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-textPrimary">
                      {assignment.job_positions?.title || 'N/A'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-textSecondary">
                      {employee.departments?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-textSecondary">
                      {assignment.pay_rate_type === 'hourly'
                        ? `$${assignment.hourly_rate?.toFixed(2)}/hour`
                        : `$${assignment.salary_amount?.toFixed(2)}/year`}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-textSubtle">{assignment.start_date}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-textSubtle">
                      {assignment.end_date || 'Current'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-textSecondary">
                      <Badge variant={assignment.is_active ? 'success' : 'warning'}>
                        {assignment.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      )}

      {employee.employee_bank_accounts.length > 0 && (
        <DashboardCard>
          <h2 className="text-xl font-semibold mb-4">Bank Accounts</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">Bank Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">Account Number</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">Routing Number</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">Account Type</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">Primary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employee.employee_bank_accounts.map((account) => (
                  <tr key={account.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-textPrimary">
                      {account.bank_name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-textSecondary">
                      {account.account_number}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-textSecondary">
                      {account.routing_number}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-textSubtle">{account.account_type}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-textSecondary">
                      <Badge variant={account.is_primary ? 'success' : 'info'}>
                        {account.is_primary ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      )}

      {employee.employee_supervisors.length > 0 && (
        <DashboardCard>
          <h2 className="text-xl font-semibold mb-4">Supervisors</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">Email</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">Can Approve Timesheets</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">Can Adjust Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employee.employee_supervisors.map((supervisor) => (
                  <tr key={supervisor.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-textPrimary">
                      {supervisor.user_profiles?.first_name} {supervisor.user_profiles?.last_name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-textSecondary">
                      {supervisor.user_profiles?.email}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-textSecondary">
                      <Badge variant={supervisor.can_approve_timesheets ? 'success' : 'danger'}>
                        {supervisor.can_approve_timesheets ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-textSecondary">
                      <Badge variant={supervisor.can_adjust_pay ? 'success' : 'danger'}>
                        {supervisor.can_adjust_pay ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      )}

      {/* TODO: Add sections for Allowances, Deductions, Salary History, Advances */}

    </div>
  );
}
