import React from 'react';
import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server'; // Import the centralized server client
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import DashboardCard from '@/components/common/DashboardCard';
import DashboardTable from '@/components/common/DashboardTable';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Search, Filter, Plus, Clock, Users, BriefcaseBusiness } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Employees | University Payroll System',
  description: 'Manage employees and view their payroll details',
};

type Employee = Database['public']['Tables']['employees']['Row'] & {
  user_profiles: Database['public']['Tables']['user_profiles']['Row'] | null;
  departments: Database['public']['Tables']['departments']['Row'] | null;
};

async function getEmployees(): Promise<Employee[]> {
  const supabase = createServerSupabaseClient(); // Use the centralized server client

  const { data, error } = await supabase
    .from('employees')
    .select('*, user_profiles(*), departments(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }

  return data;
}

const employeeColumns = [
  {
    key: 'name',
    header: 'Employee Name',
    render: (item: Employee) => (
      <div className="flex items-center space-x-3">
        <Avatar
          alt={item.user_profiles?.first_name + ' ' + item.user_profiles?.last_name}
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
    render: (item: Employee) => <span className="text-textSecondary text-sm">{item.employee_number}</span>,
  },
  {
    key: 'department',
    header: 'Department',
    render: (item: Employee) => <span className="text-textSecondary text-sm">{item.departments?.name || 'N/A'}</span>,
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
    render: (item: Employee) => <span className="text-textSubtle text-sm">{item.hire_date}</span>,
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

export default async function EmployeesPage() {
  const employees = await getEmployees();
  const totalEmployees = employees.length;
  const totalDepartments = new Set(employees.map(emp => emp.department_id)).size;
  const recentHires = employees.filter(emp => {
    const hireDate = new Date(emp.hire_date);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return hireDate >= threeMonthsAgo;
  }).length;

  return (
    <div className="space-y-8">
      {/* Employee Statistics */} 
      <DashboardCard>
        <h2 className="text-xl font-semibold mb-4">Employee Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
            <div>
              <p className="text-sm text-textSecondary">Total Employees</p>
              <p className="text-2xl font-bold">{totalEmployees}</p>
            </div>
            <Users className="h-8 w-8 text-textAccent" />
          </div>
          <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
            <div>
              <p className="text-sm text-textSecondary">Departments</p>
              <p className="text-2xl font-bold">{totalDepartments}</p>
            </div>
            <BriefcaseBusiness className="h-8 w-8 text-textAccent" />
          </div>
          <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
            <div>
              <p className="text-sm text-textSecondary">Recent Hires (last 3 months)</p>
              <p className="text-2xl font-bold">{recentHires}</p>
            </div>
            <Clock className="h-8 w-8 text-textAccent" />
          </div>
        </div>
      </DashboardCard>

      {/* Employee List */}
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Employee List</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search employees..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Button variant="secondary" className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button className="flex items-center space-x-2 text-sm">
              <Plus className="h-4 w-4" />
              <span>Add Employee</span>
            </Button>
          </div>
        </div>
        <DashboardTable data={employees} columns={employeeColumns} />
      </DashboardCard>
    </div>
  );
}