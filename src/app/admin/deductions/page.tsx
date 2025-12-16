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
  title: 'Deduction Configurations | University Payroll System',
  description: 'Manage deduction configurations',
};

type DeductionConfig = Database['public']['Tables']['deduction_configs']['Row'];

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

  const { data, error } = await supabase
    .from('deduction_configs')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching deduction configurations:', error);
    return [];
  }

  return data;
}

const deductionConfigColumns = [
  {
    key: 'name',
    header: 'Deduction Name',
    render: (item: DeductionConfig) => <span className="font-medium text-textPrimary">{item.name}</span>,
  },
  {
    key: 'code',
    header: 'Code',
    render: (item: DeductionConfig) => <span className="text-textSecondary text-sm">{item.code}</span>,
  },
  {
    key: 'deduction_type',
    header: 'Type',
    render: (item: DeductionConfig) => <Badge variant="info">{item.deduction_type}</Badge>,
  },
  {
    key: 'calculation_method',
    header: 'Calculation Method',
    render: (item: DeductionConfig) => <span className="text-textSecondary text-sm">{item.calculation_method}</span>,
  },
  {
    key: 'fixed_amount',
    header: 'Fixed Amount',
    render: (item: DeductionConfig) => (
      <span className="text-textSecondary text-sm">{item.fixed_amount ? `$${item.fixed_amount.toFixed(2)}` : 'N/A'}</span>
    ),
  },
  {
    key: 'percentage',
    header: 'Percentage',
    render: (item: DeductionConfig) => (
      <span className="text-textSecondary text-sm">{item.percentage ? `${item.percentage.toFixed(2)}%` : 'N/A'}</span>
    ),
  },
  {
    key: 'is_mandatory',
    header: 'Mandatory',
    render: (item: DeductionConfig) => (
      <Badge variant={item.is_mandatory ? 'danger' : 'success'}>
        {item.is_mandatory ? 'Yes' : 'No'}
      </Badge>
    ),
  },
  {
    key: 'is_active',
    header: 'Status',
    render: (item: DeductionConfig) => (
      <Badge variant={item.is_active ? 'success' : 'warning'}>
        {item.is_active ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item: DeductionConfig) => (
      <div className="flex space-x-2">
        <Link href={`/admin/deductions/${item.id}/edit`}>
          <Button variant="secondary" size="sm">
            Edit
          </Button>
        </Link>
      </div>
    ),
  },
];

export default async function DeductionConfigsPage() {
  const deductionConfigs = await getDeductionConfigs();

  return (
    <div className="space-y-8">
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-textPrimary">Deduction Configurations</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search deductions..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Link href="/admin/deductions/new">
              <Button className="flex items-center space-x-2 text-sm">
                <Plus className="h-4 w-4" />
                <span>Add Deduction</span>
              </Button>
            </Link>
          </div>
        </div>
        <DashboardTable data={deductionConfigs} columns={deductionConfigColumns} />
      </DashboardCard>
    </div>
  );
}
