 'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import { redirect } from 'next/navigation';

interface TimeEntryData {
  workDate: string;
  startTime: string;
  endTime: string;
  hoursWorked: number;
  description: string;
  entryType: string;
}

async function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

export async function createTimesheetAndEntries(formData: FormData, timeEntries: TimeEntryData[], employeeId: string) {
  const supabase = await createSupabaseServerClient();

  const assignmentId = formData.get('assignmentId') as string;
  const periodStartDate = formData.get('periodStartDate') as string;
  const periodEndDate = formData.get('periodEndDate') as string;
  const notes = formData.get('notes') as string | null;

  // Calculate total hours from time entries
  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hoursWorked, 0);

  // 1. Create timesheet entry
  const { data: timesheetData, error: timesheetError } = await supabase
    .from('timesheets')
    .insert({
      employee_id: employeeId,
      assignment_id: assignmentId,
      period_start_date: periodStartDate,
      period_end_date: periodEndDate,
      total_hours: totalHours,
      status: 'draft',
      notes,
    })
    .select()
    .single();

  if (timesheetError) {
    console.error('Error creating timesheet:', timesheetError);
    return { error: timesheetError.message };
  }

  const timesheetId = timesheetData.id;

  // 2. Insert time entries
  const timeEntriesToInsert = timeEntries.map(entry => ({
    timesheet_id: timesheetId,
    work_date: entry.workDate,
    start_time: entry.startTime,
    end_time: entry.endTime,
    hours_worked: entry.hoursWorked,
    description: entry.description,
    entry_type: entry.entryType as Database['public']['Enums']['time_entry_type'],
  }));

  if (timeEntriesToInsert.length > 0) {
    const { error: entriesError } = await supabase.from('time_entries').insert(timeEntriesToInsert);

    if (entriesError) {
      console.error('Error inserting time entries:', entriesError);
      // Optionally, roll back timesheet creation here
      return { error: entriesError.message };
    }
  }

  redirect('/dashboard/timesheets');
}

