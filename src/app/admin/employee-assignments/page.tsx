import React from 'react';
import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import DashboardCard from '@/components/common/DashboardCard';
import DashboardTable from '@/components/common/DashboardTable';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Employee Assignments | University Payroll System',
  description: 'Manage employee job assignments',
};

type EmployeeAssignment = Database['public']['Tables']['employee_assignments']['Row'] & {
  employees: (Database['public']['Tables']['employees']['Row'] & {
    user_profiles: Database['public']['Tables']['user_profiles']['Row'] | null;
  }) | null;
  job_positions: Database['public']['Tables']['job_positions']['Row'] | null;
  departments: Database['public']['Tables']['departments']['Row'] | null;
};

async function getEmployeeAssignments(): Promise<EmployeeAssignment[]> {
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
        job_positions(title),
        departments(name)
      `
    )
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching employee assignments:', error);
    return [];
  }

  return data;
}

const employeeAssignmentColumns = [
  {
    key: 'employee_name',
    header: 'Employee Name',
    render: (item: EmployeeAssignment) => (
      <span className="font-medium text-textPrimary">
        {item.employees?.user_profiles?.first_name} {item.employees?.user_profiles?.last_name}
      </span>
    ),
  },
  {
    key: 'job_title',
    header: 'Job Title',
    render: (item: EmployeeAssignment) => <span className="text-textSecondary text-sm">{item.job_positions?.title || 'N/A'}</span>,
  },
  {
    key: 'department',
    header: 'Department',
    render: (item: EmployeeAssignment) => <span className="text-textSecondary text-sm">{item.departments?.name || 'N/A'}</span>,
  },
  {
    key: 'pay_rate_type',
    header: 'Pay Rate Type',
    render: (item: EmployeeAssignment) => <Badge variant="info">{item.pay_rate_type}</Badge>,
  },
  {
    key: 'pay_rate',
    header: 'Pay Rate',
    render: (item: EmployeeAssignment) => (
      <span className="text-textSecondary text-sm">
        {item.pay_rate_type === 'hourly'
          ? `$${item.hourly_rate?.toFixed(2) || '0.00'}/hour`
          : item.pay_rate_type === 'salary'
          ? `$${item.salary_amount?.toFixed(2) || '0.00'}/year`
          : `$${item.stipend_amount?.toFixed(2) || '0.00'}`}
      </span>
    ),
  },
  {
    key: 'start_date',
    header: 'Start Date',
    render: (item: EmployeeAssignment) => <span className="text-textSubtle text-sm">{item.start_date}</span>,
  },
  {
    key: 'end_date',
    header: 'End Date',
    render: (item: EmployeeAssignment) => <span className="text-textSubtle text-sm">{item.end_date || 'Current'}</span>,
  },
  {
    key: 'is_active',
    header: 'Status',
    render: (item: EmployeeAssignment) => (
      <Badge variant={item.is_active ? 'success' : 'warning'}>
        {item.is_active ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item: EmployeeAssignment) => (
      <div className="flex space-x-2">
        <Link href={`/admin/employee-assignments/${item.id}/edit`}>
          <Button variant="secondary" size="sm">
            Edit
          </Button>
        </Link>
      </div>
    ),
  },
];

export default async function EmployeeAssignmentsPage() {
  const employeeAssignments = await getEmployeeAssignments();

  return (
    <div className="space-y-8">
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-textPrimary">Employee Assignments</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search assignments..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Link href="/admin/employee-assignments/new">
              <Button className="flex items-center space-x-2 text-sm">
                <Plus className="h-4 w-4" />
                <span>Add Assignment</span>
              </Button>
            </Link>
          </div>
        </div>
        <DashboardTable data={employeeAssignments} columns={employeeAssignmentColumns} />
      </DashboardCard>
    </div>
  );
}

