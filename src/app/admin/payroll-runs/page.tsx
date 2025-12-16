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
  title: 'Payroll Runs | University Payroll System',
  description: 'Manage payroll runs',
};

type PayrollRun = Database['public']['Tables']['payroll_runs']['Row'] & {
  payroll_periods: Database['public']['Tables']['payroll_periods']['Row'] | null;
  ran_by_user: Database['public']['Tables']['user_profiles']['Row'] | null;
};

async function getPayrollRuns(): Promise<PayrollRun[]> {
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
    .from('payroll_runs')
    .select(
      `
        *,
        payroll_periods(period_name),
        ran_by_user:user_profiles(first_name, last_name)
      `
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching payroll runs:', error);
    return [];
  }

  return data;
}

const payrollRunColumns = [
  {
    key: 'run_number',
    header: 'Run No.',
    render: (item: PayrollRun) => <span className="font-medium text-textPrimary">{item.run_number}</span>,
  },
  {
    key: 'payroll_period',
    header: 'Payroll Period',
    render: (item: PayrollRun) => <span className="text-textSecondary text-sm">{item.payroll_periods?.period_name || 'N/A'}</span>,
  },
  {
    key: 'run_date',
    header: 'Run Date',
    render: (item: PayrollRun) => <span className="text-textSecondary text-sm">{new Date(item.run_date).toLocaleDateString()}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (item: PayrollRun) => <Badge variant={item.status === 'completed' ? 'success' : 'warning'}>{item.status}</Badge>,
  },
  {
    key: 'total_employees_processed',
    header: 'Employees Processed',
    render: (item: PayrollRun) => <span className="text-textSecondary text-sm">{item.total_employees_processed}</span>,
  },
  {
    key: 'total_gross_pay',
    header: 'Total Gross Pay',
    render: (item: PayrollRun) => <span className="text-textSecondary text-sm">${item.total_gross_pay.toFixed(2)}</span>,
  },
  {
    key: 'total_net_pay',
    header: 'Total Net Pay',
    render: (item: PayrollRun) => <span className="text-textSecondary text-sm">${item.total_net_pay.toFixed(2)}</span>,
  },
  {
    key: 'ran_by',
    header: 'Ran By',
    render: (item: PayrollRun) => (
      <span className="text-textSubtle text-sm">
        {item.ran_by_user ? `${item.ran_by_user.first_name} ${item.ran_by_user.last_name}` : 'N/A'}
      </span>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item: PayrollRun) => (
      <div className="flex space-x-2">
        <Link href={`/admin/payroll-runs/${item.id}`}>
          <Button variant="secondary" size="sm">
            View
          </Button>
        </Link>
        {/* Add edit/delete actions if applicable */}
      </div>
    ),
  },
];

export default async function PayrollRunsPage() {
  const payrollRuns = await getPayrollRuns();

  return (
    <div className="space-y-8">
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-textPrimary">Payroll Runs</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search payroll runs..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Link href="/admin/payroll-runs/new">
              <Button className="flex items-center space-x-2 text-sm">
                <Plus className="h-4 w-4" />
                <span>Create Payroll Run</span>
              </Button>
            </Link>
          </div>
        </div>
        <DashboardTable data={payrollRuns} columns={payrollRunColumns} />
      </DashboardCard>
    </div>
  );
}

