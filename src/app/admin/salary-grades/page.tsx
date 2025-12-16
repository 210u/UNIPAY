import React from 'react';
import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import DashboardCard from '@/components/common/DashboardCard';
import DashboardTable from '@/components/common/DashboardTable';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Salary Grades | University Payroll System',
  description: 'Manage university salary grades',
};

type SalaryGrade = Database['public']['Tables']['salary_grades']['Row'];

async function getSalaryGrades(): Promise<SalaryGrade[]> {
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
    .order('grade_level', { ascending: true });

  if (error) {
    console.error('Error fetching salary grades:', error);
    return [];
  }

  return data;
}

const salaryGradeColumns = [
  {
    key: 'grade_name',
    header: 'Grade Name',
    render: (item: SalaryGrade) => <span className="font-medium text-textPrimary">{item.grade_name}</span>,
  },
  {
    key: 'grade_level',
    header: 'Level',
    render: (item: SalaryGrade) => <span className="text-textSecondary text-sm">{item.grade_level}</span>,
  },
  {
    key: 'min_salary',
    header: 'Min Salary',
    render: (item: SalaryGrade) => (
      <span className="text-textSecondary text-sm">{item.currency} {item.min_salary.toFixed(2)}</span>
    ),
  },
  {
    key: 'mid_salary',
    header: 'Mid Salary',
    render: (item: SalaryGrade) => (
      <span className="text-textSecondary text-sm">{item.currency} {item.mid_salary.toFixed(2)}</span>
    ),
  },
  {
    key: 'max_salary',
    header: 'Max Salary',
    render: (item: SalaryGrade) => (
      <span className="text-textSecondary text-sm">{item.currency} {item.max_salary.toFixed(2)}</span>
    ),
  },
  {
    key: 'is_active',
    header: 'Status',
    render: (item: SalaryGrade) => (
      <Badge variant={item.is_active ? 'success' : 'warning'}>
        {item.is_active ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item: SalaryGrade) => (
      <div className="flex space-x-2">
        <Link href={`/admin/salary-grades/${item.id}/edit`}>
          <Button variant="secondary" size="sm">
            Edit
          </Button>
        </Link>
      </div>
    ),
  },
];

export default async function SalaryGradesPage() {
  const salaryGrades = await getSalaryGrades();

  return (
    <div className="space-y-8">
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-textPrimary">Salary Grades</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search salary grades..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Link href="/admin/salary-grades/new">
              <Button className="flex items-center space-x-2 text-sm">
                <Plus className="h-4 w-4" />
                <span>Add Salary Grade</span>
              </Button>
            </Link>
          </div>
        </div>
        <DashboardTable data={salaryGrades} columns={salaryGradeColumns} />
      </DashboardCard>
    </div>
  );
}

