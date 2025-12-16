import React from 'react';
import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import DashboardCard from '@/components/common/DashboardCard';
import DashboardTable from '@/components/common/DashboardTable';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { getEmployeeTimesheets } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Timesheets | University Payroll System',
  description: 'View and manage your timesheets',
};

type Timesheet = Database['public']['Tables']['timesheets']['Row'] & {
  assignment: (Database['public']['Tables']['employee_assignments']['Row'] & {
    job_positions: Database['public']['Tables']['job_positions']['Row'] | null;
  }) | null;
};

async function getCurrentEmployeeId(): Promise<string | null> {
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: employeeData, error } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching employee ID:', error);
    return null;
  }

  return employeeData?.id || null;
}

const timesheetColumns = [
  {
    key: 'timesheet_number',
    header: 'Timesheet No.',
    render: (item: Timesheet) => <span className="font-medium text-textPrimary">{item.timesheet_number}</span>,
  },
  {
    key: 'job_title',
    header: 'Job Title',
    render: (item: Timesheet) => <span className="text-textSecondary text-sm">{item.assignment?.job_positions?.title || 'N/A'}</span>,
  },
  {
    key: 'period_start_date',
    header: 'Start Date',
    render: (item: Timesheet) => <span className="text-textSecondary text-sm">{item.period_start_date}</span>,
  },
  {
    key: 'period_end_date',
    header: 'End Date',
    render: (item: Timesheet) => <span className="text-textSecondary text-sm">{item.period_end_date}</span>,
  },
  {
    key: 'total_hours',
    header: 'Total Hours',
    render: (item: Timesheet) => <span className="text-textSecondary text-sm">{item.total_hours?.toFixed(2) || '0.00'}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (item: Timesheet) => <Badge variant={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'danger' : 'warning'}>{item.status}</Badge>,
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item: Timesheet) => (
      <div className="flex space-x-2">
        <Link href={`/dashboard/timesheets/${item.id}/edit`}>
          <Button variant="secondary" size="sm">
            View / Edit
          </Button>
        </Link>
      </div>
    ),
  },
];

export default async function EmployeeTimesheetsPage() {
  const employeeId = await getCurrentEmployeeId();

  if (!employeeId) {
    redirect('/signin'); // Or a page indicating profile setup is incomplete
  }

  const timesheets = await getEmployeeTimesheets(employeeId);

  return (
    <div className="space-y-8">
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-textPrimary">My Timesheets</h1>
          <Link href="/dashboard/timesheets/new">
            <Button className="flex items-center space-x-2 text-sm">
              <Plus className="h-4 w-4" />
              <span>Create New Timesheet</span>
            </Button>
          </Link>
        </div>
        <DashboardTable data={timesheets} columns={timesheetColumns} />
      </DashboardCard>
    </div>
  );
}

