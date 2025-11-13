"use client";

import React, { useState } from 'react';
import DashboardCard from '@/components/common/DashboardCard';
import DashboardTable from '@/components/common/DashboardTable';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import ProgressBar from '@/components/ui/ProgressBar';
import { Search, Filter, LayoutDashboard, Users, Clock } from 'lucide-react';

interface Task {
  id: number;
  name: string;
  assignedTo: { name: string; avatar?: string }[];
  category: 'feature' | 'bug' | 'review' | 'testing';
  dueDate: string;
  status: 'high' | 'medium' | 'low'; // Using priority variants for status colors
  progress: number;
}

const payrollTasks: Task[] = [
  {
    id: 1,
    name: "Process Monthly Salaries",
    assignedTo: [{ name: "Alice Brown", avatar: "/avatars/alice.jpg" }, { name: "John Doe", avatar: "/avatars/john.jpg" }],
    category: "feature",
    dueDate: "2024-11-25",
    status: "high",
    progress: 70,
  },
  {
    id: 2,
    name: "Review Q4 Bonus Calculations",
    assignedTo: [{ name: "Jane Smith", avatar: "/avatars/jane.jpg" }],
    category: "review",
    dueDate: "2024-12-10",
    status: "medium",
    progress: 40,
  },
  {
    id: 3,
    name: "Update Tax Deduction Tables",
    assignedTo: [{ name: "Bob Johnson", avatar: "/avatars/bob.jpg" }],
    category: "bug",
    dueDate: "2024-11-30",
    status: "high",
    progress: 90,
  },
  {
    id: 4,
    name: "Onboard New HR Staff",
    assignedTo: [{ name: "Charlie Green", avatar: "/avatars/charlie.jpg" }],
    category: "testing",
    dueDate: "2024-11-20",
    status: "low",
    progress: 20,
  },
];

const approvalTasks: Task[] = [
  {
    id: 5,
    name: "Approve Overtime for November",
    assignedTo: [{ name: "David Lee", avatar: "/avatars/david.jpg" }],
    category: "review",
    dueDate: "2024-11-22",
    status: "high",
    progress: 60,
  },
  {
    id: 6,
    name: "Finalize Annual Leave Requests",
    assignedTo: [{ name: "Eva White", avatar: "/avatars/eva.jpg" }],
    category: "feature",
    dueDate: "2024-11-28",
    status: "medium",
    progress: 80,
  },
];

const columns = [
  {
    key: "name",
    header: "Task name",
    render: (item: Task) => <span className="font-medium text-textPrimary">{item.name}</span>,
  },
  {
    key: "assignedTo",
    header: "Assigned To",
    render: (item: Task) => (
      <div className="flex -space-x-2">
        {item.assignedTo.map((person, idx) => (
          <Avatar key={idx} alt={person.name} src={person.avatar} className="w-6 h-6" />
        ))}
      </div>
    ),
  },
  {
    key: "category",
    header: "Category",
    render: (item: Task) => <Badge variant={item.category}>{item.category}</Badge>,
  },
  {
    key: "dueDate",
    header: "Due Date",
    render: (item: Task) => <span className="text-textSecondary text-sm">{item.dueDate}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (item: Task) => <Badge variant={item.status}>{item.status}</Badge>,
  },
  {
    key: "progress",
    header: "Progress",
    render: (item: Task) => <ProgressBar progress={item.progress} className="w-24" />,
  },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("All tasks");

  return (
    <div className="min-h-screen bg-background text-textPrimary p-4">
      <h1 className="text-3xl font-bold text-textPrimary mb-6">Teams</h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("Department Board")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${activeTab === "Department Board"
              ? 'bg-sidebarItemActiveBg text-sidebarItemActiveText'
              : 'text-textSecondary hover:text-textPrimary hover:bg-sidebarItemHoverBg'
            }`}
        >
          Department Board
        </button>
        <button
          onClick={() => setActiveTab("Team Overview")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${activeTab === "Team Overview"
              ? 'bg-sidebarItemActiveBg text-sidebarItemActiveText'
              : 'text-textSecondary hover:text-textPrimary hover:bg-sidebarItemHoverBg'
            }`}
        >
          Team Overview
        </button>
        <button
          onClick={() => setActiveTab("All tasks")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${activeTab === "All tasks"
              ? 'bg-sidebarItemActiveBg text-sidebarItemActiveText'
              : 'text-textSecondary hover:text-textPrimary hover:bg-sidebarItemHoverBg'
            }`}
        >
          All tasks
        </button>
      </div>

      <div className="space-y-8">
        <DashboardCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Payroll Tasks Overview</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
                <Input
                  type="text"
                  placeholder="Search..."
                  className="w-48 py-2 pl-10 pr-3 rounded-md bg-inputBg border border-inputBorder text-textPrimary placeholder:text-inputPlaceholder focus:outline-none focus:ring-1 focus:ring-inputFocusBorder focus:border-inputFocusBorder"
                />
              </div>
              <Button variant="secondary" className="flex items-center space-x-2 text-sm">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </div>
          </div>
          <DashboardTable data={payrollTasks} columns={columns} />
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Pending Approvals</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
                <Input
                  type="text"
                  placeholder="Search..."
                  className="w-48 py-2 pl-10 pr-3 rounded-md bg-inputBg border border-inputBorder text-textPrimary placeholder:text-inputPlaceholder focus:outline-none focus:ring-1 focus:ring-inputFocusBorder focus:border-inputFocusBorder"
                />
              </div>
              <Button variant="secondary" className="flex items-center space-x-2 text-sm">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </div>
          </div>
          <DashboardTable data={approvalTasks} columns={columns} />
        </DashboardCard>
      </div>
    </div>
  );
}

