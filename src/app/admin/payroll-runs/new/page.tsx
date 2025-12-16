import React from 'react';
import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import DashboardCard from '@/components/common/DashboardCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Label from '@/components/ui/Label';
import { ChevronLeft, Play } from 'lucide-react';
import Link from 'next/link';
import Select from '@/components/ui/Select';
import { createPayrollRun } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Create Payroll Run | University Payroll System',
  description: 'Initiate a new payroll run',
};

type PayrollPeriod = Database['public']['Tables']['payroll_periods']['Row'];
type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

async function getOpenPayrollPeriods(): Promise<PayrollPeriod[]> {
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

  const { data, error } = await supabase.from('payroll_periods').select('id, period_name').eq('is_closed', false).order('period_start_date', { ascending: true });

  if (error) {
    console.error('Error fetching open payroll periods:', error);
    return [];
  }
  return data;
}

async function getUserProfiles(): Promise<UserProfile[]> {
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

  const { data, error } = await supabase.from('user_profiles').select('id, first_name, last_name, email').order('last_name', { ascending: true });

  if (error) {
    console.error('Error fetching user profiles:', error);
    return [];
  }
  return data;
}

async function getUniversityId(): Promise<string | null> {
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

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error('Error fetching user:', userError);
    return null;
  }

  if (!user) {
    console.warn('No user found to fetch university ID.');
    return null;
  }

  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .select('university_id')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching user profile:', profileError);
    return null;
  }

  return profileData?.university_id || null;
}

export default async function CreatePayrollRunPage() {
  const payrollPeriods = await getOpenPayrollPeriods();
  const userProfiles = await getUserProfiles();
  const universityId = await getUniversityId();

  return (
    <div className="space-y-8">
      <Link href="/admin/payroll-runs">
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Payroll Runs List
        </Button>
      </Link>

      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Create New Payroll Run</h1>

        <form className="space-y-6" action={createPayrollRun}>
          <input type="hidden" name="universityId" value={universityId || ''} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payrollPeriodId">Payroll Period</Label>
              <Select id="payrollPeriodId" name="payrollPeriodId" required>
                <option value="">Select a payroll period</option>
                {payrollPeriods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.period_name} ({period.period_start_date} to {period.period_end_date})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="runNumber">Run Number</Label>
              <Input id="runNumber" name="runNumber" type="text" placeholder="PR-2025-01" required />
            </div>
            <div>
              <Label htmlFor="runDate">Run Date</Label>
              <Input id="runDate" name="runDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
            </div>
            <div>
              <Label htmlFor="ranBy">Ran By</Label>
              <Select id="ranBy" name="ranBy" required>
                <option value="">Select user</option>
                {userProfiles.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input id="notes" name="notes" type="text" placeholder="Any additional notes for this run" />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button type="button" variant="secondary" asChild>
              <Link href="/admin/payroll-runs">
                Cancel
              </Link>
            </Button>
            <Button type="submit">
              <Play className="h-4 w-4 mr-2" /> Create Payroll Run
            </Button>
          </div>
        </form>
      </DashboardCard>
    </div>
  );
}

