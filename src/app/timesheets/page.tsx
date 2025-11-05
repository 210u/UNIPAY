import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import TimesheetsContent from '@/components/timesheets/TimesheetsContent';
import Link from 'next/link';

export default async function TimesheetsPage() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/signin');
  }

  // Get employee data
  const { data: employee } = await supabase
    .from('employees')
    .select(`
      *,
      department:departments(*),
      university:universities(*)
    `)
    .eq('user_id', session.user.id)
    .single();

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Employee Profile Required
          </h2>
          <p className="text-gray-600">
            Please contact HR to set up your employee profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Timesheets</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your work hours and submit timesheets for approval
            </p>
          </div>
          <Link
            href="/timesheets/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            + New Timesheet
          </Link>
        </div>

        <TimesheetsContent employeeId={employee.id} />
      </div>
    </div>
  );
}



