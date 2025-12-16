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
  title: 'Job Positions | University Payroll System',
  description: 'Manage university job positions',
};

type JobPosition = Database['public']['Tables']['job_positions']['Row'] & {
  departments: Database['public']['Tables']['departments']['Row'] | null;
};

async function getJobPositions(): Promise<JobPosition[]> {
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
    .from('job_positions')
    .select('*, departments(name)')
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching job positions:', error);
    return [];
  }

  return data;
}

const jobPositionColumns = [
  {
    key: 'title',
    header: 'Job Title',
    render: (item: JobPosition) => <span className="font-medium text-textPrimary">{item.title}</span>,
  },
  {
    key: 'code',
    header: 'Code',
    render: (item: JobPosition) => <span className="text-textSecondary text-sm">{item.code}</span>,
  },
  {
    key: 'department',
    header: 'Department',
    render: (item: JobPosition) => <span className="text-textSecondary text-sm">{item.departments?.name || 'N/A'}</span>,
  },
  {
    key: 'pay_rate_type',
    header: 'Pay Rate Type',
    render: (item: JobPosition) => <Badge variant="info">{item.pay_rate_type}</Badge>,
  },
  {
    key: 'default_rate',
    header: 'Default Rate',
    render: (item: JobPosition) => (
      <span className="text-textSecondary text-sm">
        {item.pay_rate_type === 'hourly'
          ? `$${item.default_hourly_rate?.toFixed(2) || '0.00'}/hour`
          : `$${item.default_salary?.toFixed(2) || '0.00'}/year`}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (item: JobPosition) => (
      <Badge variant={item.status === 'active' ? 'success' : 'warning'}>
        {item.status}
      </Badge>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item: JobPosition) => (
      <div className="flex space-x-2">
        <Link href={`/admin/job-positions/${item.id}/edit`}>
          <Button variant="secondary" size="sm">
            Edit
          </Button>
        </Link>
      </div>
    ),
  },
];

export default async function JobPositionsPage() {
  const jobPositions = await getJobPositions();

  return (
    <div className="space-y-8">
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-textPrimary">Job Positions</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search job positions..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Link href="/admin/job-positions/new">
              <Button className="flex items-center space-x-2 text-sm">
                <Plus className="h-4 w-4" />
                <span>Add Job Position</span>
              </Button>
            </Link>
          </div>
        </div>
        <DashboardTable data={jobPositions} columns={jobPositionColumns} />
      </DashboardCard>
    </div>
  );
}

