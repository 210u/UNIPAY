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
  title: 'Employee Advances | University Payroll System',
  description: 'Manage employee advances',
};

type EmployeeAdvance = Database['public']['Tables']['employee_advances']['Row'] & {
  employees: (Database['public']['Tables']['employees']['Row'] & {
    user_profiles: Database['public']['Tables']['user_profiles']['Row'] | null;
  }) | null;
  approved_by_user: Database['public']['Tables']['user_profiles']['Row'] | null;
  paid_by_user: Database['public']['Tables']['user_profiles']['Row'] | null;
};

async function getEmployeeAdvances(): Promise<EmployeeAdvance[]> {
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
    .select(
      `
        *,
        employees(user_profiles(first_name, last_name)),
        approved_by_user:user_profiles(first_name, last_name),
        paid_by_user:user_profiles(first_name, last_name)
      `
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching employee advances:', error);
    return [];
  }

  return data;
}

const employeeAdvanceColumns = [
  {
    key: 'advance_number',
    header: 'Advance No.',
    render: (item: EmployeeAdvance) => <span className="font-medium text-textPrimary">{item.advance_number}</span>,
  },
  {
    key: 'employee_name',
    header: 'Employee Name',
    render: (item: EmployeeAdvance) => (
      <span className="text-textSecondary text-sm">
        {item.employees?.user_profiles?.first_name} {item.employees?.user_profiles?.last_name}
      </span>
    ),
  },
  {
    key: 'amount',
    header: 'Amount',
    render: (item: EmployeeAdvance) => <span className="text-textSecondary text-sm">${item.amount.toFixed(2)}</span>,
  },
  {
    key: 'balance_remaining',
    header: 'Balance',
    render: (item: EmployeeAdvance) => <span className="text-textSecondary text-sm">${item.balance_remaining.toFixed(2)}</span>,
  },
  {
    key: 'repayment_start_date',
    header: 'Repayment Start',
    render: (item: EmployeeAdvance) => <span className="text-textSubtle text-sm">{item.repayment_start_date}</span>,
  },
  {
    key: 'is_fully_repaid',
    header: 'Fully Repaid',
    render: (item: EmployeeAdvance) => (
      <Badge variant={item.is_fully_repaid ? 'success' : 'danger'}>
        {item.is_fully_repaid ? 'Yes' : 'No'}
      </Badge>
    ),
  },
  {
    key: 'approved_by',
    header: 'Approved By',
    render: (item: EmployeeAdvance) => (
      <span className="text-textSubtle text-sm">
        {item.approved_by_user ? `${item.approved_by_user.first_name} ${item.approved_by_user.last_name}` : 'N/A'}
      </span>
    ),
  },
  {
    key: 'paid_at',
    header: 'Paid At',
    render: (item: EmployeeAdvance) => <span className="text-textSubtle text-sm">{item.paid_at ? new Date(item.paid_at).toLocaleDateString() : 'N/A'}</span>,
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item: EmployeeAdvance) => (
      <div className="flex space-x-2">
        <Link href={`/admin/employee-advances/${item.id}/edit`}>
          <Button variant="secondary" size="sm">
            Edit
          </Button>
        </Link>
      </div>
    ),
  },
];

export default async function EmployeeAdvancesPage() {
  const employeeAdvances = await getEmployeeAdvances();

  return (
    <div className="space-y-8">
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-textPrimary">Employee Advances</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search advances..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Link href="/admin/employee-advances/new">
              <Button className="flex items-center space-x-2 text-sm">
                <Plus className="h-4 w-4" />
                <span>Add Advance</span>
              </Button>
            </Link>
          </div>
        </div>
        <DashboardTable data={employeeAdvances} columns={employeeAdvanceColumns} />
      </DashboardCard>
    </div>
  );
}

