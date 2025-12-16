import React from 'react';
import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import DashboardCard from '@/components/common/DashboardCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ChevronLeft, Check, X, Info, Calendar } from 'lucide-react';
import Link from 'next/link';
import { approveTimesheet, rejectTimesheet } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Timesheet Details | University Payroll System',
  description: 'View and approve/reject employee timesheets',
};

type Timesheet = Database['public']['Tables']['timesheets']['Row'] & {
  employees: (Database['public']['Tables']['employees']['Row'] & {
    user_profiles: Database['public']['Tables']['user_profiles']['Row'] | null;
  }) | null;
  time_entries: Database['public']['Tables']['time_entries']['Row'][];
  approved_by_user: Database['public']['Tables']['user_profiles']['Row'] | null;
};

async function getTimesheetDetails(timesheetId: string): Promise<Timesheet | null> {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data, error } = await supabase
    .from('timesheets')
    .select(
      `
        *,
        employees(user_profiles(first_name, last_name, email)),
        time_entries(*),
        approved_by_user:user_profiles(first_name, last_name)
      `
    )
    .eq('id', timesheetId)
    .single();

  if (error) {
    console.error('Error fetching timesheet details:', error);
    return null;
  }

  return data;
}

export default async function TimesheetDetailPage({ params }: { params: { id: string } }) {
  const timesheet = await getTimesheetDetails(params.id);

  if (!timesheet) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Timesheet Not Found</h1>
        <p className="text-textSecondary">The timesheet you are looking for does not exist.</p>
        <Link href="/admin/timesheets" className="mt-4 inline-block">
          <Button>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Timesheets List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/admin/timesheets">
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Timesheets List
        </Button>
      </Link>

      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Timesheet: {timesheet.timesheet_number}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Timesheet Details</h2>
            <div className="space-y-3">
              <p className="flex items-center text-textSecondary">
                <Info className="h-4 w-4 mr-2 text-textAccent" />
                Employee: <span className="font-medium ml-1">{timesheet.employees?.user_profiles?.first_name} {timesheet.employees?.user_profiles?.last_name}</span>
              </p>
              <p className="flex items-center text-textSecondary">
                <Calendar className="h-4 w-4 mr-2 text-textAccent" />
                Period: <span className="font-medium ml-1">{timesheet.period_start_date} to {timesheet.period_end_date}</span>
              </p>
              <p className="flex items-center text-textSecondary">
                <Info className="h-4 w-4 mr-2 text-textAccent" />
                Total Hours: <span className="font-medium ml-1">{timesheet.total_hours?.toFixed(2) || '0.00'}</span>
              </p>
              <p className="flex items-center text-textSecondary">
                Status:
                <Badge variant={timesheet.status === 'approved' ? 'success' : timesheet.status === 'rejected' ? 'danger' : 'warning'} className="ml-2">
                  {timesheet.status}
                </Badge>
              </p>
              {timesheet.submission_date && (
                <p className="flex items-center text-textSecondary">
                  <Calendar className="h-4 w-4 mr-2 text-textAccent" />
                  Submitted On: <span className="font-medium ml-1">{new Date(timesheet.submission_date).toLocaleDateString()}</span>
                </p>
              )}
              {timesheet.approved_by && timesheet.approved_at && (
                <p className="flex items-center text-textSecondary">
                  <Info className="h-4 w-4 mr-2 text-textAccent" />
                  Approved By: <span className="font-medium ml-1">{timesheet.approved_by_user?.first_name} {timesheet.approved_by_user?.last_name}</span> on <span className="font-medium ml-1">{new Date(timesheet.approved_at).toLocaleDateString()}</span>
                </p>
              )}
              {timesheet.notes && (
                <p className="text-textSecondary">
                  Notes: <span className="font-medium ml-1">{timesheet.notes}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Time Entries</h2>
          {timesheet.time_entries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">Date</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">Start Time</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">End Time</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">Hours</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-textSecondary">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {timesheet.time_entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-textPrimary">{entry.work_date}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-textSecondary">{entry.start_time}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-textSecondary">{entry.end_time}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-textSecondary">{entry.hours_worked?.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm text-textSubtle">{entry.description || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-textSecondary">No time entries for this timesheet.</p>
          )}
        </div>

        {timesheet.status === 'submitted' && (
          <div className="flex justify-end space-x-4 mt-8">
            <form action={rejectTimesheet}>
              <input type="hidden" name="timesheetId" value={timesheet.id} />
              <Button type="submit" variant="danger" className="flex items-center space-x-2">
                <X className="h-4 w-4" />
                <span>Reject Timesheet</span>
              </Button>
            </form>
            <form action={approveTimesheet}>
              <input type="hidden" name="timesheetId" value={timesheet.id} />
              <Button type="submit" variant="success" className="flex items-center space-x-2">
                <Check className="h-4 w-4" />
                <span>Approve Timesheet</span>
              </Button>
            </form>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}

