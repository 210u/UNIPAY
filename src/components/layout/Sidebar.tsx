"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, DollarSign, PiggyBank, ReceiptText, BarChart3, UserRoundCog, // Essentials
  CheckCircle, // Projects
  BriefcaseBusiness, Settings2, AppWindow, // Management
  LifeBuoy, LogOut, // Footer
  Search, ChevronRight, Plus, Home, Calendar, FileText, GitPullRequestArrow, Bell, HardDrive, Settings, FolderOpen, Link2, MonitorDot // New icons for management, support and apps
} from 'lucide-react';
import Link from 'next/link';
// import Image from 'next/image'; // Removed Image import
import { usePathname } from 'next/navigation';

const navItems = [
  {
    category: "Essentials",
    items: [
      { name: "Home", icon: Home, href: "/admin" },
      { name: "Employees", icon: Users, href: "/admin/employees" },
      { name: "Payroll", icon: DollarSign, href: "/admin/payroll" },
      { name: "Allowances", icon: PiggyBank, href: "/admin/allowances" },
      { name: "Deductions", icon: ReceiptText, href: "/admin/deductions" },
      { name: "Reports", icon: BarChart3, href: "/admin/reports" },
      { name: "Users", icon: UserRoundCog, href: "/admin/users" },
    ],
  },
  {
    category: "Projects",
    items: [
      { name: "Atlas CRM Revamp", icon: CheckCircle, href: "#" },
      { name: "Nimbus Dashboard", icon: CheckCircle, href: "#" },
      { name: "Orion API Gateway", icon: CheckCircle, href: "#" },
      { name: "Hello Task System", icon: CheckCircle, href: "#" },
    ],
  },
  {
    category: "Management",
    items: [
      { name: "Departments", icon: BriefcaseBusiness, href: "#" },
      { name: "System Settings", icon: Settings2, href: "#" },
      { name: "Integrations", icon: AppWindow, href: "#" },
    ],
  },
  {
    category: "Support",
    items: [
      { name: "Settings", icon: Settings, href: "#" },
      { name: "Releases", icon: GitPullRequestArrow, href: "#" },
    ],
  },
  {
    category: "Apps",
    items: [
      { name: "Trello", icon: MonitorDot, href: "#" },
      { name: "Figma", icon: FolderOpen, href: "#" },
    ],
  },
];

const Sidebar = () => {
  const [openCategory, setOpenCategory] = useState<string | null>("Essentials");
  const pathname = usePathname();

  const toggleCategory = (category: string) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  return (
    <div className="w-64 bg-sidebarBg text-sidebarItemText p-4 flex flex-col h-screen sticky top-0 neumorphic-subtle" style={{ boxShadow: 'var(--neumorphic-shadow-subtle)' }}>
      {/* User Profile */}
      <div className="flex items-center space-x-2 mb-6 p-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden neumorphic-subtle">
          {/* <Image src="/images/unipay-logo.png" alt="Unipay Logo" width={24} height={24} className="object-cover" /> */}
          <span className="font-bold text-textPrimary text-sm">UN</span>
        </div>
        <div>
          <p className="font-medium text-sm text-textPrimary">UNIPAY</p>
          <p className="text-xs text-textSubtle">University payroll system</p>
        </div>
        <ChevronRight className="h-4 w-4 text-textSubtle ml-auto" />
      </div>

      {/* Search */}
      <div className="mb-6 p-2 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full py-2 pl-10 pr-3 rounded-md bg-inputBg neumorphic-inset text-textPrimary placeholder:text-inputPlaceholder focus:outline-none focus:ring-2 focus:ring-inputFocusRing transition-shadow"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar">
        {navItems.map((category) => (
          <div key={category.category} className="mb-2">
            <button
              onClick={() => toggleCategory(category.category)}
              className="w-full flex items-center justify-between p-2 text-xs font-semibold text-textSecondary hover:text-textPrimary"
            >
              <span>{category.category}</span>
              <motion.div
                initial={false}
                animate={{ rotate: openCategory === category.category ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            </button>
            <AnimatePresence>
              {openCategory === category.category && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden mt-2"
                >
                  {category.items.map((item) => (
                    <Link
                      href={item.href}
                      key={item.name}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm transition-colors
                            ${pathname === item.href
                              ? 'bg-sidebarItemActiveBg text-sidebarItemActiveText'
                              : 'text-sidebarItemText hover:bg-sidebarItemHoverBg hover:text-sidebarItemActiveText'
                            }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="mt-auto p-2 neumorphic-divider">
        <Link href="#"
          className="flex items-center space-x-3 p-2 rounded-md text-sm text-textSecondary hover:bg-sidebarItemHoverBg hover:text-textPrimary"
        >
          <LifeBuoy className="h-4 w-4" />
          <span>Support</span>
        </Link>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex items-center space-x-3 p-2 rounded-md text-sm text-red-500 hover:bg-sidebarItemHoverBg w-full text-left"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Sidebar;

