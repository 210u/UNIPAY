import React from 'react';
import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import DashboardCard from '@/components/common/DashboardCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ChevronLeft, DollarSign, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Payslip Details | University Payroll System',
  description: 'View details of a specific payslip',
};

type PayrollPayment = Database['public']['Tables']['payroll_payments']['Row'] & {
  payroll_runs: (Database['public']['Tables']['payroll_runs']['Row'] & {
    payroll_periods: Database['public']['Tables']['payroll_periods']['Row'] | null;
  }) | null;
  employee_allowances: Database['public']['Tables']['payment_allowances']['Row'][];
  employee_deductions: Database['public']['Tables']['payment_deductions']['Row'][];
};

async function getPayslipDetails(paymentId: string): Promise<PayrollPayment | null> {
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
    .from('payroll_payments')
    .select(
      `
        *,
        payroll_runs(*, payroll_periods(*)),
        employee_allowances:payment_allowances(*),
        employee_deductions:payment_deductions(*)
      `
    )
    .eq('id', paymentId)
    .single();

  if (error) {
    console.error('Error fetching payslip details:', error);
    return null;
  }

  return data;
}

export default async function PayslipDetailPage({ params }: { params: { id: string } }) {
  const payslip = await getPayslipDetails(params.id);

  if (!payslip) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Payslip Not Found</h1>
        <p className="text-textSecondary">The payslip you are looking for does not exist.</p>
        <Link href="/dashboard/payments" className="mt-4 inline-block">
          <Button>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to My Payments
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/dashboard/payments">
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to My Payments
        </Button>
      </Link>

      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Payslip for {payslip.payroll_runs?.payroll_periods?.period_name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
            <div className="space-y-3">
              <p className="flex items-center text-textSecondary">
                <FileText className="h-4 w-4 mr-2 text-textAccent" />
                Payment Date: <span className="font-medium ml-1">{payslip.payment_date}</span>
              </p>
              <p className="flex items-center text-textSecondary">
                <DollarSign className="h-4 w-4 mr-2 text-textAccent" />
                Gross Pay: <span className="font-medium ml-1">${payslip.gross_pay?.toFixed(2) || '0.00'}</span>
              </p>
              <p className="flex items-center text-textSecondary">
                <DollarSign className="h-4 w-4 mr-2 text-textAccent" />
                Net Pay: <span className="font-medium ml-1">${payslip.net_pay?.toFixed(2) || '0.00'}</span>
              </p>
              <p className="flex items-center text-textSecondary">
                Status:
                <Badge variant={payslip.status === 'paid' ? 'success' : 'warning'} className="ml-2">
                  {payslip.status}
                </Badge>
              </p>
              <p className="text-textSecondary">
                Notes: <span className="font-medium ml-1">{payslip.notes || 'N/A'}</span>
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Payroll Period Details</h2>
            <div className="space-y-3">
              <p className="flex items-center text-textSecondary">
                <Calendar className="h-4 w-4 mr-2 text-textAccent" />
                Period Name: <span className="font-medium ml-1">{payslip.payroll_runs?.payroll_periods?.period_name || 'N/A'}</span>
              </p>
              <p className="flex items-center text-textSecondary">
                <Calendar className="h-4 w-4 mr-2 text-textAccent" />
                Start Date: <span className="font-medium ml-1">{payslip.payroll_runs?.payroll_periods?.period_start_date || 'N/A'}</span>
              </p>
              <p className="flex items-center text-textSecondary">
                <Calendar className="h-4 w-4 mr-2 text-textAccent" />
                End Date: <span className="font-medium ml-1">{payslip.payroll_runs?.payroll_periods?.period_end_date || 'N/A'}</span>
              </p>
            </div>
          </div>
        </div>

        {payslip.employee_allowances.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Allowances</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">Allowance Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payslip.employee_allowances.map((allowance) => (
                    <tr key={allowance.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-textPrimary">{allowance.allowance_name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-textSecondary">${allowance.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {payslip.employee_deductions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Deductions</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">Deduction Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payslip.employee_deductions.map((deduction) => (
                    <tr key={deduction.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-textPrimary">{deduction.deduction_name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-textSecondary">${deduction.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </DashboardCard>
    </div>
  );
}

