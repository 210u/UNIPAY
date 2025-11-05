'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calculator, Play, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const payrollSchema = z.object({
  payroll_period_id: z.string().min(1, 'Please select a pay period'),
  run_name: z.string().min(1, 'Run name is required'),
});

type PayrollFormData = z.infer<typeof payrollSchema>;

export default function PayrollProcessingContent({ profile }: any) {
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
  });

  useEffect(() => {
    loadData();
  }, [profile]);

  async function loadData() {
    try {
      setLoading(true);
      
      const [runsRes, periodsRes] = await Promise.all([
        supabase.from('payroll_runs').select('*, payroll_period:payroll_periods(*)').eq('university_id', profile.university_id).order('created_at', { ascending: false }),
        supabase.from('payroll_periods').select('*').eq('university_id', profile.university_id).eq('is_closed', false).order('period_start_date', { ascending: false })
      ]);

      if (runsRes.error) throw runsRes.error;
      if (periodsRes.error) throw periodsRes.error;

      setPayrollRuns(runsRes.data || []);
      setPeriods(periodsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: PayrollFormData) => {
    try {
      setIsSubmitting(true);

      const runNumber = `PR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const { data: newRun, error } = await supabase
        .from('payroll_runs')
        .insert({
          university_id: profile.university_id,
          payroll_period_id: data.payroll_period_id,
          run_number: runNumber,
          run_name: data.run_name,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      reset();
      setShowForm(false);
      loadData();
    } catch (error: any) {
      setError('root', { message: error.message || 'Failed to create payroll run' });
    } finally {
      setIsSubmitting(false);
    }
  };

  async function processPayroll(runId: string) {
    if (!confirm('Process this payroll run? This will calculate payments for all approved timesheets.')) return;

    try {
      setProcessing(runId);
      
      const { error } = await supabase.rpc('process_payroll_run', { payroll_run_id_param: runId });
      
      if (error) throw error;

      alert('Payroll processed successfully!');
      loadData();
    } catch (error: any) {
      alert(`Failed to process payroll: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  }

  async function approvePayroll(runId: string) {
    if (!confirm('Approve this payroll run? Employees will be able to view their pay stubs.')) return;

    try {
      const { error } = await supabase
        .from('payroll_runs')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: profile.id,
        })
        .eq('id', runId);

      if (error) throw error;
      loadData();
    } catch (error: any) {
      alert(`Failed to approve: ${error.message}`);
    }
  }

  const statusColors: any = {
    draft: 'bg-gray-100 text-gray-800',
    calculating: 'bg-blue-100 text-blue-800',
    calculated: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    processing: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Payroll Processing</h1>
            <p className="mt-2 text-sm text-gray-600">{profile.university.name}</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Create Payroll Run'}
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Payroll Run</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input {...register('run_name')} label="Run Name" placeholder="e.g., October 2024 - Period 1" error={errors.run_name?.message} />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pay Period</label>
                <select {...register('payroll_period_id')} className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="">Select a pay period</option>
                  {periods.map((period) => (
                    <option key={period.id} value={period.id}>
                      {period.period_name} ({new Date(period.period_start_date).toLocaleDateString()} - {new Date(period.period_end_date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                {errors.payroll_period_id && <p className="mt-1 text-sm text-red-500">{errors.payroll_period_id.message}</p>}
              </div>

              {errors.root && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">{errors.root.message}</motion.p>}

              <div className="flex gap-3">
                <Button type="submit" isLoading={isSubmitting}>Create Run</Button>
                <Button type="button" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Loading payroll runs...</p>
          </div>
        ) : payrollRuns.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calculator className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No payroll runs yet</h3>
            <p className="mt-2 text-sm text-gray-500">Create your first payroll run to get started.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {payrollRuns.map((run, index) => (
              <motion.div key={run.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{run.run_name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[run.status]}`}>{run.status}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{run.run_number}</p>
                      <p className="text-sm text-gray-600 mt-2">{run.payroll_period?.period_name}</p>
                    </div>
                    <div className="flex gap-2">
                      {run.status === 'draft' && (
                        <Button size="sm" onClick={() => processPayroll(run.id)} isLoading={processing === run.id}>
                          <Play className="mr-2 h-4 w-4" />Process
                        </Button>
                      )}
                      {run.status === 'calculated' && (
                        <Button size="sm" onClick={() => approvePayroll(run.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />Approve
                        </Button>
                      )}
                    </div>
                  </div>

                  {run.status !== 'draft' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                      <div>
                        <p className="text-xs text-gray-500">Employees</p>
                        <p className="text-lg font-semibold text-gray-900">{run.total_employees || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Gross Pay</p>
                        <p className="text-lg font-semibold text-green-600">${(run.total_gross_pay || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Deductions</p>
                        <p className="text-lg font-semibold text-red-600">${(run.total_deductions || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Net Pay</p>
                        <p className="text-lg font-semibold text-blue-600">${(run.total_net_pay || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}



