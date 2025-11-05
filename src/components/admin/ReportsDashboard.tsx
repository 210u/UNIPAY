'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, DollarSign, Download, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';

export default function ReportsDashboard({ profile }: any) {
  const [selectedReport, setSelectedReport] = useState('payroll_summary');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const reports = [
    { id: 'payroll_summary', name: 'Payroll Summary', icon: DollarSign, view: 'vw_payroll_comprehensive_report' },
    { id: 'department_summary', name: 'Department Analysis', icon: Users, view: 'vw_department_payroll_summary' },
    { id: 'employee_earnings', name: 'Employee Earnings', icon: TrendingUp, view: 'vw_employee_earnings_summary' },
    { id: 'deductions', name: 'Deductions Report', icon: BarChart3, view: 'vw_deduction_summary' },
    { id: 'allowances', name: 'Allowances Report', icon: BarChart3, view: 'vw_allowance_summary' },
    { id: 'trends', name: 'Monthly Trends', icon: TrendingUp, view: 'vw_monthly_payroll_trends' },
  ];

  useEffect(() => {
    loadReport();
  }, [selectedReport, profile]);

  async function loadReport() {
    try {
      setLoading(true);
      const report = reports.find(r => r.id === selectedReport);
      if (!report) return;

      const { data, error } = await supabase
        .from(report.view as any)
        .select('*')
        .limit(100);

      if (error) throw error;
      setReportData(data || []);
      calculateSummary(data || []);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  }

  function calculateSummary(data: any[]) {
    if (data.length === 0) {
      setSummary(null);
      return;
    }

    const keys = Object.keys(data[0]);
    const numericKeys = keys.filter(k => typeof data[0][k] === 'number');

    const sums: any = {};
    numericKeys.forEach(key => {
      sums[key] = data.reduce((acc, row) => acc + (row[key] || 0), 0);
    });

    setSummary({
      totalRecords: data.length,
      ...sums,
    });
  }

  function exportToCSV() {
    if (reportData.length === 0) return;

    const headers = Object.keys(reportData[0]);
    const csv = [
      headers.join(','),
      ...reportData.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Reports & Analytics</h1>
            <p className="mt-2 text-sm text-gray-600">{profile.university.name}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={loadReport}>
              <RefreshCw className="mr-2 h-4 w-4" />Refresh
            </Button>
            <Button onClick={exportToCSV} disabled={reportData.length === 0}>
              <Download className="mr-2 h-4 w-4" />Export CSV
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Report Selection */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <motion.button
              key={report.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 rounded-lg border-2 transition-colors ${
                selectedReport === report.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <Icon className={`h-6 w-6 mx-auto mb-2 ${selectedReport === report.id ? 'text-blue-600' : 'text-gray-400'}`} />
              <p className={`text-xs font-medium text-center ${selectedReport === report.id ? 'text-blue-900' : 'text-gray-700'}`}>
                {report.name}
              </p>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Summary Cards */}
      {summary && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Records</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{summary.totalRecords}</p>
          </div>
          {summary.total_gross_pay && (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Total Gross Pay</p>
              <p className="text-2xl font-bold text-green-600 mt-2">${summary.total_gross_pay.toFixed(2)}</p>
            </div>
          )}
          {summary.total_deductions && (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Total Deductions</p>
              <p className="text-2xl font-bold text-red-600 mt-2">${summary.total_deductions.toFixed(2)}</p>
            </div>
          )}
          {summary.total_net_pay && (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Total Net Pay</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">${summary.total_net_pay.toFixed(2)}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Report Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Loading report...</p>
          </div>
        ) : reportData.length === 0 ? (
          <div className="p-12 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No data available</h3>
            <p className="mt-2 text-sm text-gray-500">There's no data for this report yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(reportData[0]).map((header) => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {Object.values(row).map((value: any, i) => (
                      <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {typeof value === 'number' && value > 100 ? `$${value.toFixed(2)}` : String(value || '-')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}



