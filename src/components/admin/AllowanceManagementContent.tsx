'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DollarSign, Plus, Edit, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const allowanceSchema = z.object({
  name: z.string().min(1, 'Allowance name is required'),
  code: z.string().min(1, 'Code is required').max(10, 'Code must be 10 characters or less'),
  allowance_type: z.string(),
  calculation_method: z.enum(['fixed_amount', 'percentage', 'tiered']),
  default_amount: z.string().optional(),
  default_percentage: z.string().optional(),
  frequency: z.enum(['one_time', 'per_pay_period', 'monthly', 'quarterly', 'annually']),
  is_taxable: z.boolean(),
  description: z.string().optional(),
});

type AllowanceFormData = z.infer<typeof allowanceSchema>;

interface AllowanceManagementContentProps {
  profile: any;
}

export default function AllowanceManagementContent({ profile }: AllowanceManagementContentProps) {
  const [allowances, setAllowances] = useState<any[]>([]);
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
  } = useForm<AllowanceFormData>({
    resolver: zodResolver(allowanceSchema),
    defaultValues: {
      calculation_method: 'fixed_amount',
      frequency: 'per_pay_period',
      is_taxable: true,
      allowance_type: 'housing',
    },
  });

  const calculationMethod = watch('calculation_method');

  useEffect(() => {
    loadAllowances();
  }, [profile]);

  async function loadAllowances() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('allowance_configs')
        .select('*')
        .eq('university_id', profile.university_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllowances(data || []);
    } catch (error) {
      console.error('Error loading allowances:', error);
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: AllowanceFormData) => {
    try {
      setIsSubmitting(true);

      const allowanceData = {
        university_id: profile.university_id,
        name: data.name,
        code: data.code,
        allowance_type: data.allowance_type,
        calculation_method: data.calculation_method,
        default_amount: data.default_amount ? parseFloat(data.default_amount) : null,
        default_percentage: data.default_percentage ? parseFloat(data.default_percentage) : null,
        frequency: data.frequency,
        is_taxable: data.is_taxable,
        description: data.description,
        is_active: true,
      };

      if (editingId) {
        const { error } = await supabase
          .from('allowance_configs')
          .update(allowanceData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('allowance_configs')
          .insert(allowanceData);

        if (error) throw error;
      }

      reset();
      setShowForm(false);
      setEditingId(null);
      loadAllowances();
    } catch (error: any) {
      console.error('Error saving allowance:', error);
      setError('root', {
        message: error.message || 'Failed to save allowance',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  function editAllowance(allowance: any) {
    reset({
      name: allowance.name,
      code: allowance.code,
      allowance_type: allowance.allowance_type,
      calculation_method: allowance.calculation_method,
      default_amount: allowance.default_amount?.toString(),
      default_percentage: allowance.default_percentage?.toString(),
      frequency: allowance.frequency,
      is_taxable: allowance.is_taxable,
      description: allowance.description || '',
    });
    setEditingId(allowance.id);
    setShowForm(true);
  }

  async function deleteAllowance(id: string) {
    if (!confirm('Are you sure you want to delete this allowance?')) return;

    try {
      const { error } = await supabase
        .from('allowance_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadAllowances();
    } catch (error) {
      console.error('Error deleting allowance:', error);
      alert('Failed to delete allowance');
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Allowance Management</h1>
          <p className="mt-2 text-sm text-gray-600">{profile.university.name}</p>
        </div>
        <Button
          onClick={() => {
            reset();
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="inline-flex items-center"
        >
          {showForm ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Allowance
            </>
          )}
        </Button>
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingId ? 'Edit Allowance' : 'Add New Allowance'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  {...register('name')}
                  label="Allowance Name"
                  placeholder="e.g., Housing Allowance"
                  error={errors.name?.message}
                />

                <Input
                  {...register('code')}
                  label="Code"
                  placeholder="e.g., HSG"
                  error={errors.code?.message}
                  className="uppercase"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allowance Type
                  </label>
                  <select
                    {...register('allowance_type')}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="housing">Housing</option>
                    <option value="transport">Transport</option>
                    <option value="meal">Meal</option>
                    <option value="medical">Medical</option>
                    <option value="education">Education</option>
                    <option value="research">Research</option>
                    <option value="teaching">Teaching</option>
                    <option value="hazard">Hazard</option>
                    <option value="shift_differential">Shift Differential</option>
                    <option value="overtime_premium">Overtime Premium</option>
                    <option value="performance_bonus">Performance Bonus</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calculation Method
                  </label>
                  <select
                    {...register('calculation_method')}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="fixed_amount">Fixed Amount</option>
                    <option value="percentage">Percentage of Base Pay</option>
                    <option value="tiered">Tiered</option>
                  </select>
                </div>

                {calculationMethod === 'fixed_amount' && (
                  <Input
                    {...register('default_amount')}
                    label="Default Amount ($)"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    error={errors.default_amount?.message}
                  />
                )}

                {calculationMethod === 'percentage' && (
                  <Input
                    {...register('default_percentage')}
                    label="Default Percentage (%)"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    error={errors.default_percentage?.message}
                  />
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    {...register('frequency')}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="one_time">One Time</option>
                    <option value="per_pay_period">Per Pay Period</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    {...register('is_taxable')}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Taxable Allowance
                  </label>
                </div>
              </div>

              <Input
                {...register('description')}
                label="Description (Optional)"
                placeholder="Brief description of this allowance"
                error={errors.description?.message}
              />

              {errors.root && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-500"
                >
                  {errors.root.message}
                </motion.p>
              )}

              <div className="flex gap-3">
                <Button type="submit" isLoading={isSubmitting}>
                  {editingId ? 'Update Allowance' : 'Create Allowance'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    reset();
                    setEditingId(null);
                    setShowForm(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Allowances List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Loading allowances...</p>
          </div>
        ) : allowances.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No allowances yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by creating a new allowance.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allowances.map((allowance, index) => (
              <motion.div
                key={allowance.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{allowance.name}</h3>
                    <p className="text-sm text-gray-500 uppercase mt-1">{allowance.code}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editAllowance(allowance)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteAllowance(allowance.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">
                      {allowance.allowance_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">
                      {allowance.calculation_method === 'fixed_amount'
                        ? `$${allowance.default_amount?.toFixed(2)}`
                        : `${allowance.default_percentage}%`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Frequency:</span>
                    <span className="font-medium capitalize">
                      {allowance.frequency.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxable:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        allowance.is_taxable
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {allowance.is_taxable ? 'Yes' : 'No'}
                    </span>
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
