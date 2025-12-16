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
  title: 'Payroll Periods | University Payroll System',
  description: 'Manage payroll periods',
};

type PayrollPeriod = Database['public']['Tables']['payroll_periods']['Row'] & {
  closed_by_user: Database['public']['Tables']['user_profiles']['Row'] | null;
};

async function getPayrollPeriods(): Promise<PayrollPeriod[]> {
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
    .from('payroll_periods')
    .select(
      `
        *,
        closed_by_user:user_profiles(first_name, last_name)
      `
    )
    .order('period_start_date', { ascending: false });

  if (error) {
    console.error('Error fetching payroll periods:', error);
    return [];
  }

  return data;
}

const payrollPeriodColumns = [
  {
    key: 'period_name',
    header: 'Period Name',
    render: (item: PayrollPeriod) => <span className="font-medium text-textPrimary">{item.period_name}</span>,
  },
  {
    key: 'period_start_date',
    header: 'Start Date',
    render: (item: PayrollPeriod) => <span className="text-textSecondary text-sm">{item.period_start_date}</span>,
  },
  {
    key: 'period_end_date',
    header: 'End Date',
    render: (item: PayrollPeriod) => <span className="text-textSecondary text-sm">{item.period_end_date}</span>,
  },
  {
    key: 'payment_date',
    header: 'Payment Date',
    render: (item: PayrollPeriod) => <span className="text-textSecondary text-sm">{item.payment_date}</span>,
  },
  {
    key: 'frequency',
    header: 'Frequency',
    render: (item: PayrollPeriod) => <Badge variant="info">{item.frequency}</Badge>,
  },
  {
    key: 'is_closed',
    header: 'Status',
    render: (item: PayrollPeriod) => (
      <Badge variant={item.is_closed ? 'danger' : 'success'}>
        {item.is_closed ? 'Closed' : 'Open'}
      </Badge>
    ),
  },
  {
    key: 'closed_by',
    header: 'Closed By',
    render: (item: PayrollPeriod) => (
      <span className="text-textSubtle text-sm">
        {item.closed_by_user ? `${item.closed_by_user.first_name} ${item.closed_by_user.last_name}` : 'N/A'}
      </span>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item: PayrollPeriod) => (
      <div className="flex space-x-2">
        <Link href={`/admin/payroll-periods/${item.id}/edit`}>
          <Button variant="secondary" size="sm">
            Edit
          </Button>
        </Link>
      </div>
    ),
  },
];

export default async function PayrollPeriodsPage() {
  const payrollPeriods = await getPayrollPeriods();

  return (
    <div className="space-y-8">
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-textPrimary">Payroll Periods</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search payroll periods..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Link href="/admin/payroll-periods/new">
              <Button className="flex items-center space-x-2 text-sm">
                <Plus className="h-4 w-4" />
                <span>Add Payroll Period</span>
              </Button>
            </Link>
          </div>
        </div>
        <DashboardTable data={payrollPeriods} columns={payrollPeriodColumns} />
      </DashboardCard>
    </div>
  );
}

