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
import { payrollRunColumns, PayrollRun } from './components/payrollRunColumns';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Payroll Runs | University Payroll System',
  description: 'Manage payroll runs',
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