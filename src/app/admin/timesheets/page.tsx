import React from 'react';
import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import DashboardCard from '@/components/common/DashboardCard';
import DashboardTable from '@/components/common/DashboardTable';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Search, Filter } from 'lucide-react';
import { timesheetColumns } from './components/timesheetColumns';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Timesheet Management | University Payroll System',
  description: 'View and approve employee timesheets',
};

type Timesheet = Database['public']['Tables']['timesheets']['Row'] & {
  employees: (Database['public']['Tables']['employees']['Row'] & {
    user_profiles: Database['public']['Tables']['user_profiles']['Row'] | null;
  }) | null;
  approved_by_user: Database['public']['Tables']['user_profiles']['Row'] | null;
};

async function getTimesheets(): Promise<Timesheet[]> {
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
    .from('timesheets')
    .select(
      `
        *,
        employees(user_profiles(first_name, last_name)),
        approved_by_user:user_profiles(first_name, last_name)
      `
    )
    .order('submission_date', { ascending: false });

  if (error) {
    console.error('Error fetching timesheets:', error);
    return [];
  }

  return data;
}


export default async function TimesheetManagementPage() {
  const timesheets = await getTimesheets();

  return (
    <div className="space-y-8">
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-textPrimary">Timesheet Management</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search timesheets..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Button variant="secondary" className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>
        <DashboardTable data={timesheets} columns={timesheetColumns} />
      </DashboardCard>
    </div>
  );
}

