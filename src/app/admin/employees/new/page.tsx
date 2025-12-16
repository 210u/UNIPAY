import React from 'react';
import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/database.types';
import AddEmployeeClient from './AddEmployeeClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Add New Employee | University Payroll System',
  description: 'Add a new employee to the system',
};

type Department = Database['public']['Tables']['departments']['Row'];
type JobPosition = Database['public']['Tables']['job_positions']['Row'];

async function getUniversityId(): Promise<string | null> {
  // TODO: wire this to actual user->university relation when auth is finalized.
  return null;
}

async function getDepartments(): Promise<Department[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.from('departments').select('id, name').order('name', { ascending: true });

  if (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
  return data;
}

async function getJobPositions(): Promise<JobPosition[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.from('job_positions').select('id, title, pay_rate_type').order('title', { ascending: true });

  if (error) {
    console.error('Error fetching job positions:', error);
    return [];
  }
  return data;
}

export default async function AddEmployeePage() {
  const departments = await getDepartments();
  const jobPositions = await getJobPositions();
  const universityId = await getUniversityId();

  return (
    <AddEmployeeClient
      departments={departments}
      jobPositions={jobPositions}
      universityId={universityId}
    />
  );
}
