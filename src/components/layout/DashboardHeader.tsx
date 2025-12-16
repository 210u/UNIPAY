// src/components/layout/DashboardHeader.tsx
'use client';

import React from 'react';
import { Bell, UserCircle, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface DashboardHeaderProps {
  userRole?: string;
}

const getPageTitle = (pathname: string): string => {
  // Admin routes
  if (pathname.startsWith('/admin/employees/new')) return 'Add New Employee';
  if (pathname.startsWith('/admin/employees/') && pathname.endsWith('/edit')) return 'Edit Employee';
  if (pathname.startsWith('/admin/employees/')) return 'Employee Details';
  if (pathname === '/admin/employees') return 'Employees';

  if (pathname.startsWith('/admin/departments/new')) return 'Add New Department';
  if (pathname.startsWith('/admin/departments/') && pathname.endsWith('/edit')) return 'Edit Department';
  if (pathname === '/admin/departments') return 'Departments';

  if (pathname.startsWith('/admin/job-positions/new')) return 'Add New Job Position';
  if (pathname.startsWith('/admin/job-positions/') && pathname.endsWith('/edit')) return 'Edit Job Position';
  if (pathname === '/admin/job-positions') return 'Job Positions';

  if (pathname.startsWith('/admin/salary-grades/new')) return 'Add New Salary Grade';
  if (pathname.startsWith('/admin/salary-grades/') && pathname.endsWith('/edit')) return 'Edit Salary Grade';
  if (pathname === '/admin/salary-grades') return 'Salary Grades';

  if (pathname.startsWith('/admin/allowances/new')) return 'Add New Allowance';
  if (pathname.startsWith('/admin/allowances/') && pathname.endsWith('/edit')) return 'Edit Allowance';
  if (pathname === '/admin/allowances') return 'Allowance Configurations';

  if (pathname.startsWith('/admin/deductions/new')) return 'Add New Deduction';
  if (pathname.startsWith('/admin/deductions/') && pathname.endsWith('/edit')) return 'Edit Deduction';
  if (pathname === '/admin/deductions') return 'Deduction Configurations';

  if (pathname.startsWith('/admin/employee-assignments/new')) return 'Add New Assignment';
  if (pathname.startsWith('/admin/employee-assignments/') && pathname.endsWith('/edit')) return 'Edit Assignment';
  if (pathname === '/admin/employee-assignments') return 'Employee Assignments';

  if (pathname.startsWith('/admin/employee-allowances/new')) return 'Add New Employee Allowance';
  if (pathname.startsWith('/admin/employee-allowances/') && pathname.endsWith('/edit')) return 'Edit Employee Allowance';
  if (pathname === '/admin/employee-allowances') return 'Employee Allowances';

  if (pathname.startsWith('/admin/employee-deductions/new')) return 'Add New Employee Deduction';
  if (pathname.startsWith('/admin/employee-deductions/') && pathname.endsWith('/edit')) return 'Edit Employee Deduction';
  if (pathname === '/admin/employee-deductions') return 'Employee Deductions';

  if (pathname.startsWith('/admin/employee-advances/new')) return 'Add New Employee Advance';
  if (pathname.startsWith('/admin/employee-advances/') && pathname.endsWith('/edit')) return 'Edit Employee Advance';
  if (pathname === '/admin/employee-advances') return 'Employee Advances';

  if (pathname.startsWith('/admin/payroll-periods/new')) return 'Add New Payroll Period';
  if (pathname.startsWith('/admin/payroll-periods/') && pathname.endsWith('/edit')) return 'Edit Payroll Period';
  if (pathname === '/admin/payroll-periods') return 'Payroll Periods';

  if (pathname.startsWith('/admin/payroll-runs/new')) return 'Create Payroll Run';
  if (pathname.startsWith('/admin/payroll-runs/')) return 'Payroll Run Details';
  if (pathname === '/admin/payroll-runs') return 'Payroll Runs';

  if (pathname.startsWith('/admin/timesheets/')) return 'Timesheet Details';
  if (pathname === '/admin/timesheets') return 'Timesheet Management';

  if (pathname === '/admin/audit-logs') return 'Audit Logs';

  // Employee routes
  if (pathname.startsWith('/dashboard/timesheets/new')) return 'Create New Timesheet';
  if (pathname.startsWith('/dashboard/timesheets/') && pathname.endsWith('/edit')) return 'Edit Timesheet';
  if (pathname === '/dashboard/timesheets') return 'My Timesheets';

  if (pathname.startsWith('/dashboard/payments/')) return 'Payslip Details';
  if (pathname === '/dashboard/payments') return 'My Payments';

  if (pathname === '/dashboard/profile') return 'My Profile';
  if (pathname === '/dashboard') return 'My Dashboard';
  if (pathname === '/') return 'Home';

  return 'Dashboard'; // Default title
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userRole }) => {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        {/* In a real app, you might have a menu toggle for mobile here */}
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{pageTitle}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <UserCircle className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
