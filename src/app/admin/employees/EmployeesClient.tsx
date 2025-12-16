'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardCard from '@/components/common/DashboardCard';
import DashboardTable from '@/components/common/DashboardTable';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { Search, Plus } from 'lucide-react';
import type { Database } from '@/lib/supabase/database.types';

export type Employee = Database['public']['Tables']['employees']['Row'] & {
  user_profiles: Database['public']['Tables']['user_profiles']['Row'] | null;
  departments: Database['public']['Tables']['departments']['Row'] | null;
};

interface EmployeesClientProps {
  employees: Employee[];
  stats: {
    totalEmployees: number;
    totalDepartments: number;
    recentHires: number;
  };
}

const EmployeesClient: React.FC<EmployeesClientProps> = ({ employees, stats }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'on_leave' | 'terminated'>('all');

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesStatus =
        statusFilter === 'all' ? true : emp.employment_status === statusFilter;

      const lc = search.toLowerCase();
      const name = `${emp.user_profiles?.first_name ?? ''} ${emp.user_profiles?.last_name ?? ''}`.toLowerCase();
      const email = (emp.user_profiles?.email ?? '').toLowerCase();
      const empNum = (emp.employee_number ?? '').toLowerCase();

      const matchesSearch =
        !lc ||
        name.includes(lc) ||
        email.includes(lc) ||
        empNum.includes(lc);

      return matchesStatus && matchesSearch;
    });
  }, [employees, search, statusFilter]);

  return (
    <div className="space-y-8">
      {/* Employee Statistics */}
      <DashboardCard>
        <h2 className="text-xl font-semibold mb-4">Employee Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
            <div>
              <p className="text-sm text-textSecondary">Total Employees</p>
              <p className="text-2xl font-bold">{stats.totalEmployees}</p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
          <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
            <div>
              <p className="text-sm text-textSecondary">Departments</p>
              <p className="text-2xl font-bold">{stats.totalDepartments}</p>
            </div>
            <span className="text-3xl">🏢</span>
          </div>
          <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
            <div>
              <p className="text-sm text-textSecondary">Recent Hires (last 3 months)</p>
              <p className="text-2xl font-bold">{stats.recentHires}</p>
            </div>
            <span className="text-3xl">⏱️</span>
          </div>
        </div>
      </DashboardCard>

      {/* Employee List */}
      <DashboardCard>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-xl font-semibold">Employee List</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search employees..."
                className="w-56 py-2 pl-10 pr-3 rounded-md"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border rounded-md px-2 py-2 text-sm bg-white dark:bg-gray-800 text-textSecondary"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
            <Button className="flex items-center space-x-2 text-sm" asChild>
              <Link href="/admin/employees/new">
                <Plus className="h-4 w-4" />
                <span>Add Employee</span>
              </Link>
            </Button>
          </div>
        </div>
        <DashboardTable data={filteredEmployees} columns={employeeColumns as any} />
      </DashboardCard>
    </div>
  );
};

export default EmployeesClient;

const employeeColumns = [
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
