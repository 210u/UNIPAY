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
import { addDeductionConfig } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Add New Deduction Configuration | University Payroll System',
  description: 'Add a new deduction configuration to the system',
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

export default async function AddDeductionConfigPage() {
  const universityId = await getUniversityId();
  const [calculationMethod, setCalculationMethod] = useState<Database['public']['Enums']['deduction_calculation_method']>('fixed_amount');

  return (
    <div className="space-y-8">
      <Link href="/admin/deductions">
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Deduction Configurations List
        </Button>
      </Link>

      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Add New Deduction Configuration</h1>

        <form className="space-y-6" action={addDeductionConfig}>
          <input type="hidden" name="universityId" value={universityId || ''} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Deduction Name</Label>
              <Input id="name" name="name" type="text" placeholder="Health Insurance" required />
            </div>
            <div>
              <Label htmlFor="code">Deduction Code</Label>
              <Input id="code" name="code" type="text" placeholder="HI" required />
            </div>
            <div>
              <Label htmlFor="deductionType">Deduction Type</Label>
              <Select id="deductionType" name="deductionType" required>
                <option value="tax">Tax</option>
                <option value="benefit">Benefit</option>
                <option value="loan_repayment">Loan Repayment</option>
                <option value="other">Other</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input id="description" name="description" type="text" placeholder="Health insurance premium deduction" />
            </div>
            <div>
              <Label htmlFor="calculationMethod">Calculation Method</Label>
              <Select id="calculationMethod" name="calculationMethod" value={calculationMethod} onChange={(e) => setCalculationMethod(e.target.value as Database['public']['Enums']['deduction_calculation_method'])} required>
                <option value="fixed_amount">Fixed Amount</option>
                <option value="percentage_of_gross">Percentage of Gross Pay</option>
              </Select>
            </div>

            {calculationMethod === 'fixed_amount' && (
              <div>
                <Label htmlFor="fixedAmount">Fixed Amount</Label>
                <Input id="fixedAmount" name="fixedAmount" type="number" step="0.01" placeholder="100.00" required />
              </div>
            )}
            {calculationMethod === 'percentage_of_gross' && (
              <div>
                <Label htmlFor="percentage">Percentage</Label>
                <Input id="percentage" name="percentage" type="number" step="0.01" placeholder="5.00" required />
              </div>
            )}
            
            <div>
              <Label htmlFor="minAmount">Minimum Amount (Optional)</Label>
              <Input id="minAmount" name="minAmount" type="number" step="0.01" />
            </div>
            <div>
              <Label htmlFor="maxAmount">Maximum Amount (Optional)</Label>
              <Input id="maxAmount" name="maxAmount" type="number" step="0.01" />
            </div>
            <div>
              <Label htmlFor="annualMaxAmount">Annual Maximum Amount (Optional)</Label>
              <Input id="annualMaxAmount" name="annualMaxAmount" type="number" step="0.01" />
            </div>
            <div>
              <Label htmlFor="employerContributionPercentage">Employer Contribution Percentage (Optional)</Label>
              <Input id="employerContributionPercentage" name="employerContributionPercentage" type="number" step="0.01" />
            </div>
            <div>
              <Label htmlFor="employerContributionFixed">Employer Contribution Fixed Amount (Optional)</Label>
              <Input id="employerContributionFixed" name="employerContributionFixed" type="number" step="0.01" />
            </div>
            <div>
              <Label htmlFor="isMandatory">Is Mandatory</Label>
              <Select id="isMandatory" name="isMandatory">
                <option value="false">No</option>
                <option value="true">Yes</option>
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
              <Link href="/admin/deductions">
                Cancel
              </Link>
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" /> Add Deduction
            </Button>
          </div>
        </form>
      </DashboardCard>
    </div>
  );
}

