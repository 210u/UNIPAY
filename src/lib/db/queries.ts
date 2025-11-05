/**
 * Database query helpers for Unipay
 * Type-safe database queries using Supabase
 */

import { supabase, type Tables } from '../supabase/client';

// Types
export type Employee = Tables<'employees'>;
export type UserProfile = Tables<'user_profiles'>;
export type Timesheet = Tables<'timesheets'>;
export type TimeEntry = Tables<'time_entries'>;
export type PayrollPayment = Tables<'payroll_payments'>;
export type JobPosition = Tables<'job_positions'>;
export type EmployeeAssignment = Tables<'employee_assignments'>;

/**
 * Get current user's profile
 */
export async function getCurrentUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get current user's employee record
 */
export async function getCurrentEmployee() {
  const profile = await getCurrentUserProfile();

  const { data, error } = await supabase
    .from('employees')
    .select(`
      *,
      department:departments(*),
      user:user_profiles(*)
    `)
    .eq('user_id', profile.id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get employee's active assignments
 */
export async function getEmployeeAssignments(employeeId: string) {
  const { data, error } = await supabase
    .from('employee_assignments')
    .select(`
      *,
      job_position:job_positions(*),
      department:departments(*)
    `)
    .eq('employee_id', employeeId)
    .eq('is_active', true)
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get employee's timesheets
 */
export async function getEmployeeTimesheets(
  employeeId: string,
  status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'processed' | 'paid'
) {
  let query = supabase
    .from('timesheets')
    .select(`
      *,
      assignment:employee_assignments(
        *,
        job_position:job_positions(*)
      )
    `)
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Get timesheet with entries
 */
export async function getTimesheetWithEntries(timesheetId: string) {
  const { data, error } = await supabase
    .from('timesheets')
    .select(`
      *,
      time_entries(*),
      assignment:employee_assignments(
        *,
        job_position:job_positions(*)
      )
    `)
    .eq('id', timesheetId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new timesheet
 */
export async function createTimesheet(data: {
  employeeId: string;
  assignmentId: string;
  periodStartDate: string;
  periodEndDate: string;
}) {
  const { data: timesheet, error } = await supabase
    .from('timesheets')
    .insert({
      employee_id: data.employeeId,
      assignment_id: data.assignmentId,
      period_start_date: data.periodStartDate,
      period_end_date: data.periodEndDate,
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw error;
  return timesheet;
}

/**
 * Add time entry to timesheet
 */
export async function addTimeEntry(data: {
  timesheetId: string;
  workDate: string;
  hoursWorked: number;
  description?: string;
  entryType?: 'regular' | 'overtime' | 'holiday' | 'sick_leave' | 'vacation';
}) {
  const { data: entry, error } = await supabase
    .from('time_entries')
    .insert({
      timesheet_id: data.timesheetId,
      work_date: data.workDate,
      hours_worked: data.hoursWorked,
      description: data.description,
      entry_type: data.entryType || 'regular',
    })
    .select()
    .single();

  if (error) throw error;
  return entry;
}

/**
 * Submit timesheet for approval
 */
export async function submitTimesheet(timesheetId: string, userId: string) {
  // First validate the timesheet
  const { data: isValid, error: validateError } = await supabase
    .rpc('validate_timesheet', { timesheet_id_param: timesheetId });

  if (validateError) throw validateError;
  if (!isValid) throw new Error('Timesheet validation failed');

  // Submit the timesheet
  const { data, error } = await supabase
    .from('timesheets')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      submitted_by: userId,
    })
    .eq('id', timesheetId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get employee's payment history
 */
export async function getEmployeePayments(employeeId: string, limit = 10) {
  const { data, error } = await supabase
    .from('payroll_payments')
    .select(`
      *,
      payroll_run:payroll_runs(
        *,
        payroll_period:payroll_periods(*)
      ),
      assignment:employee_assignments(
        *,
        job_position:job_positions(*)
      )
    `)
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Get year-to-date earnings
 */
export async function getYTDEarnings(employeeId: string, year?: number) {
  const { data, error } = await supabase
    .rpc('get_ytd_earnings', {
      employee_id_param: employeeId,
      year_param: year || new Date().getFullYear(),
    });

  if (error) throw error;
  return data;
}

/**
 * Calculate gross pay for assignment
 */
export async function calculateGrossPay(
  assignmentId: string,
  regularHours: number,
  overtimeHours: number = 0
) {
  const { data, error } = await supabase
    .rpc('calculate_gross_pay', {
      assignment_id_param: assignmentId,
      regular_hours_param: regularHours,
      overtime_hours_param: overtimeHours,
    });

  if (error) throw error;
  return data;
}

/**
 * Get available job positions for a university
 */
export async function getAvailableJobPositions(universityId: string) {
  const { data, error } = await supabase
    .from('job_positions')
    .select(`
      *,
      department:departments(*)
    `)
    .eq('university_id', universityId)
    .eq('status', 'active')
    .order('title');

  if (error) throw error;
  return data;
}



