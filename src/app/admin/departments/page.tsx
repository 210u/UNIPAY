import React from 'react';
import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/database.types';
import DashboardCard from '@/components/common/DashboardCard';
import DashboardTable from '@/components/common/DashboardTable';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Search, Plus } from 'lucide-react';
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

const departmentColumns = [
  {
    key: 'name',
    header: 'Department Name',
    render: (item: Department) => <span className="font-medium text-textPrimary">{item.name}</span>,
  },
  {
    key: 'code',
    header: 'Code',
    render: (item: Department) => <span className="text-textSecondary text-sm">{item.code}</span>,
  },
  {
    key: 'head',
    header: 'Department Head',
    render: (item: Department) => (
      <span className="text-textSecondary text-sm">
        {item.head_user_profiles ? `${item.head_user_profiles.first_name} ${item.head_user_profiles.last_name}` : 'N/A'}
      </span>
    ),
  },
  {
    key: 'budget_code',
    header: 'Budget Code',
    render: (item: Department) => <span className="text-textSubtle text-sm">{item.budget_code || 'N/A'}</span>,
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item: Department) => (
      <div className="flex space-x-2">
        <Link href={`/admin/departments/${item.id}/edit`}>
          <Button variant="secondary" size="sm">
            Edit
          </Button>
        </Link>
      </div>
    ),
  },
];

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

