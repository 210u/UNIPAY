import React from 'react';
import { Metadata } from 'next';
import DashboardCard from '@/components/common/DashboardCard';
import DashboardTable from '@/components/common/DashboardTable';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { BarChart2, Filter, Search } from 'lucide-react';
import { availableReportsColumns } from './components/availableReportsColumns';
import { scheduledReportsColumns } from './components/scheduledReportsColumns';

interface Report {
  id: number;
  name: string;
  type: string;
  dateGenerated: string;
  status: string;
  actions: string;
}

interface ScheduledReport {
  id: number;
  name: string;
  frequency: string;
  nextRun: string;
  status: string;
}

const availableReports: Report[] = [
  {
    id: 1,
    name: "Monthly Payroll Summary",
    type: "Financial",
    dateGenerated: "2024-11-01",
    status: "Completed",
    actions: "Download",
  },
  {
    id: 2,
    name: "Employee Tax Withholdings (Q3)",
    type: "Tax",
    dateGenerated: "2024-10-15",
    status: "Completed",
    actions: "Download",
  },
  {
    id: 3,
    name: "Departmental Expenditure Report",
    type: "Financial",
    dateGenerated: "2024-11-05",
    status: "Pending",
    actions: "View Details",
  },
];

const scheduledReports: ScheduledReport[] = [
  {
    id: 1,
    name: "Bi-Weekly Payroll Report",
    frequency: "Bi-Weekly",
    nextRun: "2024-11-22",
    status: "Active",
  },
  {
    id: 2,
    name: "Annual Employee Earnings Statement",
    frequency: "Annually",
    nextRun: "2025-01-05",
    status: "Active",
  },
  {
    id: 3,
    name: "Quarterly Tax Filing Reminder",
    frequency: "Quarterly",
    nextRun: "2024-12-31",
    status: "Active",
  },
];


export const metadata: Metadata = {
  title: 'Reports | University Payroll System',
  description: 'Generate and manage payroll reports',
};


export default function ReportsPage() {
    return (
    <div className="space-y-8">
      {/* Report Generation Section */}
      <DashboardCard>
        <h2 className="text-xl font-semibold mb-4">Generate New Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-textPrimary mb-1">Report Type</label>
            <select
              id="reportType"
              className="w-full py-2 px-3 rounded-md bg-inputBg border border-inputBorder text-textPrimary focus:outline-none focus:ring-1 focus:ring-inputFocusBorder focus:border-inputFocusBorder"
            >
              <option>Monthly Payroll Summary</option>
              <option>Employee Tax Withholdings</option>
              <option>Departmental Expenditure</option>
              <option>Custom Report</option>
            </select>
          </div>
          <div>
            <label htmlFor="dateRange" className="block text-sm font-medium text-textPrimary mb-1">Date Range</label>
            <Input type="date" id="dateRangeStart" className="mb-2" />
            <Input type="date" id="dateRangeEnd" />
          </div>
        </div>
        <Button variant="primary" className="flex items-center space-x-2 text-sm">
          <BarChart2 className="h-4 w-4" />
          <span>Generate Report</span>
        </Button>
      </DashboardCard>

      {/* Available Reports */}
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recently Generated Reports</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search reports..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Button variant="secondary" className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
        </div>
      </div>
        <DashboardTable data={availableReports} columns={availableReportsColumns} />
      </DashboardCard>

      {/* Scheduled Reports */}
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Scheduled Reports</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
              <Input
                type="text"
                placeholder="Search scheduled reports..."
                className="w-48 py-2 pl-10 pr-3 rounded-md"
              />
            </div>
            <Button variant="secondary" className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>
        <DashboardTable data={scheduledReports} columns={scheduledReportsColumns} />
      </DashboardCard>
    </div>
  );
}



