import React, { useState, useEffect } from 'react';
import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import DashboardCard from '@/components/common/DashboardCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Label from '@/components/ui/Label';
import { ChevronLeft, Save, PlusCircle, Trash2, Check } from 'lucide-react';
import Link from 'next/link';
import Select from '@/components/ui/Select';
import { updateTimesheetAndEntries, submitTimesheetForApproval } from './actions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit Timesheet | University Payroll System',
  description: 'Edit an existing timesheet and its entries',
};

type EmployeeAssignment = Database['public']['Tables']['employee_assignments']['Row'] & {
  job_positions: Database['public']['Tables']['job_positions']['Row'] | null;
};

type TimesheetWithEntries = Database['public']['Tables']['timesheets']['Row'] & {
  time_entries: Database['public']['Tables']['time_entries']['Row'][];
};

async function getTimesheetDetails(timesheetId: string): Promise<TimesheetWithEntries | null> {
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
        time_entries(*)
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

async function getCurrentEmployeeAssignments(): Promise<EmployeeAssignment[]> {
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/signin');
  }

  const { data: employeeData, error: employeeError } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (employeeError || !employeeData) {
    console.error('Error fetching employee ID for assignments:', employeeError);
    return [];
  }

  const { data, error } = await supabase
    .from('employee_assignments')
    .select(
      `
        *,
        job_positions(title)
      `
    )
    .eq('employee_id', employeeData.id)
    .eq('is_active', true)
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching employee assignments:', error);
    return [];
  }

  return data;
}

export default async function EditTimesheetPage({ params }: { params: { id: string } }) {
  const timesheet = await getTimesheetDetails(params.id);
  const assignments = await getCurrentEmployeeAssignments();

  if (!timesheet) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Timesheet Not Found</h1>
        <p className="text-textSecondary">The timesheet you are looking for does not exist.</p>
        <Link href="/dashboard/timesheets" className="mt-4 inline-block">
          <Button>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to My Timesheets
          </Button>
        </Link>
      </div>
    );
  }

  const [timeEntries, setTimeEntries] = useState<{ id?: string; workDate: string; startTime: string; endTime: string; hoursWorked: number; description: string; entryType: string }[]>((
    timesheet.time_entries.map(entry => ({
      id: entry.id,
      workDate: entry.work_date || '',
      startTime: entry.start_time || '',
      endTime: entry.end_time || '',
      hoursWorked: entry.hours_worked || 0,
      description: entry.description || '',
      entryType: entry.entry_type || 'regular',
    }))
  ));

  const addTimeEntryRow = () => {
    setTimeEntries([...timeEntries, { workDate: '', startTime: '', endTime: '', hoursWorked: 0, description: '', entryType: 'regular' }]);
  };

  const handleTimeEntryChange = (index: number, field: string, value: any) => {
    const newEntries = [...timeEntries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    
    // Calculate hours worked if start and end times are available
    if (field === 'startTime' || field === 'endTime') {
      const start = newEntries[index].startTime;
      const end = newEntries[index].endTime;
      if (start && end) {
        const startDate = new Date(`2000-01-01T${start}:00`);
        const endDate = new Date(`2000-01-01T${end}:00`);
        let hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
        if (hours < 0) hours += 24; // Handle overnight shifts
        newEntries[index].hoursWorked = parseFloat(hours.toFixed(2));
      } else {
        newEntries[index].hoursWorked = 0;
      }
    }

    setTimeEntries(newEntries);
  };

  const removeTimeEntryRow = (index: number) => {
    const newEntries = timeEntries.filter((_, i) => i !== index);
    setTimeEntries(newEntries);
  };

  const isEditable = timesheet.status === 'draft' || timesheet.status === 'rejected';

  return (
    <div className="space-y-8">
      <Link href="/dashboard/timesheets">
        <Button variant="secondary">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to My Timesheets
        </Button>
      </Link>

      <DashboardCard>
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Edit Timesheet: {timesheet.timesheet_number}</h1>
        <p className="text-textSecondary mb-4">Status: <Badge variant={timesheet.status === 'approved' ? 'success' : timesheet.status === 'rejected' ? 'danger' : 'warning'}>{timesheet.status}</Badge></p>

        <form className="space-y-6" action={async (formData) => {
          await updateTimesheetAndEntries(formData, timeEntries, timesheet.id);
        }}>
          <input type="hidden" name="timesheetId" value={timesheet.id} />

          <h2 className="text-xl font-semibold mb-4">Timesheet Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignmentId">Assignment</Label>
              <Select id="assignmentId" name="assignmentId" required defaultValue={timesheet.assignment_id || ''} disabled={!isEditable}>
                <option value="">Select an assignment</option>
                {assignments.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.job_positions?.title} ({assignment.assignment_number})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="periodStartDate">Period Start Date</Label>
              <Input id="periodStartDate" name="periodStartDate" type="date" required defaultValue={timesheet.period_start_date || ''} disabled={!isEditable} />
            </div>
            <div>
              <Label htmlFor="periodEndDate">Period End Date</Label>
              <Input id="periodEndDate" name="periodEndDate" type="date" required defaultValue={timesheet.period_end_date || ''} disabled={!isEditable} />
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input id="notes" name="notes" type="text" placeholder="Any notes for this timesheet" defaultValue={timesheet.notes || ''} disabled={!isEditable} />
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4 mt-8">Time Entries</h2>
          <div className="space-y-4">
            {timeEntries.map((entry, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-md relative group">
                {isEditable && (
                  <button 
                    type="button" 
                    onClick={() => removeTimeEntryRow(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <div>
                  <Label htmlFor={`workDate-${index}`}>Date</Label>
                  <Input 
                    id={`workDate-${index}`} 
                    name={`workDate-${index}`} 
                    type="date" 
                    required 
                    value={entry.workDate}
                    onChange={(e) => handleTimeEntryChange(index, 'workDate', e.target.value)}
                    disabled={!isEditable}
                  />
                </div>
                <div>
                  <Label htmlFor={`startTime-${index}`}>Start Time</Label>
                  <Input 
                    id={`startTime-${index}`} 
                    name={`startTime-${index}`} 
                    type="time" 
                    required 
                    value={entry.startTime}
                    onChange={(e) => handleTimeEntryChange(index, 'startTime', e.target.value)}
                    disabled={!isEditable}
                  />
                </div>
                <div>
                  <Label htmlFor={`endTime-${index}`}>End Time</Label>
                  <Input 
                    id={`endTime-${index}`} 
                    name={`endTime-${index}`} 
                    type="time" 
                    required 
                    value={entry.endTime}
                    onChange={(e) => handleTimeEntryChange(index, 'endTime', e.target.value)}
                    disabled={!isEditable}
                  />
                </div>
                <div>
                  <Label htmlFor={`hoursWorked-${index}`}>Hours</Label>
                  <Input 
                    id={`hoursWorked-${index}`} 
                    name={`hoursWorked-${index}`} 
                    type="number" 
                    step="0.01" 
                    readOnly 
                    value={entry.hoursWorked}
                    className="bg-gray-100"
                    disabled={!isEditable}
                  />
                </div>
                <div>
                  <Label htmlFor={`entryType-${index}`}>Type</Label>
                  <Select 
                    id={`entryType-${index}`} 
                    name={`entryType-${index}`} 
                    required 
                    value={entry.entryType}
                    onChange={(e) => handleTimeEntryChange(index, 'entryType', e.target.value)}
                    disabled={!isEditable}
                  >
                    <option value="regular">Regular</option>
                    <option value="overtime">Overtime</option>
                    <option value="holiday">Holiday</option>
                    <option value="sick_leave">Sick Leave</option>
                    <option value="vacation">Vacation</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Input 
                    id={`description-${index}`} 
                    name={`description-${index}`} 
                    type="text" 
                    placeholder="Work on project X" 
                    value={entry.description}
                    onChange={(e) => handleTimeEntryChange(index, 'description', e.target.value)}
                    disabled={!isEditable}
                  />
                </div>
              </div>
            ))}
            {isEditable && (
              <Button type="button" variant="outline" onClick={addTimeEntryRow} className="flex items-center space-x-2">
                <PlusCircle className="h-4 w-4" />
                <span>Add Time Entry</span>
              </Button>
            )}
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button type="button" variant="secondary" asChild>
              <Link href="/dashboard/timesheets">
                Cancel
              </Link>
            </Button>
            {isEditable && (
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            )}
            {(timesheet.status === 'draft' || timesheet.status === 'rejected') && (
              <form action={submitTimesheetForApproval}>
                <input type="hidden" name="timesheetId" value={timesheet.id} />
                <Button type="submit" variant="success" className="flex items-center space-x-2">
                  <Check className="h-4 w-4" />
                  <span>Submit for Approval</span>
                </Button>
              </form>
            )}
          </div>
        </form>
      </DashboardCard>
    </div>
  );
}

