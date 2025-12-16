// src/components/layout/Sidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  DollarSign,
  ClipboardList,
  FileText,
  Settings,
  Shield,
  BriefcaseBusiness,
  CreditCard,
  Building,
  GraduationCap,
  Scale,
  CalendarCheck,
  Timer,
  BookText,
  Clock,
  LogOut,
  ChevronRight,
  ChevronLeft,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';
import { getClientSupabase } from '@/lib/supabase/client-utils'; // Import the client-side Supabase client

interface SidebarProps {} // No longer takes userRole as a prop

const navItems = [
  {
    category: 'General',
    items: [
      { name: 'Home', href: '/', icon: Home, roles: ['employee'] },
    ],
  },
  {
    category: 'Administration',
    items: [
      { name: 'Employees', href: '/admin/employees', icon: Users, roles: ['university_admin', 'system_admin', 'hr_staff', 'payroll_officer', 'department_head'] },
      { name: 'Departments', href: '/admin/departments', icon: Building, roles: ['university_admin', 'system_admin', 'hr_staff', 'department_head'] },
      { name: 'Job Positions', href: '/admin/job-positions', icon: BriefcaseBusiness, roles: ['university_admin', 'system_admin', 'hr_staff'] },
      { name: 'Salary Grades', href: '/admin/salary-grades', icon: Scale, roles: ['university_admin', 'system_admin', 'hr_staff'] },
      { name: 'Allowances', href: '/admin/allowances', icon: PlusCircle, roles: ['university_admin', 'system_admin', 'payroll_officer'] },
      { name: 'Deductions', href: '/admin/deductions', icon: MinusCircle, roles: ['university_admin', 'system_admin', 'payroll_officer'] },
      { name: 'Assignments', href: '/admin/employee-assignments', icon: ClipboardList, roles: ['university_admin', 'system_admin', 'hr_staff', 'department_head'] },
      { name: 'Employee Allowances', href: '/admin/employee-allowances', icon: PlusCircle, roles: ['university_admin', 'system_admin', 'payroll_officer'] },
      { name: 'Employee Deductions', href: '/admin/employee-deductions', icon: MinusCircle, roles: ['university_admin', 'system_admin', 'payroll_officer'] },
      { name: 'Employee Advances', href: '/admin/employee-advances', icon: CreditCard, roles: ['university_admin', 'system_admin', 'payroll_officer'] },
      { name: 'Payroll Periods', href: '/admin/payroll-periods', icon: CalendarCheck, roles: ['university_admin', 'system_admin', 'payroll_officer'] },
      { name: 'Payroll Runs', href: '/admin/payroll-runs', icon: Timer, roles: ['university_admin', 'system_admin', 'payroll_officer'] },
      { name: 'Timesheets', href: '/admin/timesheets', icon: Clock, roles: ['university_admin', 'system_admin', 'hr_staff', 'department_head', 'payroll_officer'] },
      { name: 'Audit Logs', href: '/admin/audit-logs', icon: BookText, roles: ['university_admin', 'system_admin'] },
      { name: 'Users', href: '/admin/users', icon: Users, roles: ['system_admin'] }, // Example for system_admin specific access
    ],
  },
  {
    category: 'My Account',
    items: [
      { name: 'My Timesheets', href: '/dashboard/timesheets', icon: Clock, roles: ['employee'] },
      { name: 'My Payments', href: '/dashboard/payments', icon: DollarSign, roles: ['employee'] },
      { name: 'My Profile', href: '/dashboard/profile', icon: Settings, roles: ['employee'] },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({}) => { // Removed userRole from props
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [clientUserRole, setClientUserRole] = useState<string | undefined>(undefined); // New state for client-side user role

  useEffect(() => {
    const fetchUserRole = async () => {
      const supabaseClient = getClientSupabase();
      const { data: { user } } = await supabaseClient.auth.getUser();

      if (user) {
        const { data: profile } = await supabaseClient.from('user_profiles').select('role').eq('id', user.id).single();
        setClientUserRole(profile?.role || undefined);
      } else {
        setClientUserRole(undefined);
      }
    };

    fetchUserRole();

  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getFilteredNavItems = () => {
    if (!clientUserRole) { // Use clientUserRole for filtering
      return [];
    }
    const filtered = navItems.map(category => ({
      ...category,
      items: category.items.filter(item => item.roles.includes(clientUserRole)),
    })).filter(category => category.items.length > 0);
    return filtered;
  };

  const filteredNavItems = getFilteredNavItems();

  return (
    <aside
      className={`flex h-screen flex-col flex-shrink-0 bg-gray-800 text-gray-100 transition-all duration-300 ${
        isSidebarOpen ? 'w-[var(--sidebar-width-open)]' : 'w-[var(--sidebar-width-closed)]'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 bg-gray-900 shadow-md">
        {isSidebarOpen ? (
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold">Unipay</span>
          </div>
        ) : (
          <GraduationCap className="h-6 w-6 text-blue-400 mx-auto" />
        )}
        <button onClick={toggleSidebar} className="p-1 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
          {isSidebarOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {filteredNavItems.map((category, categoryIndex) => (
          <div key={category.category} className="mt-4 first:mt-0">
            {isSidebarOpen && (
              <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {category.category}
              </h3>
            )}
            <ul>
              {category.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center group py-2 px-4 rounded-md mx-2 text-sm font-medium transition-colors duration-200
                        ${isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'hover:bg-gray-700 hover:text-white text-gray-300'
                        }`}
                    >
                      <item.icon className={`h-5 w-5 flex-shrink-0 ${isSidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                      {isSidebarOpen && (
                        <span className="whitespace-nowrap">{item.name}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 bg-gray-900 border-t border-gray-700">
        <button
          onClick={() => console.log('Logout action')} // TODO: Replace with actual logout action
          className={`flex items-center group w-full py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200
            hover:bg-red-600 hover:text-white text-gray-300`}
        >
          <LogOut className={`h-5 w-5 flex-shrink-0 ${isSidebarOpen ? 'mr-3' : 'mx-auto'}`} />
          {isSidebarOpen && (
            <span className="whitespace-nowrap">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;