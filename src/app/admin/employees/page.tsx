import React from 'react';
import { Metadata } from 'next';
import DashboardCard from '@/components/common/DashboardCard';
import DashboardTable from '@/components/common/DashboardTable';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import Avatar from '@/components/ui/Avatar';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Search, Filter, Plus, Clock, User, DollarSign, CalendarDays, Users, BriefcaseBusiness } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Employees | University Payroll System',
  description: 'Manage employees and view their payroll details',
};

interface EmployeeTask {
  id: number;
  title: string;
  type: 'feature' | 'bug' | 'review' | 'testing';
  priority: 'high' | 'medium' | 'low';
  progress: number;
  dueDate: string;
  assignees: { name: string; avatar?: string }[];
}

interface PayrollActivity {
  id: number;
  employee: string;
  department: string;
  amount: string;
  date: string;
  status: string;
}

const employeeTasks: EmployeeTask[] = [
  {
    id: 1,
    title: "Review Faculty Contracts",
    type: "feature",
    priority: "high",
    progress: 75,
    dueDate: "2024-12-15",
    assignees: [
      { name: "John Doe", avatar: "/avatars/john.jpg" },
      { name: "Jane Smith", avatar: "/avatars/jane.jpg" },
    ],
  },
  {
    id: 2,
    title: "Onboard New Administrative Staff",
    type: "bug",
    priority: "medium",
    progress: 50,
    dueDate: "2024-11-30",
    assignees: [
      { name: "Alice Brown", avatar: "/avatars/alice.jpg" },
    ],
  },
  {
    id: 3,
    title: "Process Monthly Allowances",
    type: "review",
    priority: "low",
    progress: 90,
    dueDate: "2024-11-20",
    assignees: [
      { name: "Bob Johnson", avatar: "/avatars/bob.jpg" },
      { name: "Charlie Green", avatar: "/avatars/charlie.jpg" },
    ],
  },
  {
    id: 4,
    title: "Update Employee Deduction Policies",
    type: "testing",
    priority: "high",
    progress: 25,
    dueDate: "2025-01-01",
    assignees: [
      { name: "David Lee", avatar: "/avatars/david.jpg" },
    ],
  },
];

const recentPayrollActivities: PayrollActivity[] = [
  {
    id: 101,
    employee: "Alice Brown",
    department: "Human Resources",
    amount: "$2,500.00",
    date: "2024-11-10",
    status: "Paid",
  },
  {
    id: 102,
    employee: "Bob Johnson",
    department: "Faculty of Arts",
    amount: "$3,200.00",
    date: "2024-11-08",
    status: "Paid",
  },
  {
    id: 103,
    employee: "Charlie Green",
    department: "Finance Department",
    amount: "$1,800.00",
    date: "2024-11-05",
    status: "Pending",
  },
  {
    id: 104,
    employee: "David Lee",
    department: "Faculty of Science",
    amount: "$2,900.00",
    date: "2024-11-03",
    status: "Paid",
  },
];

const employeeTaskColumns = [
  {
    key: "title",
    header: "Task name",
    render: (item: EmployeeTask) => <span className="font-medium text-textPrimary">{item.title}</span>,
  },
  {
    key: "assignees",
    header: "Assigned To",
    render: (item: EmployeeTask) => (
      <div className="flex -space-x-2">
        {item.assignees.map((person, idx) => (
          <Avatar key={idx} alt={person.name} src={person.avatar} className="w-6 h-6" />
        ))}
      </div>
    ),
  },
  {
    key: "type",
    header: "Type",
    render: (item: EmployeeTask) => <Badge variant={item.type}>{item.type}</Badge>,
  },
  {
    key: "dueDate",
    header: "Due Date",
    render: (item: EmployeeTask) => <span className="text-textSecondary text-sm">{item.dueDate}</span>,
  },
  {
    key: "priority",
    header: "Priority",
    render: (item: EmployeeTask) => <Badge variant={item.priority}>{item.priority}</Badge>,
  },
  {
    key: "progress",
    header: "Progress",
    render: (item: EmployeeTask) => <ProgressBar progress={item.progress} className="w-24" />,
  },
];

const payrollActivityColumns = [
  {
    key: "employee",
    header: "Employee",
    render: (item: PayrollActivity) => <span className="font-medium text-textPrimary">{item.employee}</span>,
  },
  {
    key: "department",
    header: "Department",
    render: (item: PayrollActivity) => <span className="text-textSecondary text-sm">{item.department}</span>,
  },
  {
    key: "amount",
    header: "Amount",
    render: (item: PayrollActivity) => <span className="font-medium text-textPrimary">{item.amount}</span>,
  },
  {
    key: "date",
    header: "Date",
    render: (item: PayrollActivity) => <span className="text-textSubtle text-sm">{item.date}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (item: PayrollActivity) => (
      <Badge variant={item.status === "Paid" ? "low" : "medium"}>
        {item.status}
      </Badge>
    ),
  },
];

export default function EmployeesPage() {
  return (
    <div className="space-y-8">
      {/* Employee Statistics */} 
      <DashboardCard>
        <h2 className="text-xl font-semibold mb-4">Employee Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
            <div>
              <p className="text-sm text-textSecondary">Total Employees</p>
              <p className="text-2xl font-bold">5,200</p>
            </div>
            <Users className="h-8 w-8 text-textAccent" />
          </div>
          <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
            <div>
              <p className="text-sm text-textSecondary">Departments</p>
              <p className="text-2xl font-bold">15</p>
            </div>
            <BriefcaseBusiness className="h-8 w-8 text-textAccent" />
          </div>
          <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
            <div>
              <p className="text-sm text-textSecondary">Recent Hires</p>
              <p className="text-2xl font-bold">30</p>
            </div>
            <Clock className="h-8 w-8 text-textAccent" />
          </div>
        </div>
      </DashboardCard>

      {/* Employee Tasks Overview */}
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Employee Task List</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search tasks..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Button variant="secondary" className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>
        <DashboardTable data={employeeTasks} columns={employeeTaskColumns} />
      </DashboardCard>

      {/* Recent Payroll Activities */}
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Payroll Activities</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search payments..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Button variant="secondary" className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>
        <DashboardTable data={recentPayrollActivities} columns={payrollActivityColumns} />
      </DashboardCard>
    </div>
  );
}



