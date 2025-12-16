import React from 'react';
import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/database.types';
import DashboardCard from '@/components/common/DashboardCard';
import DashboardTable from '@/components/common/DashboardTable';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Search, Plus } from 'lucide-react';
import { departmentColumns } from './components/departmentColumns';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Departments | University Payroll System',
  description: 'Manage university departments',
};

type Department = Database['public']['Tables']['departments']['Row'] & {
  head_user_profiles: Database['public']['Tables']['user_profiles']['Row'] | null;
};

async function getDepartments(): Promise<Department[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('departments')
    .select('*, head_user_profiles:user_profiles(first_name, last_name, email)')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching departments:', error);
    return [];
  }

  return data;
}


export default async function DepartmentsPage() {
  const departments = await getDepartments();

  return (
    <div className="space-y-8">
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-textPrimary">Departments</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search departments..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Link href="/admin/departments/new">
              <Button className="flex items-center space-x-2 text-sm">
                <Plus className="h-4 w-4" />
                <span>Add Department</span>
              </Button>
            </Link>
          </div>
        </div>
        <DashboardTable data={departments} columns={departmentColumns} />
      </DashboardCard>
    </div>
  );
}

