'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, GraduationCap, UserX, Plus, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Link from 'next/link';

interface EmployeeManagementContentProps {
  profile: any;
}

export default function EmployeeManagementContent({ profile }: EmployeeManagementContentProps) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);

      // Get university_id from profile (could be direct or nested)
      const universityId = profile.university_id || profile.university?.id;
      
      if (!universityId) {
        console.error('Error loading employees: university_id is missing from profile', profile);
        setEmployees([]);
        return;
      }

      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          user:user_profiles(*),
          department:departments(*),
          assignments:employee_assignments(
            *,
            job_position:job_positions(*)
          )
        `)
        .eq('university_id', universityId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading employees:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      setEmployees(data || []);
    } catch (error: any) {
      console.error('Error loading employees:', {
        message: error?.message || 'Unknown error',
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        error: error
      });
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      loadEmployees();
    }
  }, [profile, loadEmployees]);

  useEffect(() => {
    filterEmployeeList();
  }, [searchQuery, filterStatus, filterType, employees]);

  function filterEmployeeList() {
    let filtered = employees;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(emp => 
        emp.user?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.user?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employee_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(emp => emp.employment_status === filterStatus);
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(emp => emp.employee_type === filterType);
    }

    setFilteredEmployees(filtered);
  }

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.employment_status === 'active').length,
    inactive: employees.filter(e => e.employment_status === 'inactive').length,
    student: employees.filter(e => e.employee_type.includes('student') || e.employee_type.includes('assistant')).length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Employee Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            {profile.university?.name || 'Unipay Admin Panel'}
          </p>
        </div>
        <Link href="/admin/employees/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Employees</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</dd>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">{stats.active}</dd>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <GraduationCap className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Student Workers</dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-600">{stats.student}</dd>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <UserX className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Inactive</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-600">{stats.inactive}</dd>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white shadow rounded-lg mb-6 p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="search"
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="terminated">Terminated</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Employee Type
            </label>
            <select
              id="type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">All Types</option>
              <option value="student_worker">Student Worker</option>
              <option value="teaching_assistant">Teaching Assistant</option>
              <option value="research_assistant">Research Assistant</option>
              <option value="graduate_assistant">Graduate Assistant</option>
              <option value="part_time_staff">Part-time Staff</option>
              <option value="full_time_staff">Full-time Staff</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Employee List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white shadow overflow-hidden sm:rounded-lg"
      >
        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Loading employees...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No employees found</h3>
            <p className="mt-2 text-sm text-gray-500">No employees match your search criteria.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredEmployees.map((employee, index) => (
              <motion.li
                key={employee.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/admin/employees/${employee.id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className="shrink-0">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {employee.user?.first_name?.[0]}{employee.user?.last_name?.[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="text-sm font-medium text-blue-600">
                            {employee.user?.first_name} {employee.user?.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {employee.employee_number} • {employee.user?.email}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                            <span>{employee.department?.name || 'No Department'}</span>
                            <span>•</span>
                            <span className="capitalize">{employee.employee_type.replace(/_/g, ' ')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          employee.employment_status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : employee.employment_status === 'inactive'
                            ? 'bg-gray-100 text-gray-800'
                            : employee.employment_status === 'suspended'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {employee.employment_status}
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

