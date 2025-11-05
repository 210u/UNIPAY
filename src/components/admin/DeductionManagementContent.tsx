'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MinusCircle, Plus, Edit, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const deductionSchema = z.object({
  name: z.string().min(1, 'Deduction name is required'),
  code: z.string().min(1, 'Code is required').max(10, 'Code must be 10 characters or less'),
  deduction_type: z.string(),
  calculation_method: z.enum(['fixed_amount', 'percentage', 'tiered']),
  fixed_amount: z.string().optional(),
  percentage: z.string().optional(),
  min_amount: z.string().optional(),
  max_amount: z.string().optional(),
  annual_max_amount: z.string().optional(),
  employer_contribution_percentage: z.string().optional(),
  employer_contribution_fixed: z.string().optional(),
  is_mandatory: z.boolean(),
  description: z.string().optional(),
});

type DeductionFormData = z.infer<typeof deductionSchema>;

export default function DeductionManagementContent({ profile }: any) {
  const [deductions, setDeductions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError,
  } = useForm<DeductionFormData>({
    resolver: zodResolver(deductionSchema),
    defaultValues: {
      calculation_method: 'percentage',
      is_mandatory: false,
      deduction_type: 'tax_federal',
    },
  });

  const calculationMethod = watch('calculation_method');

  useEffect(() => {
    loadDeductions();
  }, [profile]);

  async function loadDeductions() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deduction_configs')
        .select('*')
        .eq('university_id', profile.university_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeductions(data || []);
    } catch (error) {
      console.error('Error loading deductions:', error);
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: DeductionFormData) => {
    try {
      setIsSubmitting(true);

      const deductionData = {
        university_id: profile.university_id,
        name: data.name,
        code: data.code,
        deduction_type: data.deduction_type,
        calculation_method: data.calculation_method,
        fixed_amount: data.fixed_amount ? parseFloat(data.fixed_amount) : null,
        percentage: data.percentage ? parseFloat(data.percentage) : null,
        min_amount: data.min_amount ? parseFloat(data.min_amount) : null,
        max_amount: data.max_amount ? parseFloat(data.max_amount) : null,
        annual_max_amount: data.annual_max_amount ? parseFloat(data.annual_max_amount) : null,
        employer_contribution_percentage: data.employer_contribution_percentage ? parseFloat(data.employer_contribution_percentage) : null,
        employer_contribution_fixed: data.employer_contribution_fixed ? parseFloat(data.employer_contribution_fixed) : null,
        is_mandatory: data.is_mandatory,
        description: data.description,
        is_active: true,
      };

      if (editingId) {
        const { error } = await supabase
          .from('deduction_configs')
          .update(deductionData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('deduction_configs')
          .insert(deductionData);
        if (error) throw error;
      }

      reset();
      setShowForm(false);
      setEditingId(null);
      loadDeductions();
    } catch (error: any) {
      setError('root', { message: error.message || 'Failed to save deduction' });
    } finally {
      setIsSubmitting(false);
    }
  };

  function editDeduction(deduction: any) {
    reset({
      name: deduction.name,
      code: deduction.code,
      deduction_type: deduction.deduction_type,
      calculation_method: deduction.calculation_method,
      fixed_amount: deduction.fixed_amount?.toString(),
      percentage: deduction.percentage?.toString(),
      min_amount: deduction.min_amount?.toString(),
      max_amount: deduction.max_amount?.toString(),
      annual_max_amount: deduction.annual_max_amount?.toString(),
      employer_contribution_percentage: deduction.employer_contribution_percentage?.toString(),
      employer_contribution_fixed: deduction.employer_contribution_fixed?.toString(),
      is_mandatory: deduction.is_mandatory,
      description: deduction.description || '',
    });
    setEditingId(deduction.id);
    setShowForm(true);
  }

  async function deleteDeduction(id: string) {
    if (!confirm('Are you sure you want to delete this deduction?')) return;
    try {
      const { error } = await supabase.from('deduction_configs').delete().eq('id', id);
      if (error) throw error;
      loadDeductions();
    } catch (error) {
      alert('Failed to delete deduction');
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Deduction Management</h1>
          <p className="mt-2 text-sm text-gray-600">{profile.university.name}</p>
        </div>
        <Button onClick={() => { reset(); setEditingId(null); setShowForm(!showForm); }}>
          {showForm ? <><X className="mr-2 h-4 w-4" />Cancel</> : <><Plus className="mr-2 h-4 w-4" />Add Deduction</>}
        </Button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{editingId ? 'Edit Deduction' : 'Add New Deduction'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input {...register('name')} label="Deduction Name" placeholder="e.g., Federal Income Tax" error={errors.name?.message} />
                <Input {...register('code')} label="Code" placeholder="e.g., FIT" error={errors.code?.message} className="uppercase" />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deduction Type</label>
                  <select {...register('deduction_type')} className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option value="tax_federal">Federal Tax</option>
                    <option value="tax_state">State Tax</option>
                    <option value="tax_local">Local Tax</option>
                    <option value="tax_social_security">Social Security</option>
                    <option value="tax_medicare">Medicare</option>
                    <option value="health_insurance">Health Insurance</option>
                    <option value="dental_insurance">Dental Insurance</option>
                    <option value="vision_insurance">Vision Insurance</option>
                    <option value="retirement_401k">401(k)</option>
                    <option value="retirement_pension">Pension</option>
                    <option value="union_dues">Union Dues</option>
                    <option value="garnishment">Garnishment</option>
                    <option value="loan_repayment">Loan Repayment</option>
                    <option value="advance_repayment">Advance Repayment</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calculation Method</label>
                  <select {...register('calculation_method')} className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option value="fixed_amount">Fixed Amount</option>
                    <option value="percentage">Percentage</option>
                    <option value="tiered">Tiered</option>
                  </select>
                </div>

                {calculationMethod === 'fixed_amount' && <Input {...register('fixed_amount')} label="Fixed Amount ($)" type="number" step="0.01" placeholder="0.00" error={errors.fixed_amount?.message} />}
                {calculationMethod === 'percentage' && <Input {...register('percentage')} label="Percentage (%)" type="number" step="0.01" placeholder="0.00" error={errors.percentage?.message} />}

                <Input {...register('min_amount')} label="Min Amount (Optional)" type="number" step="0.01" placeholder="0.00" />
                <Input {...register('max_amount')} label="Max Amount (Optional)" type="number" step="0.01" placeholder="0.00" />
                <Input {...register('annual_max_amount')} label="Annual Max (Optional)" type="number" step="0.01" placeholder="0.00" />
                <Input {...register('employer_contribution_percentage')} label="Employer % (Optional)" type="number" step="0.01" placeholder="0.00" />
                
                <div className="flex items-center">
                  <input {...register('is_mandatory')} type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label className="ml-2 block text-sm text-gray-900">Mandatory Deduction</label>
                </div>
              </div>

              <Input {...register('description')} label="Description (Optional)" placeholder="Brief description" error={errors.description?.message} />
              {errors.root && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">{errors.root.message}</motion.p>}

              <div className="flex gap-3">
                <Button type="submit" isLoading={isSubmitting}>{editingId ? 'Update' : 'Create'} Deduction</Button>
                <Button type="button" variant="secondary" onClick={() => { reset(); setEditingId(null); setShowForm(false); }}>Cancel</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Loading deductions...</p>
          </div>
        ) : deductions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <MinusCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No deductions yet</h3>
            <p className="mt-2 text-sm text-gray-500">Get started by creating a new deduction.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deductions.map((deduction, index) => (
              <motion.div key={deduction.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ scale: 1.02 }} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{deduction.name}</h3>
                    <p className="text-sm text-gray-500 uppercase mt-1">{deduction.code}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editDeduction(deduction)} className="text-blue-600 hover:text-blue-700"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => deleteDeduction(deduction.id)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{deduction.deduction_type.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">{deduction.calculation_method === 'fixed_amount' ? `$${deduction.fixed_amount?.toFixed(2)}` : `${deduction.percentage}%`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mandatory:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${deduction.is_mandatory ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{deduction.is_mandatory ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}



