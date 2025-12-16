import React from 'react';
import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import DashboardCard from '@/components/common/DashboardCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ChevronLeft, FileText, Calendar, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Payroll Run Details | University Payroll System',
  description: 'View details of a specific payroll run',
};

type PayrollRun = Database['public']['Tables']['payroll_runs']['Row'] & {
  payroll_periods: Database['public']['Tables']['payroll_periods']['Row'] | null;
  ran_by_user: Database['public']['Tables']['user_profiles']['Row'] | null;
};

async function getPayrollRunDetails(runId: string): Promise<PayrollRun | null> {
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
        payroll_periods(*),
        ran_by_user:user_profiles(first_name, last_name, email)
      `
    )
    .eq('id', runId)
    .single();

  if (error) {
    console.error('Error fetching payroll run details:', error);
    return null;
  }

  return data;
}

export default async function PayrollRunDetailPage({ params }: { params: { id: string } }) {
  const payrollRun = await getPayrollRunDetails(params.id);

  if (!payrollRun) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Payroll Run Not Found</h1>
        <p className="text-textSecondary">The payroll run you are looking for does not exist.</p>
        <Link href="/admin/payroll-runs" className="mt-4 inline-block">
          <Button>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Payroll Runs List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/admin/payroll-runs">
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Payroll Runs List
        </Button>
      </Link>

      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Payroll Run: {payrollRun.run_number}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Run Details</h2>
            <div className="space-y-3">
              <p className="flex items-center text-textSecondary">
                <FileText className="h-4 w-4 mr-2 text-textAccent" />
                Run Number: <span className="font-medium ml-1">{payrollRun.run_number}</span>
              </p>
              <p className="flex items-center text-textSecondary">
                <Calendar className="h-4 w-4 mr-2 text-textAccent" />
                Run Date: <span className="font-medium ml-1">{new Date(payrollRun.run_date).toLocaleDateString()}</span>
              </p>
              <p className="flex items-center text-textSecondary">
                <Users className="h-4 w-4 mr-2 text-textAccent" />
                Ran By: <span className="font-medium ml-1">{payrollRun.ran_by_user?.first_name} {payrollRun.ran_by_user?.last_name}</span>
              </p>
              <p className="flex items-center text-textSecondary">
                Status:
                <Badge variant={payrollRun.status === 'completed' ? 'success' : 'warning'} className="ml-2">
                  {payrollRun.status}
                </Badge>
              </p>
              <p className="text-textSecondary">
                Notes: <span className="font-medium ml-1">{payrollRun.notes || 'N/A'}</span>
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Payroll Period</h2>
            <div className="space-y-3">
              <p className="flex items-center text-textSecondary">
                <Calendar className="h-4 w-4 mr-2 text-textAccent" />
                Period Name: <span className="font-medium ml-1">{payrollRun.payroll_periods?.period_name || 'N/A'}</span>
              </p>
              <p className="flex items-center text-textSecondary">
                <Calendar className="h-4 w-4 mr-2 text-textAccent" />
                Start Date: <span className="font-medium ml-1">{payrollRun.payroll_periods?.period_start_date || 'N/A'}</span>
              </p>
              <p className="flex items-center text-textSecondary">
                <Calendar className="h-4 w-4 mr-2 text-textAccent" />
                End Date: <span className="font-medium ml-1">{payrollRun.payroll_periods?.period_end_date || 'N/A'}</span>
              </p>
              <p className="flex items-center text-textSecondary">
                <Calendar className="h-4 w-4 mr-2 text-textAccent" />
                Payment Date: <span className="font-medium ml-1">{payrollRun.payroll_periods?.payment_date || 'N/A'}</span>
              </p>
              <p className="flex items-center text-textSecondary">
                Frequency: <Badge variant="info" className="ml-1">{payrollRun.payroll_periods?.frequency || 'N/A'}</Badge>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
              <div>
                <p className="text-sm text-textSecondary">Employees Processed</p>
                <p className="text-2xl font-bold">{payrollRun.total_employees_processed}</p>
              </div>
              <Users className="h-8 w-8 text-textAccent" />
            </div>
            <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
              <div>
                <p className="text-sm text-textSecondary">Total Gross Pay</p>
                <p className="text-2xl font-bold">${payrollRun.total_gross_pay.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-textAccent" />
            </div>
            <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
              <div>
                <p className="text-sm text-textSecondary">Total Net Pay</p>
                <p className="text-2xl font-bold">${payrollRun.total_net_pay.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-textAccent" />
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* TODO: Add sections for processed payments and audit logs related to this run */}

    </div>
  );
}

