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
import { updateSalaryGrade } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit Salary Grade | University Payroll System',
  description: 'Edit an existing salary grade record',
};

type SalaryGrade = Database['public']['Tables']['salary_grades']['Row'];

async function getSalaryGradeDetails(salaryGradeId: string): Promise<SalaryGrade | null> {
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
    .from('salary_grades')
    .select('*')
    .eq('id', salaryGradeId)
    .single();

  if (error) {
    console.error('Error fetching salary grade details:', error);
    return null;
  }

  return data;
}

export default async function EditSalaryGradePage({ params }: { params: { id: string } }) {
  const salaryGrade = await getSalaryGradeDetails(params.id);

  if (!salaryGrade) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Salary Grade Not Found</h1>
        <p className="text-textSecondary">The salary grade you are looking for does not exist.</p>
        <Link href="/admin/salary-grades" className="mt-4 inline-block">
          <Button>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Salary Grades List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/admin/salary-grades">
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Salary Grades List
        </Button>
      </Link>

      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Edit Salary Grade: {salaryGrade.grade_name}</h1>

        <form className="space-y-6" action={updateSalaryGrade}>
          <input type="hidden" name="id" value={salaryGrade.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gradeName">Grade Name</Label>
              <Input id="gradeName" name="gradeName" type="text" placeholder="Associate Professor" required defaultValue={salaryGrade.grade_name || ''} />
            </div>
            <div>
              <Label htmlFor="gradeLevel">Grade Level</Label>
              <Input id="gradeLevel" name="gradeLevel" type="number" placeholder="5" required defaultValue={salaryGrade.grade_level || 0} />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input id="description" name="description" type="text" placeholder="Salary grade for associate professors" defaultValue={salaryGrade.description || ''} />
            </div>
            <div>
              <Label htmlFor="minSalary">Minimum Salary</Label>
              <Input id="minSalary" name="minSalary" type="number" step="0.01" placeholder="60000.00" required defaultValue={salaryGrade.min_salary || 0} />
            </div>
            <div>
              <Label htmlFor="midSalary">Midpoint Salary</Label>
              <Input id="midSalary" name="midSalary" type="number" step="0.01" placeholder="80000.00" required defaultValue={salaryGrade.mid_salary || 0} />
            </div>
            <div>
              <Label htmlFor="maxSalary">Maximum Salary</Label>
              <Input id="maxSalary" name="maxSalary" type="number" step="0.01" placeholder="100000.00" required defaultValue={salaryGrade.max_salary || 0} />
            </div>
            <div>
              <Label htmlFor="minHourlyRate">Minimum Hourly Rate (Optional)</Label>
              <Input id="minHourlyRate" name="minHourlyRate" type="number" step="0.01" placeholder="30.00" defaultValue={salaryGrade.min_hourly_rate || ''} />
            </div>
            <div>
              <Label htmlFor="maxHourlyRate">Maximum Hourly Rate (Optional)</Label>
              <Input id="maxHourlyRate" name="maxHourlyRate" type="number" step="0.01" placeholder="50.00" defaultValue={salaryGrade.max_hourly_rate || ''} />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" name="currency" type="text" placeholder="USD" required defaultValue={salaryGrade.currency || 'USD'} />
            </div>
            <div>
              <Label htmlFor="isActive">Is Active</Label>
              <Select id="isActive" name="isActive" defaultValue={salaryGrade.is_active ? 'true' : 'false'}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button type="button" variant="secondary" asChild>
              <Link href="/admin/salary-grades">
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

