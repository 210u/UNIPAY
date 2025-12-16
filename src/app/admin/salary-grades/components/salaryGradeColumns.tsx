'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Database } from '@/lib/supabase/database.types';

type SalaryGrade = Database['public']['Tables']['salary_grades']['Row'];

export const salaryGradeColumns = [
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
