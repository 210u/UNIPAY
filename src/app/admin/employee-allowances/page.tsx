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
  title: 'Employee Allowances | University Payroll System',
  description: 'Manage employee allowances',
};

type EmployeeAllowance = Database['public']['Tables']['employee_allowances']['Row'] & {
  employees: (Database['public']['Tables']['employees']['Row'] & {
    user_profiles: Database['public']['Tables']['user_profiles']['Row'] | null;
  }) | null;
  allowance_configs: Database['public']['Tables']['allowance_configs']['Row'] | null;
};

async function getEmployeeAllowances(): Promise<EmployeeAllowance[]> {
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
    .from('employee_allowances')
    .select(
      `
        *,
        employees(user_profiles(first_name, last_name)),
        allowance_configs(name, code)
      `
    )
    .order('effective_from', { ascending: false });

  if (error) {
    console.error('Error fetching employee allowances:', error);
    return [];
  }

  return data;
}

const employeeAllowanceColumns = [
  {
    key: 'employee_name',
    header: 'Employee Name',
    render: (item: EmployeeAllowance) => (
      <span className="font-medium text-textPrimary">
        {item.employees?.user_profiles?.first_name} {item.employees?.user_profiles?.last_name}
      </span>
    ),
  },
  {
    key: 'allowance_name',
    header: 'Allowance Name',
    render: (item: EmployeeAllowance) => <span className="text-textSecondary text-sm">{item.allowance_configs?.name || 'N/A'}</span>,
  },
  {
    key: 'allowance_code',
    header: 'Code',
    render: (item: EmployeeAllowance) => <span className="text-textSecondary text-sm">{item.allowance_configs?.code || 'N/A'}</span>,
  },
  {
    key: 'amount',
    header: 'Amount/Percentage',
    render: (item: EmployeeAllowance) => (
      <span className="text-textSecondary text-sm">
        {item.custom_amount ? `$${item.custom_amount.toFixed(2)}` : ''}
        {item.custom_percentage ? `${item.custom_percentage.toFixed(2)}%` : ''}
      </span>
    ),
  },
  {
    key: 'effective_from',
    header: 'Effective From',
    render: (item: EmployeeAllowance) => <span className="text-textSubtle text-sm">{item.effective_from}</span>,
  },
  {
    key: 'effective_to',
    header: 'Effective To',
    render: (item: EmployeeAllowance) => <span className="text-textSubtle text-sm">{item.effective_to || 'Current'}</span>,
  },
  {
    key: 'is_active',
    header: 'Status',
    render: (item: EmployeeAllowance) => (
      <Badge variant={item.is_active ? 'success' : 'warning'}>
        {item.is_active ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item: EmployeeAllowance) => (
      <div className="flex space-x-2">
        <Link href={`/admin/employee-allowances/${item.id}/edit`}>
          <Button variant="secondary" size="sm">
            Edit
          </Button>
        </Link>
      </div>
    ),
  },
];

export default async function EmployeeAllowancesPage() {
  const employeeAllowances = await getEmployeeAllowances();

  return (
    <div className="space-y-8">
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-textPrimary">Employee Allowances</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search employee allowances..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Link href="/admin/employee-allowances/new">
              <Button className="flex items-center space-x-2 text-sm">
                <Plus className="h-4 w-4" />
                <span>Add Employee Allowance</span>
              </Button>
            </Link>
          </div>
        </div>
        <DashboardTable data={employeeAllowances} columns={employeeAllowanceColumns} />
      </DashboardCard>
    </div>
  );
}

