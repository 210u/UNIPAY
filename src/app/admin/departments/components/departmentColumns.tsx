'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Database } from '@/lib/supabase/database.types';

type Department = Database['public']['Tables']['departments']['Row'] & {
  head_user_profiles: Database['public']['Tables']['user_profiles']['Row'] | null;
};

export const departmentColumns = [
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
