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
import { updateDepartment } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit Department | University Payroll System',
  description: 'Edit an existing department record',
};

type Department = Database['public']['Tables']['departments']['Row'];
type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

async function getDepartmentDetails(departmentId: string): Promise<Department | null> {
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
    .from('departments')
    .select('*')
    .eq('id', departmentId)
    .single();

  if (error) {
    console.error('Error fetching department details:', error);
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

export default async function EditDepartmentPage({ params }: { params: { id: string } }) {
  const department = await getDepartmentDetails(params.id);
  const userProfiles = await getUserProfiles();

  if (!department) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Department Not Found</h1>
        <p className="text-textSecondary">The department you are looking for does not exist.</p>
        <Link href="/admin/departments" className="mt-4 inline-block">
          <Button>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Department List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/admin/departments">
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Department List
        </Button>
      </Link>

      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Edit Department: {department.name}</h1>

        <form className="space-y-6" action={updateDepartment}>
          <input type="hidden" name="id" value={department.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Department Name</Label>
              <Input id="name" name="name" type="text" placeholder="Human Resources" required defaultValue={department.name || ''} />
            </div>
            <div>
              <Label htmlFor="code">Department Code</Label>
              <Input id="code" name="code" type="text" placeholder="HR" required defaultValue={department.code || ''} />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input id="description" name="description" type="text" placeholder="Manages human capital" defaultValue={department.description || ''} />
            </div>
            <div>
              <Label htmlFor="headUserId">Department Head (Optional)</Label>
              <Select id="headUserId" name="headUserId" defaultValue={department.head_user_id || ''}>
                <option value="">Select a head</option>
                {userProfiles.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="budgetCode">Budget Code (Optional)</Label>
              <Input id="budgetCode" name="budgetCode" type="text" placeholder="BUDGET-HR-2024" defaultValue={department.budget_code || ''} />
            </div>
            <div>
              <Label htmlFor="costCenterCode">Cost Center Code (Optional)</Label>
              <Input id="costCenterCode" name="costCenterCode" type="text" placeholder="CC-HR-001" defaultValue={department.cost_center_code || ''} />
            </div>
            <div>
              <Label htmlFor="isActive">Is Active</Label>
              <Select id="isActive" name="isActive" defaultValue={department.is_active ? 'true' : 'false'}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button type="button" variant="secondary" asChild>
              <Link href="/admin/departments">
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

