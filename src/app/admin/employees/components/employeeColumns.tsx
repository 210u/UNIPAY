'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import type { Database } from '@/lib/supabase/database.types';

export type Employee = Database['public']['Tables']['employees']['Row'] & {
  user_profiles: Database['public']['Tables']['user_profiles']['Row'] | null;
  departments: Database['public']['Tables']['departments']['Row'] | null;
};

export const employeeColumns = [
  {
    key: 'name',
    header: 'Employee Name',
    render: (item: Employee) => (
      <div className="flex items-center space-x-3">
        <Avatar
          alt={`${item.user_profiles?.first_name ?? ''} ${item.user_profiles?.last_name ?? ''}`}
          src={item.user_profiles?.profile_image_url || undefined}
          className="w-8 h-8"
        />
        <div>
          <span className="font-medium text-textPrimary">
            {item.user_profiles?.first_name} {item.user_profiles?.last_name}
          </span>
          <p className="text-sm text-textSubtle">{item.user_profiles?.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'employee_number',
    header: 'Employee ID',
    render: (item: Employee) => (
      <span className="text-textSecondary text-sm">{item.employee_number}</span>
    ),
  },
  {
    key: 'department',
    header: 'Department',
    render: (item: Employee) => (
      <span className="text-textSecondary text-sm">
        {item.departments?.name || 'N/A'}
      </span>
    ),
  },
  {
    key: 'employment_status',
    header: 'Status',
    render: (item: Employee) => (
      <Badge variant={item.employment_status === 'active' ? 'success' : 'warning'}>
        {item.employment_status}
      </Badge>
    ),
  },
  {
    key: 'hire_date',
    header: 'Hire Date',
    render: (item: Employee) => (
      <span className="text-textSubtle text-sm">{item.hire_date}</span>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item: Employee) => (
      <div className="flex space-x-2">
        <Link href={`/admin/employees/${item.id}`}>
          <Button variant="secondary" size="sm">
            View
          </Button>
        </Link>
        <Link href={`/admin/employees/${item.id}/edit`}>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </Link>
      </div>
    ),
  },
];
