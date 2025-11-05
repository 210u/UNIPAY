'use client';

import { useState, useEffect } from 'react';
import { Tables } from '@/lib/supabase/client';
import {
  getEmployeeAssignments,
  getEmployeeTimesheets,
  getEmployeePayments,
  getYTDEarnings,
} from '@/lib/db/queries';
import StatsCard from './StatsCard';
import TimesheetList from './TimesheetList';
import PaymentHistory from './PaymentHistory';

interface DashboardContentProps {
  profile: Tables<'user_profiles'> | null;
  employee: any | null;
}

export default function DashboardContent({ profile, employee }: DashboardContentProps) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [ytdEarnings, setYtdEarnings] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employee) {
      loadDashboardData();
    }
  }, [employee]);

  async function loadDashboardData() {
    try {
      setLoading(true);

      const [assignmentsData, timesheetsData, paymentsData, ytdData] = await Promise.all([
        getEmployeeAssignments(employee.id),
        getEmployeeTimesheets(employee.id),
        getEmployeePayments(employee.id, 5),
        getYTDEarnings(employee.id),
      ]);

      setAssignments(assignmentsData || []);
      setTimesheets(timesheetsData || []);
      setPayments(paymentsData || []);
      setYtdEarnings(ytdData || 0);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!employee) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Unipay!</h2>
          <p className="text-gray-600">
            Your employee profile is being set up. Please contact HR if you need assistance.
          </p>
        </div>
      </div>
    );
  }

  // Calculate pending timesheets
  const pendingTimesheets = timesheets.filter((t) => t.status === 'draft').length;
  const submittedTimesheets = timesheets.filter((t) => t.status === 'submitted').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.first_name}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {employee.university?.name} • {employee.department?.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="YTD Earnings"
          value={`$${ytdEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Year to date"
          icon="💰"
          color="green"
        />
        <StatsCard
          title="Active Jobs"
          value={assignments.length.toString()}
          subtitle={assignments.length === 1 ? 'Position' : 'Positions'}
          icon="💼"
          color="blue"
        />
        <StatsCard
          title="Pending Timesheets"
          value={pendingTimesheets.toString()}
          subtitle="To submit"
          icon="📋"
          color="yellow"
        />
        <StatsCard
          title="Awaiting Approval"
          value={submittedTimesheets.toString()}
          subtitle="Submitted"
          icon="⏳"
          color="purple"
        />
      </div>

      {/* Active Assignments */}
      <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Active Assignments</h2>
        </div>
        {loading ? (
          <div className="px-6 py-12 text-center text-gray-500">Loading...</div>
        ) : assignments.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No active assignments found.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {assignment.job_position?.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {assignment.department?.name} • {assignment.pay_rate_type === 'hourly' 
                        ? `$${assignment.hourly_rate}/hr` 
                        : `$${assignment.salary_amount}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      assignment.is_approved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {assignment.is_approved ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Timesheets and Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TimesheetList timesheets={timesheets.slice(0, 5)} loading={loading} />
        <PaymentHistory payments={payments} loading={loading} />
      </div>
    </div>
  );
}



