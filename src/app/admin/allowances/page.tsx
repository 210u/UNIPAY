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
import { Search, Filter, DollarSign, Clock, HandCoins } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Allowances | University Payroll System',
  description: 'Manage employee allowances',
};

interface Allowance {
  id: number;
  name: string;
  type: string;
  amount: string;
  frequency: string;
  status: string;
}

interface RecentAllowanceLog {
  id: number;
  employee: string;
  allowance: string;
  amount: string;
  date: string;
}

const employeeAllowances: Allowance[] = [
  {
    id: 1,
    name: "Housing Allowance",
    type: "Fixed",
    amount: "$500.00",
    frequency: "Monthly",
    status: "Active",
  },
  {
    id: 2,
    name: "Transport Allowance",
    type: "Fixed",
    amount: "$100.00",
    frequency: "Monthly",
    status: "Active",
  },
  {
    id: 3,
    name: "Research Grant",
    type: "Variable",
    amount: "$1000.00",
    frequency: "Quarterly",
    status: "Active",
  },
  {
    id: 4,
    name: "Child Education Support",
    type: "Fixed",
    amount: "$200.00",
    frequency: "Monthly",
    status: "Active",
  },
];

const recentAllowanceLogs: RecentAllowanceLog[] = [
  {
    id: 101,
    employee: "Alice Brown",
    allowance: "Housing Allowance",
    amount: "$500.00",
    date: "2024-11-01",
  },
  {
    id: 102,
    employee: "Bob Johnson",
    allowance: "Transport Allowance",
    amount: "$100.00",
    date: "2024-11-01",
  },
  {
    id: 103,
    employee: "Charlie Green",
    allowance: "Research Grant",
    amount: "$1000.00",
    date: "2024-11-08",
  },
  {
    id: 104,
    employee: "David Lee",
    allowance: "Child Education Support",
    amount: "$200.00",
    date: "2024-11-01",
  },
];

const employeeAllowanceColumns = [
  {
    key: "name",
    header: "Allowance Name",
    render: (item: Allowance) => <span className="font-medium text-textPrimary">{item.name}</span>,
  },
  {
    key: "type",
    header: "Type",
    render: (item: Allowance) => <Badge variant="feature">{item.type}</Badge>,
  },
  {
    key: "amount",
    header: "Amount",
    render: (item: Allowance) => <span className="text-textPrimary">{item.amount}</span>,
  },
  {
    key: "frequency",
    header: "Frequency",
    render: (item: Allowance) => <span className="text-textSecondary text-sm">{item.frequency}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (item: Allowance) => (
      <Badge variant={item.status === "Active" ? "low" : "medium"}>
        {item.status}
      </Badge>
    ),
  },
];

const recentAllowanceLogColumns = [
  {
    key: "employee",
    header: "Employee",
    render: (item: RecentAllowanceLog) => <span className="font-medium text-textPrimary">{item.employee}</span>,
  },
  {
    key: "allowance",
    header: "Allowance",
    render: (item: RecentAllowanceLog) => <span className="text-textSecondary text-sm">{item.allowance}</span>,
  },
  {
    key: "amount",
    header: "Amount",
    render: (item: RecentAllowanceLog) => <span className="font-medium text-textPrimary">{item.amount}</span>,
  },
  {
    key: "date",
    header: "Date",
    render: (item: RecentAllowanceLog) => <span className="text-textSubtle text-sm">{item.date}</span>,
  },
];

export default async function AllowanceManagementPage() {
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

  if (!profile || !['system_admin', 'university_admin', 'hr_staff'].includes(profile.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Allowance Overview Statistics */}
      <DashboardCard>
        <h2 className="text-xl font-semibold mb-4">Allowance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
            <div>
              <p className="text-sm text-textSecondary">Total Allowance Types</p>
              <p className="text-2xl font-bold">8+</p>
            </div>
            <HandCoins className="h-8 w-8 text-textAccent" />
          </div>
          <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
            <div>
              <p className="text-sm text-textSecondary">Monthly Allowance Amount</p>
              <p className="text-2xl font-bold">$80K</p>
            </div>
            <DollarSign className="h-8 w-8 text-textAccent" />
          </div>
          <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
            <div>
              <p className="text-sm text-textSecondary">Pending Approvals</p>
              <p className="text-2xl font-bold">3</p>
            </div>
            <Clock className="h-8 w-8 text-textAccent" />
          </div>
        </div>
      </DashboardCard>

      {/* Employee Allowances */}
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Employee Allowances</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search allowances..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Button variant="secondary" className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>
        <DashboardTable data={employeeAllowances} columns={employeeAllowanceColumns} />
      </DashboardCard>

      {/* Recent Allowance Logs */}
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Allowance Logs</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search logs..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Button variant="secondary" className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>
        <DashboardTable data={recentAllowanceLogs} columns={recentAllowanceLogColumns} />
      </DashboardCard>
    </div>
  );
}



