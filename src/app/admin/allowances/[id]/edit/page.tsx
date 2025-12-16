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
import { updateAllowanceConfig } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit Allowance Configuration | University Payroll System',
  description: 'Edit an existing allowance configuration record',
};

type AllowanceConfig = Database['public']['Tables']['allowance_configs']['Row'];

async function getAllowanceConfigDetails(allowanceConfigId: string): Promise<AllowanceConfig | null> {
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
    .from('allowance_configs')
    .select('*')
    .eq('id', allowanceConfigId)
    .single();

  if (error) {
    console.error('Error fetching allowance config details:', error);
    return null;
  }

  return data;
}

export default async function EditAllowanceConfigPage({ params }: { params: { id: string } }) {
  const allowanceConfig = await getAllowanceConfigDetails(params.id);

  if (!allowanceConfig) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Allowance Configuration Not Found</h1>
        <p className="text-textSecondary">The allowance configuration you are looking for does not exist.</p>
        <Link href="/admin/allowances" className="mt-4 inline-block">
          <Button>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Allowance Configurations List
          </Button>
        </Link>
      </div>
    );
  }

  const [calculationMethod, setCalculationMethod] = useState<Database['public']['Enums']['allowance_calculation_method']>(allowanceConfig.calculation_method);

  return (
    <div className="space-y-8">
      <Link href="/admin/allowances">
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Allowance Configurations List
        </Button>
      </Link>

      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Edit Allowance Configuration: {allowanceConfig.name}</h1>

        <form className="space-y-6" action={updateAllowanceConfig}>
          <input type="hidden" name="id" value={allowanceConfig.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Allowance Name</Label>
              <Input id="name" name="name" type="text" placeholder="Housing Allowance" required defaultValue={allowanceConfig.name || ''} />
            </div>
            <div>
              <Label htmlFor="code">Allowance Code</Label>
              <Input id="code" name="code" type="text" placeholder="HA" required defaultValue={allowanceConfig.code || ''} />
            </div>
            <div>
              <Label htmlFor="allowanceType">Allowance Type</Label>
              <Select id="allowanceType" name="allowanceType" required defaultValue={allowanceConfig.allowance_type || ''}>
                <option value="fixed">Fixed</option>
                <option value="recurring">Recurring</option>
                <option value="one-time">One-time</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input id="description" name="description" type="text" placeholder="Allowance for employee housing" defaultValue={allowanceConfig.description || ''} />
            </div>
            <div>
              <Label htmlFor="calculationMethod">Calculation Method</Label>
              <Select id="calculationMethod" name="calculationMethod" value={calculationMethod} onChange={(e) => setCalculationMethod(e.target.value as Database['public']['Enums']['allowance_calculation_method'])} required defaultValue={allowanceConfig.calculation_method || ''}>
                <option value="fixed_amount">Fixed Amount</option>
                <option value="percentage_of_base">Percentage of Base Salary</option>
              </Select>
            </div>

            {calculationMethod === 'fixed_amount' && (
              <div>
                <Label htmlFor="defaultAmount">Default Amount</Label>
                <Input id="defaultAmount" name="defaultAmount" type="number" step="0.01" placeholder="500.00" required defaultValue={allowanceConfig.default_amount || 0} />
              </div>
            )}
            {calculationMethod === 'percentage_of_base' && (
              <div>
                <Label htmlFor="defaultPercentage">Default Percentage</Label>
                <Input id="defaultPercentage" name="defaultPercentage" type="number" step="0.01" placeholder="10.00" required defaultValue={allowanceConfig.default_percentage || 0} />
              </div>
            )}
            
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select id="frequency" name="frequency" required defaultValue={allowanceConfig.frequency || ''}>
                <option value="per_pay_period">Per Pay Period</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
                <option value="one_time">One-time</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="isTaxable">Is Taxable</Label>
              <Select id="isTaxable" name="isTaxable" defaultValue={allowanceConfig.is_taxable ? 'true' : 'false'}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="isActive">Is Active</Label>
              <Select id="isActive" name="isActive" defaultValue={allowanceConfig.is_active ? 'true' : 'false'}>
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
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        </form>
      </DashboardCard>
    </div>
  );
}

