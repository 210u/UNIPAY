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
  title: 'Allowance Configurations | University Payroll System',
  description: 'Manage allowance configurations',
};

type AllowanceConfig = Database['public']['Tables']['allowance_configs']['Row'];

async function getAllowanceConfigs(): Promise<AllowanceConfig[]> {
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
    .from('allowance_configs')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching allowance configurations:', error);
    return [];
  }

  return data;
}

const allowanceConfigColumns = [
  {
    key: 'name',
    header: 'Allowance Name',
    render: (item: AllowanceConfig) => <span className="font-medium text-textPrimary">{item.name}</span>,
  },
  {
    key: 'code',
    header: 'Code',
    render: (item: AllowanceConfig) => <span className="text-textSecondary text-sm">{item.code}</span>,
  },
  {
    key: 'allowance_type',
    header: 'Type',
    render: (item: AllowanceConfig) => <Badge variant="info">{item.allowance_type}</Badge>,
  },
  {
    key: 'calculation_method',
    header: 'Calculation Method',
    render: (item: AllowanceConfig) => <span className="text-textSecondary text-sm">{item.calculation_method}</span>,
  },
  {
    key: 'default_amount',
    header: 'Default Amount',
    render: (item: AllowanceConfig) => (
      <span className="text-textSecondary text-sm">{item.default_amount ? `$${item.default_amount.toFixed(2)}` : 'N/A'}</span>
    ),
  },
  {
    key: 'default_percentage',
    header: 'Default Percentage',
    render: (item: AllowanceConfig) => (
      <span className="text-textSecondary text-sm">{item.default_percentage ? `${item.default_percentage.toFixed(2)}%` : 'N/A'}</span>
    ),
  },
  {
    key: 'is_taxable',
    header: 'Taxable',
    render: (item: AllowanceConfig) => (
      <Badge variant={item.is_taxable ? 'danger' : 'success'}>
        {item.is_taxable ? 'Yes' : 'No'}
      </Badge>
    ),
  },
  {
    key: 'is_active',
    header: 'Status',
    render: (item: AllowanceConfig) => (
      <Badge variant={item.is_active ? 'success' : 'warning'}>
        {item.is_active ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item: AllowanceConfig) => (
      <div className="flex space-x-2">
        <Link href={`/admin/allowances/${item.id}/edit`}>
          <Button variant="secondary" size="sm">
            Edit
          </Button>
        </Link>
      </div>
    ),
  },
];

export default async function AllowanceConfigsPage() {
  const allowanceConfigs = await getAllowanceConfigs();

  return (
    <div className="space-y-8">
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-textPrimary">Allowance Configurations</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search allowances..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Link href="/admin/allowances/new">
              <Button className="flex items-center space-x-2 text-sm">
                <Plus className="h-4 w-4" />
                <span>Add Allowance</span>
              </Button>
            </Link>
          </div>
        </div>
        <DashboardTable data={allowanceConfigs} columns={allowanceConfigColumns} />
      </DashboardCard>
    </div>
  );
}
