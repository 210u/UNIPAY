import React, { useState } from 'react';
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
import { addAllowanceConfig } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Add New Allowance Configuration | University Payroll System',
  description: 'Add a new allowance configuration to the system',
};

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

export default async function AddAllowanceConfigPage() {
  const universityId = await getUniversityId();
  const [calculationMethod, setCalculationMethod] = useState<Database['public']['Enums']['allowance_calculation_method']>('fixed_amount');

  return (
    <div className="space-y-8">
      <Link href="/admin/allowances">
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Allowance Configurations List
        </Button>
      </Link>

      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Add New Allowance Configuration</h1>

        <form className="space-y-6" action={addAllowanceConfig}>
          <input type="hidden" name="universityId" value={universityId || ''} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Allowance Name</Label>
              <Input id="name" name="name" type="text" placeholder="Housing Allowance" required />
            </div>
            <div>
              <Label htmlFor="code">Allowance Code</Label>
              <Input id="code" name="code" type="text" placeholder="HA" required />
            </div>
            <div>
              <Label htmlFor="allowanceType">Allowance Type</Label>
              <Select id="allowanceType" name="allowanceType" required>
                <option value="fixed">Fixed</option>
                <option value="recurring">Recurring</option>
                <option value="one-time">One-time</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input id="description" name="description" type="text" placeholder="Allowance for employee housing" />
            </div>
            <div>
              <Label htmlFor="calculationMethod">Calculation Method</Label>
              <Select id="calculationMethod" name="calculationMethod" value={calculationMethod} onChange={(e) => setCalculationMethod(e.target.value as Database['public']['Enums']['allowance_calculation_method'])} required>
                <option value="fixed_amount">Fixed Amount</option>
                <option value="percentage_of_base">Percentage of Base Salary</option>
              </Select>
            </div>

            {calculationMethod === 'fixed_amount' && (
              <div>
                <Label htmlFor="defaultAmount">Default Amount</Label>
                <Input id="defaultAmount" name="defaultAmount" type="number" step="0.01" placeholder="500.00" required />
              </div>
            )}
            {calculationMethod === 'percentage_of_base' && (
              <div>
                <Label htmlFor="defaultPercentage">Default Percentage</Label>
                <Input id="defaultPercentage" name="defaultPercentage" type="number" step="0.01" placeholder="10.00" required />
              </div>
            )}
            
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select id="frequency" name="frequency" required>
                <option value="per_pay_period">Per Pay Period</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
                <option value="one_time">One-time</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="isTaxable">Is Taxable</Label>
              <Select id="isTaxable" name="isTaxable">
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="isActive">Is Active</Label>
              <Select id="isActive" name="isActive">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button type="button" variant="secondary" asChild>
              <Link href="/admin/allowances">
                Cancel
              </Link>
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" /> Add Allowance
            </Button>
          </div>
        </form>
      </DashboardCard>
    </div>
  );
}

