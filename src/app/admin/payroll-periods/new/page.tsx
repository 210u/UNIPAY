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
import { addPayrollPeriod } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Add New Payroll Period | University Payroll System',
  description: 'Add a new payroll period to the system',
};

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

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

export default async function AddPayrollPeriodPage() {
  const userProfiles = await getUserProfiles();
  const universityId = await getUniversityId();

  return (
    <div className="space-y-8">
      <Link href="/admin/payroll-periods">
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Payroll Periods List
        </Button>
      </Link>

      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Add New Payroll Period</h1>

        <form className="space-y-6" action={addPayrollPeriod}>
          <input type="hidden" name="universityId" value={universityId || ''} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="periodName">Period Name</Label>
              <Input id="periodName" name="periodName" type="text" placeholder="January 2025 Payroll" required />
            </div>
            <div>
              <Label htmlFor="periodStartDate">Period Start Date</Label>
              <Input id="periodStartDate" name="periodStartDate" type="date" required />
            </div>
            <div>
              <Label htmlFor="periodEndDate">Period End Date</Label>
              <Input id="periodEndDate" name="periodEndDate" type="date" required />
            </div>
            <div>
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input id="paymentDate" name="paymentDate" type="date" required />
            </div>
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select id="frequency" name="frequency" required>
                <option value="weekly">Weekly</option>
                <option value="bi_weekly">Bi-Weekly</option>
                <option value="semi_monthly">Semi-Monthly</option>
                <option value="monthly">Monthly</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="isClosed">Is Closed</Label>
              <Select id="isClosed" name="isClosed">
                <option value="false">No</option>
                <option value="true">Yes</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="closedAt">Closed At (Optional)</Label>
              <Input id="closedAt" name="closedAt" type="datetime-local" />
            </div>
            <div>
              <Label htmlFor="closedBy">Closed By (Optional)</Label>
              <Select id="closedBy" name="closedBy">
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
              <Save className="h-4 w-4 mr-2" /> Add Payroll Period
            </Button>
          </div>
        </form>
      </DashboardCard>
    </div>
  );
}

