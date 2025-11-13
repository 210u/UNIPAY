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
import { Search, Filter, DollarSign, Clock, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Deductions | University Payroll System',
  description: 'Manage employee deductions',
};

interface Deduction {
  id: number;
  name: string;
  type: string;
  amount: string;
  frequency: string;
  status: string;
}

interface RecentDeductionLog {
  id: number;
  employee: string;
  deduction: string;
  amount: string;
  date: string;
}

const employeeDeductions: Deduction[] = [
  {
    id: 1,
    name: "Health Insurance Premium",
    type: "Mandatory",
    amount: "$150.00",
    frequency: "Monthly",
    status: "Active",
  },
  {
    id: 2,
    name: "Retirement Plan Contribution",
    type: "Voluntary",
    amount: "$200.00",
    frequency: "Monthly",
    status: "Active",
  },
  {
    id: 3,
    name: "Loan Repayment",
    type: "Other",
    amount: "$50.00",
    frequency: "Bi-Weekly",
    status: "Active",
  },
  {
    id: 4,
    name: "Union Dues",
    type: "Mandatory",
    amount: "$25.00",
    frequency: "Monthly",
    status: "Active",
  },
];

const recentDeductionLogs: RecentDeductionLog[] = [
  {
    id: 101,
    employee: "Alice Brown",
    deduction: "Health Insurance Premium",
    amount: "$150.00",
    date: "2024-11-01",
  },
  {
    id: 102,
    employee: "Bob Johnson",
    deduction: "Retirement Plan Contribution",
    amount: "$200.00",
    date: "2024-11-01",
  },
  {
    id: 103,
    employee: "Charlie Green",
    deduction: "Loan Repayment",
    amount: "$50.00",
    date: "2024-11-08",
  },
  {
    id: 104,
    employee: "David Lee",
    deduction: "Union Dues",
    amount: "$25.00",
    date: "2024-11-01",
  },
];

const employeeDeductionColumns = [
  {
    key: "name",
    header: "Deduction Name",
    render: (item: Deduction) => <span className="font-medium text-textPrimary">{item.name}</span>,
  },
  {
    key: "type",
    header: "Type",
    render: (item: Deduction) => <Badge variant="feature">{item.type}</Badge>,
  },
  {
    key: "amount",
    header: "Amount",
    render: (item: Deduction) => <span className="text-textPrimary">{item.amount}</span>,
  },
  {
    key: "frequency",
    header: "Frequency",
    render: (item: Deduction) => <span className="text-textSecondary text-sm">{item.frequency}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (item: Deduction) => (
      <Badge variant={item.status === "Active" ? "low" : "medium"}>
        {item.status}
      </Badge>
    ),
  },
];

const recentDeductionLogColumns = [
  {
    key: "employee",
    header: "Employee",
    render: (item: RecentDeductionLog) => <span className="font-medium text-textPrimary">{item.employee}</span>,
  },
  {
    key: "deduction",
    header: "Deduction",
    render: (item: RecentDeductionLog) => <span className="text-textSecondary text-sm">{item.deduction}</span>,
  },
  {
    key: "amount",
    header: "Amount",
    render: (item: RecentDeductionLog) => <span className="font-medium text-textPrimary">{item.amount}</span>,
  },
  {
    key: "date",
    header: "Date",
    render: (item: RecentDeductionLog) => <span className="text-textSubtle text-sm">{item.date}</span>,
  },
];

export default async function DeductionManagementPage() {
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
      {/* Deduction Overview Statistics */}
      <DashboardCard>
        <h2 className="text-xl font-semibold mb-4">Deduction Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
            <div>
              <p className="text-sm text-textSecondary">Total Deductions</p>
              <p className="text-2xl font-bold">10+</p>
            </div>
            <FileText className="h-8 w-8 text-textAccent" />
          </div>
          <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
            <div>
              <p className="text-sm text-textSecondary">Monthly Deducted Amount</p>
              <p className="text-2xl font-bold">$50K</p>
            </div>
            <DollarSign className="h-8 w-8 text-textAccent" />
          </div>
          <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
            <div>
              <p className="text-sm text-textSecondary">Pending Approvals</p>
              <p className="text-2xl font-bold">5</p>
            </div>
            <Clock className="h-8 w-8 text-textAccent" />
          </div>
        </div>
      </DashboardCard>

      {/* Employee Deductions */}
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Employee Deductions</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search deductions..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Button variant="secondary" className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>
        <DashboardTable data={employeeDeductions} columns={employeeDeductionColumns} />
      </DashboardCard>

      {/* Recent Deduction Logs */}
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Deduction Logs</h2>
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
        <DashboardTable data={recentDeductionLogs} columns={recentDeductionLogColumns} />
      </DashboardCard>
    </div>
  );
}



