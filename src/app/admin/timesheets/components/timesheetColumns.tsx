'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Database } from '@/lib/supabase/database.types';

type Timesheet = Database['public']['Tables']['timesheets']['Row'] & {
  employees: (Database['public']['Tables']['employees']['Row'] & {
    user_profiles: Database['public']['Tables']['user_profiles']['Row'] | null;
  }) | null;
  approved_by_user: Database['public']['Tables']['user_profiles']['Row'] | null;
};

export const timesheetColumns = [
  {
    key: 'timesheet_number',
    header: 'Timesheet No.',
    render: (item: Timesheet) => <span className="font-medium text-textPrimary">{item.timesheet_number}</span>,
  },
  {
    key: 'employee_name',
    header: 'Employee Name',
    render: (item: Timesheet) => (
      <span className="text-textSecondary text-sm">
        {item.employees?.user_profiles?.first_name} {item.employees?.user_profiles?.last_name}
      </span>
    ),
  },
  {
    key: 'period_start_date',
    header: 'Start Date',
    render: (item: Timesheet) => <span className="text-textSecondary text-sm">{item.period_start_date}</span>,
  },
  {
    key: 'period_end_date',
    header: 'End Date',
    render: (item: Timesheet) => <span className="text-textSecondary text-sm">{item.period_end_date}</span>,
  },
  {
    key: 'total_hours',
    header: 'Total Hours',
    render: (item: Timesheet) => <span className="text-textSecondary text-sm">{item.total_hours?.toFixed(2) || '0.00'}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (item: Timesheet) => <Badge variant={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'danger' : 'warning'}>{item.status}</Badge>,
  },
  {
    key: 'submission_date',
    header: 'Submission Date',
    render: (item: Timesheet) => <span className="text-textSubtle text-sm">{item.submission_date ? new Date(item.submission_date).toLocaleDateString() : 'N/A'}</span>,
  },
  {
    key: 'approved_by',
    header: 'Approved By',
    render: (item: Timesheet) => (
      <span className="text-textSubtle text-sm">
        {item.approved_by_user ? `${item.approved_by_user.first_name} ${item.approved_by_user.last_name}` : 'N/A'}
      </span>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item: Timesheet) => (
      <div className="flex space-x-2">
        <Link href={`/admin/timesheets/${item.id}`}>
          <Button variant="secondary" size="sm">
            View & Approve
          </Button>
        </Link>
      </div>
    ),
  },
];
