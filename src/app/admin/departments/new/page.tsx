import React from 'react';
import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/database.types';
import { DEFAULT_UNIVERSITY_ID } from '@/lib/university';
import DashboardCard from '@/components/common/DashboardCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Label from '@/components/ui/Label';
import { ChevronLeft, Save } from 'lucide-react';
import Link from 'next/link';
import Select from '@/components/ui/Select';
import { addDepartment } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Add New Department | University Payroll System',
  description: 'Add a new department to the system',
};

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

async function getUserProfiles(): Promise<UserProfile[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.from('user_profiles').select('id, first_name, last_name, email').order('last_name', { ascending: true });

  if (error) {
    console.error('Error fetching user profiles:', error);
    return [];
  }
  return data;
}

async function getUniversityId(): Promise<string | null> {
  // Hard-coded for now, as requested.
  return DEFAULT_UNIVERSITY_ID;
}

export default async function AddDepartmentPage() {
  const userProfiles = await getUserProfiles();
  const universityId = await getUniversityId();

  return (
    <div className="space-y-8">
      <Link href="/admin/departments">
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Department List
        </Button>
      </Link>

      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Add New Department</h1>

        <form className="space-y-6" action={addDepartment}>
          <input type="hidden" name="universityId" value={universityId || ''} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Department Name</Label>
              <Input id="name" name="name" type="text" placeholder="Human Resources" required />
            </div>
            <div>
              <Label htmlFor="code">Department Code</Label>
              <Input id="code" name="code" type="text" placeholder="HR" required />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input id="description" name="description" type="text" placeholder="Manages human capital" />
            </div>
            <div>
              <Label htmlFor="headUserId">Department Head (Optional)</Label>
              <Select id="headUserId" name="headUserId">
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
              <Input id="budgetCode" name="budgetCode" type="text" placeholder="BUDGET-HR-2024" />
            </div>
            <div>
              <Label htmlFor="costCenterCode">Cost Center Code (Optional)</Label>
              <Input id="costCenterCode" name="costCenterCode" type="text" placeholder="CC-HR-001" />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button type="button" variant="secondary" asChild>
              <Link href="/admin/departments">
                Cancel
              </Link>
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" /> Add Department
            </Button>
          </div>
        </form>
      </DashboardCard>
    </div>
  );
}

