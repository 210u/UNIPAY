 'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface TimeEntryData {
  id?: string; // id is optional for new entries
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

export async function updateTimesheetAndEntries(formData: FormData, timeEntries: TimeEntryData[], timesheetId: string) {
  const supabase = await createSupabaseServerClient();

  const assignmentId = formData.get('assignmentId') as string;
  const periodStartDate = formData.get('periodStartDate') as string;
  const periodEndDate = formData.get('periodEndDate') as string;
  const notes = formData.get('notes') as string | null;

  // Calculate total hours from time entries
  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hoursWorked, 0);

  // 1. Update timesheet entry
  const { error: timesheetError } = await supabase
    .from('timesheets')
    .update({
      assignment_id: assignmentId,
      period_start_date: periodStartDate,
      period_end_date: periodEndDate,
      total_hours: totalHours,
      notes,
    })
    .eq('id', timesheetId);

  if (timesheetError) {
    console.error('Error updating timesheet:', timesheetError);
    return { error: timesheetError.message };
  }

  // 2. Handle time entries: update existing, insert new, delete removed
  const existingEntryIds = timeEntries.filter(entry => entry.id).map(entry => entry.id);
  
  // Delete entries that are no longer in the form
  const { data: currentDbEntries, error: fetchError } = await supabase
    .from('time_entries')
    .select('id')
    .eq('timesheet_id', timesheetId);

  if (fetchError) {
    console.error('Error fetching current time entries:', fetchError);
    return { error: fetchError.message };
  }

  const dbEntryIds = currentDbEntries.map(entry => entry.id);
  const entriesToDelete = dbEntryIds.filter(dbId => !existingEntryIds.includes(dbId));

  if (entriesToDelete.length > 0) {
    const { error: deleteError } = await supabase.from('time_entries').delete().in('id', entriesToDelete);
    if (deleteError) {
      console.error('Error deleting old time entries:', deleteError);
      return { error: deleteError.message };
    }
  }

  for (const entry of timeEntries) {
    const entryData = {
      timesheet_id: timesheetId,
      work_date: entry.workDate,
      start_time: entry.startTime,
      end_time: entry.endTime,
      hours_worked: entry.hoursWorked,
      description: entry.description,
      entry_type: entry.entryType as Database['public']['Enums']['time_entry_type'],
    };

    if (entry.id) {
      // Update existing entry
      const { error: updateEntryError } = await supabase.from('time_entries').update(entryData).eq('id', entry.id);
      if (updateEntryError) {
        console.error('Error updating time entry:', updateEntryError);
        return { error: updateEntryError.message };
      }
    } else {
      // Insert new entry
      const { error: insertEntryError } = await supabase.from('time_entries').insert(entryData);
      if (insertEntryError) {
        console.error('Error inserting new time entry:', insertEntryError);
        return { error: insertEntryError.message };
      }
    }
  }

  revalidatePath('/dashboard/timesheets');
  revalidatePath(`/dashboard/timesheets/${timesheetId}/edit`);
  redirect('/dashboard/timesheets');
}

export async function submitTimesheetForApproval(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const timesheetId = formData.get('timesheetId') as string;

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('Error getting user for timesheet submission:', userError);
    return { error: userError?.message || 'User not authenticated.' };
  }

  // First validate the timesheet (using the rpc function from db/queries.ts if available or re-implement logic)
  // For now, assuming direct submission is allowed after save.

  const { error } = await supabase
    .from('timesheets')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      submitted_by: user.id,
    })
    .eq('id', timesheetId);

  if (error) {
    console.error('Error submitting timesheet for approval:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/timesheets');
  revalidatePath(`/dashboard/timesheets/${timesheetId}/edit`);
  redirect('/dashboard/timesheets');
}

