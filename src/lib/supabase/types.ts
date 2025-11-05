export type UserRole = 'admin' | 'staff' | 'faculty';
export type EmploymentStatus = 'active' | 'inactive' | 'on_leave';

export interface Profile {
  id: string;
  updated_at: string;
  username: string;
  full_name: string;
  avatar_url: string;
  role: UserRole;
  department: string;
  employee_id: string;
  employment_status: EmploymentStatus;
  date_joined: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  head_id: string;
  created_at: string;
  updated_at: string;
}

export interface SalaryStructure {
  id: string;
  title: string;
  base_salary: number;
  allowances: Record<string, number>;
  deductions: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  salary_structure_id: string;
  pay_period_start: string;
  pay_period_end: string;
  gross_pay: number;
  net_pay: number;
  deductions: Record<string, number>;
  allowances: Record<string, number>;
  status: 'pending' | 'processed' | 'paid';
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaveRecord {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

