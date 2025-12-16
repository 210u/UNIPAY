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
import { updateDeductionConfig } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit Deduction Configuration | University Payroll System',
  description: 'Edit an existing deduction configuration record',
};

type DeductionConfig = Database['public']['Tables']['deduction_configs']['Row'];

async function getDeductionConfigDetails(deductionConfigId: string): Promise<DeductionConfig | null> {
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
    .from('deduction_configs')
    .select('*')
    .eq('id', deductionConfigId)
    .single();

  if (error) {
    console.error('Error fetching deduction config details:', error);
    return null;
  }

  return data;
}

export default async function EditDeductionConfigPage({ params }: { params: { id: string } }) {
  const deductionConfig = await getDeductionConfigDetails(params.id);

  if (!deductionConfig) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Deduction Configuration Not Found</h1>
        <p className="text-textSecondary">The deduction configuration you are looking for does not exist.</p>
        <Link href="/admin/deductions" className="mt-4 inline-block">
          <Button>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Deduction Configurations List
          </Button>
        </Link>
      </div>
    );
  }

  const [calculationMethod, setCalculationMethod] = useState<Database['public']['Enums']['deduction_calculation_method']>(deductionConfig.calculation_method);

  return (
    <div className="space-y-8">
      <Link href="/admin/deductions">
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Deduction Configurations List
        </Button>
      </Link>

      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Edit Deduction Configuration: {deductionConfig.name}</h1>

        <form className="space-y-6" action={updateDeductionConfig}>
          <input type="hidden" name="id" value={deductionConfig.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Deduction Name</Label>
              <Input id="name" name="name" type="text" placeholder="Health Insurance" required defaultValue={deductionConfig.name || ''} />
            </div>
            <div>
              <Label htmlFor="code">Deduction Code</Label>
              <Input id="code" name="code" type="text" placeholder="HI" required defaultValue={deductionConfig.code || ''} />
            </div>
            <div>
              <Label htmlFor="deductionType">Deduction Type</Label>
              <Select id="deductionType" name="deductionType" required defaultValue={deductionConfig.deduction_type || ''}>
                <option value="tax">Tax</option>
                <option value="benefit">Benefit</option>
                <option value="loan_repayment">Loan Repayment</option>
                <option value="other">Other</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input id="description" name="description" type="text" placeholder="Health insurance premium deduction" defaultValue={deductionConfig.description || ''} />
            </div>
            <div>
              <Label htmlFor="calculationMethod">Calculation Method</Label>
              <Select id="calculationMethod" name="calculationMethod" value={calculationMethod} onChange={(e) => setCalculationMethod(e.target.value as Database['public']['Enums']['deduction_calculation_method'])} required defaultValue={deductionConfig.calculation_method || ''}>
                <option value="fixed_amount">Fixed Amount</option>
                <option value="percentage_of_gross">Percentage of Gross Pay</option>
              </Select>
            </div>

            {calculationMethod === 'fixed_amount' && (
              <div>
                <Label htmlFor="fixedAmount">Fixed Amount</Label>
                <Input id="fixedAmount" name="fixedAmount" type="number" step="0.01" placeholder="100.00" required defaultValue={deductionConfig.fixed_amount || 0} />
              </div>
            )}
            {calculationMethod === 'percentage_of_gross' && (
              <div>
                <Label htmlFor="percentage">Percentage</Label>
                <Input id="percentage" name="percentage" type="number" step="0.01" placeholder="5.00" required defaultValue={deductionConfig.percentage || 0} />
              </div>
            )}
            
            <div>
              <Label htmlFor="minAmount">Minimum Amount (Optional)</Label>
              <Input id="minAmount" name="minAmount" type="number" step="0.01" defaultValue={deductionConfig.min_amount || ''} />
            </div>
            <div>
              <Label htmlFor="maxAmount">Maximum Amount (Optional)</Label>
              <Input id="maxAmount" name="maxAmount" type="number" step="0.01" defaultValue={deductionConfig.max_amount || ''} />
            </div>
            <div>
              <Label htmlFor="annualMaxAmount">Annual Maximum Amount (Optional)</Label>
              <Input id="annualMaxAmount" name="annualMaxAmount" type="number" step="0.01" defaultValue={deductionConfig.annual_max_amount || ''} />
            </div>
            <div>
              <Label htmlFor="employerContributionPercentage">Employer Contribution Percentage (Optional)</Label>
              <Input id="employerContributionPercentage" name="employerContributionPercentage" type="number" step="0.01" defaultValue={deductionConfig.employer_contribution_percentage || ''} />
            </div>
            <div>
              <Label htmlFor="employerContributionFixed">Employer Contribution Fixed Amount (Optional)</Label>
              <Input id="employerContributionFixed" name="employerContributionFixed" type="number" step="0.01" defaultValue={deductionConfig.employer_contribution_fixed || ''} />
            </div>
            <div>
              <Label htmlFor="isMandatory">Is Mandatory</Label>
              <Select id="isMandatory" name="isMandatory" defaultValue={deductionConfig.is_mandatory ? 'true' : 'false'}>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="isActive">Is Active</Label>
              <Select id="isActive" name="isActive" defaultValue={deductionConfig.is_active ? 'true' : 'false'}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button type="button" variant="secondary" asChild>
              <Link href="/admin/deductions">
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

