'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Clock, Plus } from 'lucide-react';
import { getEmployeeTimesheets } from '@/lib/db/queries';
import Button from '@/components/ui/Button';
import Link from 'next/link';

interface TimesheetsContentProps {
  employeeId: string;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  processed: 'bg-purple-100 text-purple-800',
  paid: 'bg-green-100 text-green-800',
};

const statusLabels = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
  processed: 'Processed',
  paid: 'Paid',
};

export default function TimesheetsContent({ employeeId }: TimesheetsContentProps) {
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadTimesheets();
  }, [employeeId]);

  async function loadTimesheets() {
    try {
      setLoading(true);
      const data = await getEmployeeTimesheets(employeeId);
      setTimesheets(data || []);
    } catch (error) {
      console.error('Error loading timesheets:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTimesheets = filter === 'all' 
    ? timesheets 
    : timesheets.filter(t => t.status === filter);

  const stats = {
    total: timesheets.length,
    draft: timesheets.filter(t => t.status === 'draft').length,
    submitted: timesheets.filter(t => t.status === 'submitted').length,
    approved: timesheets.filter(t => t.status === 'approved').length,
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => setFilter('all')}
          className={`bg-white overflow-hidden shadow rounded-lg p-6 text-left transition-all ${
            filter === 'all' ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="text-sm font-medium text-gray-500 truncate">Total Timesheets</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.total}</div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => setFilter('draft')}
          className={`bg-white overflow-hidden shadow rounded-lg p-6 text-left transition-all ${
            filter === 'draft' ? 'ring-2 ring-gray-500' : ''
          }`}
        >
          <div className="text-sm font-medium text-gray-500 truncate">Draft</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.draft}</div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => setFilter('submitted')}
          className={`bg-white overflow-hidden shadow rounded-lg p-6 text-left transition-all ${
            filter === 'submitted' ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="text-sm font-medium text-gray-500 truncate">Submitted</div>
          <div className="mt-2 text-3xl font-semibold text-blue-900">{stats.submitted}</div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => setFilter('approved')}
          className={`bg-white overflow-hidden shadow rounded-lg p-6 text-left transition-all ${
            filter === 'approved' ? 'ring-2 ring-green-500' : ''
          }`}
        >
          <div className="text-sm font-medium text-gray-500 truncate">Approved</div>
          <div className="mt-2 text-3xl font-semibold text-green-900">{stats.approved}</div>
        </motion.button>
      </div>

      {/* Timesheets List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white shadow overflow-hidden sm:rounded-lg"
      >
        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Loading timesheets...</p>
          </div>
        ) : filteredTimesheets.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No timesheets</h3>
            <p className="mt-2 text-sm text-gray-500">Get started by creating a new timesheet.</p>
            <div className="mt-6">
              <Link href="/timesheets/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Timesheet
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredTimesheets.map((timesheet, index) => (
              <motion.li
                key={timesheet.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/timesheets/${timesheet.id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {timesheet.assignment?.job_position?.title || 'Timesheet'}
                        </p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Calendar className="shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <span>
                            {new Date(timesheet.period_start_date).toLocaleDateString()} -{' '}
                            {new Date(timesheet.period_end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {timesheet.total_hours} hours
                          </div>
                          {timesheet.total_overtime_hours > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {timesheet.total_overtime_hours}h OT
                            </p>
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            statusColors[timesheet.status as keyof typeof statusColors]
                          }`}
                        >
                          {statusLabels[timesheet.status as keyof typeof statusLabels]}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}

