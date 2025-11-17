"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Users, LayoutDashboard, FileText, Plus, Bell, Settings, BarChart2, UserPlus, FolderPlus, ClipboardPlus } from 'lucide-react';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useRouter } from 'next/navigation';

const tabItems = [
  { name: "Employee Overview", icon: LayoutDashboard },
  { name: "Payroll Cycles", icon: FileText },
  { name: "Reports Overview", icon: BarChart2 },
  { name: "User Management", icon: Users },
];

const DashboardHeader = ({ title }: { title: string }) => {
  const [activeTab, setActiveTab] = useState("Employee Overview");
  const router = useRouter();

  return (
    <div className="bg-headerBg p-4 flex flex-col md:flex-row items-center justify-between sticky top-0 z-10 neumorphic-divider">
      <div className="flex flex-col md:flex-row items-center">
        <h1 className="text-2xl font-bold text-textPrimary mb-2 md:mb-0 md:mr-6">{title}</h1>
        <div className="flex space-x-3">
          {tabItems.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors neumorphic-subtle
                ${activeTab === tab.name
                  ? 'bg-sidebarItemActiveBg text-sidebarItemActiveText'
                  : 'text-textSecondary hover:text-textPrimary hover:bg-sidebarItemHoverBg'
                }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-4 mt-4 md:mt-0">
        <Button
          variant="secondary"
          className="flex items-center space-x-2 text-sm"
          onClick={() => router.push('/admin/employees')}
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Employee</span>
        </Button>
        <Button
          variant="secondary"
          className="flex items-center space-x-2 text-sm"
          onClick={() => router.push('/admin/payroll')}
        >
          <FolderPlus className="h-4 w-4" />
          <span>Create Payroll</span>
        </Button>
        <Button
          variant="primary"
          className="flex items-center space-x-2 text-sm"
          onClick={() => router.push('/admin/reports')}
        >
          <ClipboardPlus className="h-4 w-4" />
          <span>New Report</span>
        </Button>
        {/* Notification and Settings Icons */}
        <Bell className="h-6 w-6 text-textSecondary cursor-pointer hover:text-textPrimary" />
        <Settings className="h-6 w-6 text-textSecondary cursor-pointer hover:text-textPrimary" />
        <ThemeToggle />
      </div>
    </div>
  );
};

export default DashboardHeader;

