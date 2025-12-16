'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Database } from '@/lib/supabase/database.types';

type PayrollRun = Database['public']['Tables']['payroll_runs']['Row'] & {
  payroll_periods: Database['public']['Tables']['payroll_periods']['Row'] | null;
  ran_by_user: Database['public']['Tables']['user_profiles']['Row'] | null;
};

export const payrollRunColumns = [
  {
    key: 'run_number',
    header: 'Run No.',
    render: (item: PayrollRun) => <span className="font-medium text-textPrimary">{item.run_number}</span>,
  },
  {
    key: 'payroll_period',
    header: 'Payroll Period',
    render: (item: PayrollRun) => <span className="text-textSecondary text-sm">{item.payroll_periods?.period_name || 'N/A'}</span>,
  },
  {
    key: 'run_date',
    header: 'Run Date',
    render: (item: PayrollRun) => <span className="text-textSecondary text-sm">{new Date(item.run_date).toLocaleDateString()}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (item: PayrollRun) => <Badge variant={item.status === 'completed' ? 'success' : 'warning'}>{item.status}</Badge>,
  },
  {
    key: 'total_employees_processed',
    header: 'Employees Processed',
    render: (item: PayrollRun) => <span className="text-textSecondary text-sm">{item.total_employees_processed}</span>,
  },
  {
    key: 'total_gross_pay',
    header: 'Total Gross Pay',
    render: (item: PayrollRun) => <span className="text-textSecondary text-sm">${item.total_gross_pay.toFixed(2)}</span>,
  },
  {
    key: 'total_net_pay',
    header: 'Total Net Pay',
    render: (item: PayrollRun) => <span className="text-textSecondary text-sm">${item.total_net_pay.toFixed(2)}</span>,
  },
  {
    key: 'ran_by',
    header: 'Ran By',
    render: (item: PayrollRun) => (
      <span className="text-textSubtle text-sm">
        {item.ran_by_user ? `${item.ran_by_user.first_name} ${item.ran_by_user.last_name}` : 'N/A'}
      </span>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item: PayrollRun) => (
      <div className="flex space-x-2">
        <Link href={`/admin/payroll-runs/${item.id}`}>
          <Button variant="secondary" size="sm">
            View
          </Button>
        </Link>
        {/* Add edit/delete actions if applicable */}
      </div>
    ),
  },
];
