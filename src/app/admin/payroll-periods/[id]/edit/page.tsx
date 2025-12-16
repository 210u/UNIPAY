import React from 'react';
import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import DashboardCard from '@/components/common/DashboardCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Label from '@/components/ui/Label';
import { ChevronLeft, Save } from 'lucide-react';
import Link from 'next/link';
import Select from '@/components/ui/Select';
import { updatePayrollPeriod } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit Payroll Period | University Payroll System',
  description: 'Edit an existing payroll period record',
};

type PayrollPeriod = Database['public']['Tables']['payroll_periods']['Row'];
type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

async function getPayrollPeriodDetails(payrollPeriodId: string): Promise<PayrollPeriod | null> {
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
    .select('*')
    .eq('id', payrollPeriodId)
    .single();

  if (error) {
    console.error('Error fetching payroll period details:', error);
    return null;
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

export default async function EditPayrollPeriodPage({ params }: { params: { id: string } }) {
  const payrollPeriod = await getPayrollPeriodDetails(params.id);
  const userProfiles = await getUserProfiles();

  if (!payrollPeriod) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Payroll Period Not Found</h1>
        <p className="text-textSecondary">The payroll period you are looking for does not exist.</p>
        <Link href="/admin/payroll-periods" className="mt-4 inline-block">
          <Button>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Payroll Periods List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/admin/payroll-periods">
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Payroll Periods List
        </Button>
      </Link>

      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Edit Payroll Period: {payrollPeriod.period_name}</h1>

        <form className="space-y-6" action={updatePayrollPeriod}>
          <input type="hidden" name="id" value={payrollPeriod.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="periodName">Period Name</Label>
              <Input id="periodName" name="periodName" type="text" placeholder="January 2025 Payroll" required defaultValue={payrollPeriod.period_name || ''} />
            </div>
            <div>
              <Label htmlFor="periodStartDate">Period Start Date</Label>
              <Input id="periodStartDate" name="periodStartDate" type="date" required defaultValue={payrollPeriod.period_start_date || ''} />
            </div>
            <div>
              <Label htmlFor="periodEndDate">Period End Date</Label>
              <Input id="periodEndDate" name="periodEndDate" type="date" required defaultValue={payrollPeriod.period_end_date || ''} />
            </div>
            <div>
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input id="paymentDate" name="paymentDate" type="date" required defaultValue={payrollPeriod.payment_date || ''} />
            </div>
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select id="frequency" name="frequency" required defaultValue={payrollPeriod.frequency || ''}>
                <option value="weekly">Weekly</option>
                <option value="bi_weekly">Bi-Weekly</option>
                <option value="semi_monthly">Semi-Monthly</option>
                <option value="monthly">Monthly</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="isClosed">Is Closed</Label>
              <Select id="isClosed" name="isClosed" defaultValue={payrollPeriod.is_closed ? 'true' : 'false'}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="closedAt">Closed At (Optional)</Label>
              <Input id="closedAt" name="closedAt" type="datetime-local" defaultValue={payrollPeriod.closed_at ? new Date(payrollPeriod.closed_at).toISOString().slice(0, 16) : ''} />
            </div>
            <div>
              <Label htmlFor="closedBy">Closed By (Optional)</Label>
              <Select id="closedBy" name="closedBy" defaultValue={payrollPeriod.closed_by || ''}>
                <option value="">Select user</option>
                {userProfiles.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button type="button" variant="secondary" asChild>
              <Link href="/admin/payroll-periods">
                Cancel
              </Link>
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        </form>
      </DashboardCard>
    </div>
  );
}

