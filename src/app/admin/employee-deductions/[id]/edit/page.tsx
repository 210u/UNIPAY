import React, { useState, useEffect } from 'react';
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
import { updateEmployeeDeduction } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit Employee Deduction | University Payroll System',
  description: 'Edit an existing employee deduction record',
};

type Employee = Database['public']['Tables']['employees']['Row'] & {
  user_profiles: Database['public']['Tables']['user_profiles']['Row'] | null;
};

type DeductionConfig = Database['public']['Tables']['deduction_configs']['Row'];

type EmployeeDeduction = Database['public']['Tables']['employee_deductions']['Row'];

async function getEmployeeDeductionDetails(employeeDeductionId: string): Promise<EmployeeDeduction | null> {
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
    .from('employee_deductions')
    .select('*')
    .eq('id', employeeDeductionId)
    .single();

  if (error) {
    console.error('Error fetching employee deduction details:', error);
    return null;
  }

  return data;
}

async function getEmployees(): Promise<Employee[]> {
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

  const { data, error } = await supabase.from('employees').select('id, user_profiles(first_name, last_name, email)').order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
  return data;
}

async function getDeductionConfigs(): Promise<DeductionConfig[]> {
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

  const { data, error } = await supabase.from('deduction_configs').select('id, name, code, calculation_method').order('name', { ascending: true });

  if (error) {
    console.error('Error fetching deduction configurations:', error);
    return [];
  }
  return data;
}

export default async function EditEmployeeDeductionPage({ params }: { params: { id: string } }) {
  const employeeDeduction = await getEmployeeDeductionDetails(params.id);
  const employees = await getEmployees();
  const deductionConfigs = await getDeductionConfigs();

  if (!employeeDeduction) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Employee Deduction Not Found</h1>
        <p className="text-textSecondary">The employee deduction you are looking for does not exist.</p>
        <Link href="/admin/employee-deductions" className="mt-4 inline-block">
          <Button>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Employee Deductions List
          </Button>
        </Link>
      </div>
    );
  }

  const [selectedDeductionConfigId, setSelectedDeductionConfigId] = useState<string | null>(employeeDeduction.deduction_config_id);
  const [calculationMethod, setCalculationMethod] = useState<Database['public']['Enums']['deduction_calculation_method'] | null>(null);

  useEffect(() => {
    if (selectedDeductionConfigId) {
      const config = deductionConfigs.find(dc => dc.id === selectedDeductionConfigId);
      if (config) {
        setCalculationMethod(config.calculation_method);
      }
    } else {
      setCalculationMethod(null);
    }
  }, [selectedDeductionConfigId, deductionConfigs]);

  return (
    <div className="space-y-8">
      <Link href="/admin/employee-deductions">
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Employee Deductions List
        </Button>
      </Link>

      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Edit Employee Deduction</h1>

        <form className="space-y-6" action={updateEmployeeDeduction}>
          <input type="hidden" name="id" value={employeeDeduction.id} />
          <input type="hidden" name="calculationMethod" value={calculationMethod || ''} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeId">Employee</Label>
              <Select id="employeeId" name="employeeId" required defaultValue={employeeDeduction.employee_id || ''}>
                <option value="">Select an employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.user_profiles?.first_name} {emp.user_profiles?.last_name} ({emp.user_profiles?.email})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="deductionConfigId">Deduction Configuration</Label>
              <Select id="deductionConfigId" name="deductionConfigId" required defaultValue={selectedDeductionConfigId || ''} onChange={(e) => setSelectedDeductionConfigId(e.target.value)}>
                <option value="">Select a deduction config</option>
                {deductionConfigs.map((config) => (
                  <option key={config.id} value={config.id}>
                    {config.name} ({config.code})
                  </option>
                ))}
              </Select>
            </div>
            
            {calculationMethod === 'fixed_amount' && (
              <div>
                <Label htmlFor="customAmount">Custom Amount (Optional)</Label>
                <Input id="customAmount" name="customAmount" type="number" step="0.01" placeholder="50.00" defaultValue={employeeDeduction.custom_amount || ''} />
              </div>
            )}
            {calculationMethod === 'percentage_of_gross' && (
              <div>
                <Label htmlFor="customPercentage">Custom Percentage (Optional)</Label>
                <Input id="customPercentage" name="customPercentage" type="number" step="0.01" placeholder="2.50" defaultValue={employeeDeduction.custom_percentage || ''} />
              </div>
            )}

            <div>
              <Label htmlFor="effectiveFrom">Effective From</Label>
              <Input id="effectiveFrom" name="effectiveFrom" type="date" required defaultValue={employeeDeduction.effective_from || ''} />
            </div>
            <div>
              <Label htmlFor="effectiveTo">Effective To (Optional)</Label>
              <Input id="effectiveTo" name="effectiveTo" type="date" defaultValue={employeeDeduction.effective_to || ''} />
            </div>
            <div>
              <Label htmlFor="isActive">Is Active</Label>
              <Select id="isActive" name="isActive" defaultValue={employeeDeduction.is_active ? 'true' : 'false'}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input id="notes" name="notes" type="text" placeholder="Any additional notes" defaultValue={employeeDeduction.notes || ''} />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button type="button" variant="secondary" asChild>
              <Link href="/admin/employee-deductions">
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

