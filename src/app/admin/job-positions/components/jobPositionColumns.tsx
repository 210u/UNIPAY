'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Database } from '@/lib/supabase/database.types';

type JobPosition = Database['public']['Tables']['job_positions']['Row'] & {
  departments: Database['public']['Tables']['departments']['Row'] | null;
};

export const jobPositionColumns = [
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
