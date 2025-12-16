import React from 'react';
import { Metadata } from 'next';
import DashboardCard from '@/components/common/DashboardCard';
import DashboardTable from '@/components/common/DashboardTable';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { CalendarDays, Clock, DollarSign, Filter, Search } from 'lucide-react';
import { payrollCycleColumns } from './components/payrollCycleColumns';
import { recentPayrollRunColumns } from './components/recentPayrollRunColumns';

interface PayrollCycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: string;
}

interface RecentPayrollRun {
  id: number;
  cycle: string;
  date: string;
  employeesPaid: number;
  totalAmount: string;
  status: string;
}

const payrollCycles: PayrollCycle[] = [
  {
    id: 1,
    name: "Monthly Payroll - November 2024",
    startDate: "2024-11-01",
    endDate: "2024-11-30",
    status: "Completed",
    totalAmount: "$1,200,000.00",
  },
  {
    id: 2,
    name: "Bi-Weekly Payroll - Nov 1-15 2024",
    startDate: "2024-11-01",
    endDate: "2024-11-15",
    status: "Completed",
    totalAmount: "$600,000.00",
  },
  {
    id: 3,
    name: "Monthly Payroll - December 2024",
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    status: "Pending",
    totalAmount: "$1,300,000.00",
  },
];

const recentPayrollRuns: RecentPayrollRun[] = [
  {
    id: 101,
    cycle: "Monthly Payroll - October 2024",
    date: "2024-10-28",
    employeesPaid: 5000,
    totalAmount: "$1,150,000.00",
    status: "Paid",
  },
  {
    id: 102,
    cycle: "Bi-Weekly Payroll - Oct 16-31 2024",
    date: "2024-11-01",
    employeesPaid: 2500,
    totalAmount: "$580,000.00",
    status: "Paid",
  },
  {
    id: 103,
    cycle: "Monthly Payroll - September 2024",
    date: "2024-09-25",
    employeesPaid: 4900,
    totalAmount: "$1,100,000.00",
    status: "Paid",
  },
];

export default function PayrollPage() {
    return (
    <div className="space-y-8">
      {/* Payroll Overview Statistics */}
      <DashboardCard>
        <h2 className="text-xl font-semibold mb-4">Payroll Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
            <div>
              <p className="text-sm text-textSecondary">Total Payroll Cycles</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <CalendarDays className="h-8 w-8 text-textAccent" />
          </div>
          <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
            <div>
              <p className="text-sm text-textSecondary">Total Amount Processed (YTD)</p>
              <p className="text-2xl font-bold">$15.5M</p>
            </div>
            <DollarSign className="h-8 w-8 text-textAccent" />
          </div>
          <div className="bg-sidebarItemHoverBg p-4 rounded-md flex items-center justify-between">
            <div>
              <p className="text-sm text-textSecondary">Pending Cycles</p>
              <p className="text-2xl font-bold">2</p>
            </div>
            <Clock className="h-8 w-8 text-textAccent" />
          </div>
        </div>
      </DashboardCard>

      {/* Current & Upcoming Payroll Cycles */}
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Current & Upcoming Payroll Cycles</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search cycles..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Button variant="secondary" className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
        </div>
      </div>
        <DashboardTable data={payrollCycles} columns={payrollCycleColumns} />
      </DashboardCard>

      {/* Recent Payroll Runs */}
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Payroll Runs</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search runs..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Button variant="secondary" className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>
        <DashboardTable data={recentPayrollRuns} columns={recentPayrollRunColumns} />
      </DashboardCard>
    </div>
  );
}



