import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Metadata } from 'next';
import { Database } from '@/lib/supabase/database.types';
import DashboardCard from '@/components/common/DashboardCard';
import DashboardTable from '@/components/common/DashboardTable';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Search, Filter, UserPlus, Trash2, Edit, UserRoundCheck, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'User Management | University Payroll System',
  description: 'Manage users and their roles',
};

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

const users: User[] = [
  {
    id: 1,
    name: "Alice Brown",
    email: "alice.b@university.edu",
    role: "University Admin",
    status: "Active",
    lastLogin: "2024-11-12",
  },
  {
    id: 2,
    name: "Bob Johnson",
    email: "bob.j@university.edu",
    role: "HR Staff",
    status: "Active",
    lastLogin: "2024-11-11",
  },
  {
    id: 3,
    name: "Charlie Green",
    email: "charlie.g@university.edu",
    role: "Payroll Officer",
    status: "Inactive",
    lastLogin: "2024-10-20",
  },
  {
    id: 4,
    name: "David Lee",
    email: "david.l@university.edu",
    role: "Department Head",
    status: "Active",
    lastLogin: "2024-11-13",
  },
];

const userColumns = [
  {
    key: "name",
    header: "Name",
    render: (item: User) => <span className="font-medium text-textPrimary">{item.name}</span>,
  },
  {
    key: "email",
    header: "Email",
    render: (item: User) => <span className="text-textSecondary text-sm">{item.email}</span>,
  },
  {
    key: "role",
    header: "Role",
    render: (item: User) => <Badge variant="review">{item.role}</Badge>,
  },
  {
    key: "status",
    header: "Status",
    render: (item: User) => (
      <Badge variant={item.status === "Active" ? "low" : "medium"}>
        {item.status}
      </Badge>
    ),
  },
  {
    key: "lastLogin",
    header: "Last Login",
    render: (item: User) => <span className="text-textSubtle text-sm">{item.lastLogin}</span>,
  },
  {
    key: "actions",
    header: "Actions",
    render: () => (
      <div className="flex space-x-2">
        <Button variant="secondary" size="sm" className="flex items-center space-x-1 text-xs">
          <Edit className="h-3 w-3" />
          <span>Edit</span>
        </Button>
        <Button variant="secondary" size="sm" className="flex items-center space-x-1 text-xs text-red-500 hover:bg-red-100 dark:hover:bg-red-900">
          <Trash2 className="h-3 w-3" />
          <span>Delete</span>
        </Button>
      </div>
    ),
  },
];

export default async function UserManagementPage() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/signin');
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*, university:universities(*)')
    .eq('id', session.user.id)
    .single();

  if (!profile || !['system_admin', 'university_admin'].includes(profile.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only administrators can manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* User Management Overview */}
      <DashboardCard>
        <h2 className="text-xl font-semibold mb-4">User Management Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
            <div>
              <p className="text-sm text-textSecondary">Total Users</p>
              <p className="text-2xl font-bold">250</p>
            </div>
            <UserRoundCheck className="h-8 w-8 text-textAccent" />
          </div>
          <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
            <div>
              <p className="text-sm text-textSecondary">Active Users</p>
              <p className="text-2xl font-bold">220</p>
            </div>
            <UserPlus className="h-8 w-8 text-textAccent" />
          </div>
          <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
            <div>
              <p className="text-sm text-textSecondary">Inactive Users</p>
              <p className="text-2xl font-bold">30</p>
            </div>
            <Clock className="h-8 w-8 text-textAccent" />
          </div>
        </div>
      </DashboardCard>

      {/* All Users Table */}
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">All System Users</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search users..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Button variant="primary" className="flex items-center space-x-2 text-sm">
              <UserPlus className="h-4 w-4" />
              <span>Add User</span>
            </Button>
            <Button variant="secondary" className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>
        <DashboardTable data={users} columns={userColumns} />
      </DashboardCard>
    </div>
  );
}



