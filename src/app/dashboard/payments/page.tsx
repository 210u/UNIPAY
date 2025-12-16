import React from 'react';
import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import DashboardCard from '@/components/common/DashboardCard';
import DashboardTable from '@/components/common/DashboardTable';
import Button from '@/components/ui/Button';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { getEmployeePayments } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Payments | University Payroll System',
  description: 'View your payment history and payslips',
};

type PayrollPayment = Database['public']['Tables']['payroll_payments']['Row'] & {
  payroll_runs: (Database['public']['Tables']['payroll_runs']['Row'] & {
    payroll_periods: Database['public']['Tables']['payroll_periods']['Row'] | null;
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

const paymentColumns = [
  {
    key: 'payment_date',
    header: 'Payment Date',
    render: (item: PayrollPayment) => <span className="font-medium text-textPrimary">{item.payment_date}</span>,
  },
  {
    key: 'payroll_period',
    header: 'Payroll Period',
    render: (item: PayrollPayment) => <span className="text-textSecondary text-sm">{item.payroll_runs?.payroll_periods?.period_name || 'N/A'}</span>,
  },
  {
    key: 'gross_pay',
    header: 'Gross Pay',
    render: (item: PayrollPayment) => <span className="text-textSecondary text-sm">${item.gross_pay?.toFixed(2) || '0.00'}</span>,
  },
  {
    key: 'net_pay',
    header: 'Net Pay',
    render: (item: PayrollPayment) => <span className="text-textSecondary text-sm">${item.net_pay?.toFixed(2) || '0.00'}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (item: PayrollPayment) => <Badge variant={item.status === 'paid' ? 'success' : 'warning'}>{item.status}</Badge>,
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item: PayrollPayment) => (
      <div className="flex space-x-2">
        <Link href={`/dashboard/payments/${item.id}`}>
          <Button variant="secondary" size="sm">
            <Eye className="h-4 w-4 mr-1" /> View Payslip
          </Button>
        </Link>
      </div>
    ),
  },
];

export default async function EmployeePaymentsPage() {
  const employeeId = await getCurrentEmployeeId();

  if (!employeeId) {
    redirect('/signin'); // Or a page indicating profile setup is incomplete
  }

  const payments = await getEmployeePayments(employeeId, 100); // Fetch up to 100 recent payments

  return (
    <div className="space-y-8">
      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">My Payments</h1>
        <DashboardTable data={payments} columns={paymentColumns} />
      </DashboardCard>
    </div>
  );
}

