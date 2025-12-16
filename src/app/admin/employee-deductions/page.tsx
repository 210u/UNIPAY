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
  title: 'Employee Deductions | University Payroll System',
  description: 'Manage employee deductions',
};

type EmployeeDeduction = Database['public']['Tables']['employee_deductions']['Row'] & {
  employees: (Database['public']['Tables']['employees']['Row'] & {
    user_profiles: Database['public']['Tables']['user_profiles']['Row'] | null;
  }) | null;
  deduction_configs: Database['public']['Tables']['deduction_configs']['Row'] | null;
};

async function getEmployeeDeductions(): Promise<EmployeeDeduction[]> {
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
    .from('employee_deductions')
    .select(
      `
        *,
        employees(user_profiles(first_name, last_name)),
        deduction_configs(name, code)
      `
    )
    .order('effective_from', { ascending: false });

  if (error) {
    console.error('Error fetching employee deductions:', error);
    return [];
  }

  return data;
}

const employeeDeductionColumns = [
  {
    key: 'employee_name',
    header: 'Employee Name',
    render: (item: EmployeeDeduction) => (
      <span className="font-medium text-textPrimary">
        {item.employees?.user_profiles?.first_name} {item.employees?.user_profiles?.last_name}
      </span>
    ),
  },
  {
    key: 'deduction_name',
    header: 'Deduction Name',
    render: (item: EmployeeDeduction) => <span className="text-textSecondary text-sm">{item.deduction_configs?.name || 'N/A'}</span>,
  },
  {
    key: 'deduction_code',
    header: 'Code',
    render: (item: EmployeeDeduction) => <span className="text-textSecondary text-sm">{item.deduction_configs?.code || 'N/A'}</span>,
  },
  {
    key: 'amount',
    header: 'Amount/Percentage',
    render: (item: EmployeeDeduction) => (
      <span className="text-textSecondary text-sm">
        {item.custom_amount ? `$${item.custom_amount.toFixed(2)}` : ''}
        {item.custom_percentage ? `${item.custom_percentage.toFixed(2)}%` : ''}
      </span>
    ),
  },
  {
    key: 'effective_from',
    header: 'Effective From',
    render: (item: EmployeeDeduction) => <span className="text-textSubtle text-sm">{item.effective_from}</span>,
  },
  {
    key: 'effective_to',
    header: 'Effective To',
    render: (item: EmployeeDeduction) => <span className="text-textSubtle text-sm">{item.effective_to || 'Current'}</span>,
  },
  {
    key: 'is_active',
    header: 'Status',
    render: (item: EmployeeDeduction) => (
      <Badge variant={item.is_active ? 'success' : 'warning'}>
        {item.is_active ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item: EmployeeDeduction) => (
      <div className="flex space-x-2">
        <Link href={`/admin/employee-deductions/${item.id}/edit`}>
          <Button variant="secondary" size="sm">
            Edit
          </Button>
        </Link>
      </div>
    ),
  },
];

export default async function EmployeeDeductionsPage() {
  const employeeDeductions = await getEmployeeDeductions();

  return (
    <div className="space-y-8">
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-textPrimary">Employee Deductions</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search employee deductions..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Link href="/admin/employee-deductions/new">
              <Button className="flex items-center space-x-2 text-sm">
                <Plus className="h-4 w-4" />
                <span>Add Employee Deduction</span>
              </Button>
            </Link>
          </div>
        </div>
        <DashboardTable data={employeeDeductions} columns={employeeDeductionColumns} />
      </DashboardCard>
    </div>
  );
}

