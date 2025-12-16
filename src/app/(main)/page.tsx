import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/database.types';
import SystemAdminDashboard from '@/components/dashboards/SystemAdminDashboard';
import PayrollOfficerDashboard from '@/components/dashboards/PayrollOfficerDashboard';
import UniversityAdminDashboard from '@/components/dashboards/UniversityAdminDashboard';
import HRStaffDashboard from '@/components/dashboards/HRStaffDashboard';
import DepartmentHeadDashboard from '@/components/dashboards/DepartmentHeadDashboard';
import EmployeeDashboard from '@/components/dashboards/EmployeeDashboard';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single();
  const userRole = profile?.role;

  switch (userRole) {
    case 'system_admin':
      return <SystemAdminDashboard />;
    case 'university_admin':
      return <UniversityAdminDashboard />;
    case 'payroll_officer':
      return <PayrollOfficerDashboard />;
    case 'hr_staff':
      return <HRStaffDashboard />;
    case 'department_head':
      return <DepartmentHeadDashboard />;
    case 'employee':
      return <EmployeeDashboard />;
    default:
      // If user has no role or an unrecognized role, redirect to signin or show a generic error
      redirect('/signin?message=Unauthorized access: No valid role found.');
      return null;
  }
}
