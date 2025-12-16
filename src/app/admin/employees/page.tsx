import React from 'react';
import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/database.types';
import EmployeesClient from './EmployeesClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Employees | University Payroll System',
  description: 'Manage employees and view their payroll details',
};

type Employee = Database['public']['Tables']['employees']['Row'] & {
  user_profiles: Database['public']['Tables']['user_profiles']['Row'] | null;
  departments: Database['public']['Tables']['departments']['Row'] | null;
};

async function getEmployees(): Promise<Employee[]> {
  const supabase = createServerSupabaseClient(); // Use the centralized server client

  const { data, error } = await supabase
    .from('employees')
    .select('*, user_profiles(*), departments(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }

  return data as unknown as Employee[];
}

export default async function EmployeesPage() {
  const employees = await getEmployees();
  const totalEmployees = employees.length;
  const totalDepartments = new Set(employees.map(emp => emp.department_id)).size;
  const recentHires = employees.filter(emp => {
    if (!emp.hire_date) return false; // Skip if hire_date is null
    const hireDate = new Date(emp.hire_date);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return hireDate >= threeMonthsAgo;
  }).length;

  return (
    <EmployeesClient
      employees={employees}
      stats={{
        totalEmployees,
        totalDepartments,
        recentHires,
      }}
    />
  );
}