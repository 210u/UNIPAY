'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Printer, ArrowLeft, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { generatePayslipHTML } from '@/lib/pdf/payslip-generator';

interface PayslipViewerProps {
  paymentId: string;
  profile: any;
}

export default function PayslipViewer({ paymentId, profile }: PayslipViewerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payslipData, setPayslipData] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadPayslip();
  }, [paymentId]);

  async function loadPayslip() {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_employee_payslip', {
        payment_id_param: paymentId
      });

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Payslip not found');

      setPayslipData(data[0]);
    } catch (error) {
      console.error('Error loading payslip:', error);
      alert('Failed to load payslip');
    } finally {
      setLoading(false);
    }
  }

  async function downloadPDF() {
    if (!payslipData) return;

    try {
      setDownloading(true);
      const html = generatePayslipHTML(payslipData);
      
      // Create a new window with the HTML
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Trigger print dialog which can save as PDF
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  }

  function printPayslip() {
    if (!payslipData) return;
    
    const html = generatePayslipHTML(payslipData);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 250);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500">Loading payslip...</p>
        </div>
      </div>
    );
  }

  if (!payslipData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900">Payslip not found</h3>
          <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Actions */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <Button variant="secondary" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back
        </Button>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={printPayslip}>
            <Printer className="mr-2 h-4 w-4" />Print
          </Button>
          <Button onClick={downloadPDF} isLoading={downloading}>
            <Download className="mr-2 h-4 w-4" />Download PDF
          </Button>
        </div>
      </motion.div>

      {/* Payslip */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8">
          {/* Header */}
          <div className="text-center border-b pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{payslipData.university_name}</h1>
            <p className="text-lg text-gray-600 mt-2">Pay Slip</p>
            <p className="text-sm text-gray-500 mt-1">
              Pay Period: {new Date(payslipData.period_start_date).toLocaleDateString()} - {new Date(payslipData.period_end_date).toLocaleDateString()}
            </p>
          </div>

          {/* Employee Info */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Employee Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-medium text-gray-900">{payslipData.employee_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Employee ID:</span>
                  <span className="text-sm font-medium text-gray-900">{payslipData.employee_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Department:</span>
                  <span className="text-sm font-medium text-gray-900">{payslipData.department_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Position:</span>
                  <span className="text-sm font-medium text-gray-900">{payslipData.position_title}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Payment Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Date:</span>
                  <span className="text-sm font-medium text-gray-900">{new Date(payslipData.payment_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Method:</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">{payslipData.payment_method?.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Reference:</span>
                  <span className="text-sm font-medium text-gray-900">{payslipData.reference_number}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 bg-gray-50 px-4 py-2 rounded-t">Earnings</h3>
            <div className="border border-t-0 rounded-b">
              <div className="px-4 py-3 flex justify-between border-b">
                <span className="text-sm text-gray-600">Base Pay</span>
                <span className="text-sm font-medium text-gray-900">${(payslipData.base_pay || 0).toFixed(2)}</span>
              </div>
              <div className="px-4 py-3 flex justify-between border-b">
                <span className="text-sm text-gray-600">Overtime Pay</span>
                <span className="text-sm font-medium text-gray-900">${(payslipData.overtime_pay || 0).toFixed(2)}</span>
              </div>
              <div className="px-4 py-3 flex justify-between border-b">
                <span className="text-sm text-gray-600">Allowances</span>
                <span className="text-sm font-medium text-gray-900">${(payslipData.total_allowances || 0).toFixed(2)}</span>
              </div>
              <div className="px-4 py-3 flex justify-between bg-green-50">
                <span className="text-sm font-semibold text-gray-900">Gross Pay</span>
                <span className="text-sm font-bold text-green-600">${(payslipData.gross_pay || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 bg-gray-50 px-4 py-2 rounded-t">Deductions</h3>
            <div className="border border-t-0 rounded-b">
              <div className="px-4 py-3 flex justify-between border-b">
                <span className="text-sm text-gray-600">Total Deductions</span>
                <span className="text-sm font-medium text-red-600">${(payslipData.total_deductions || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Net Pay</span>
              <span className="text-2xl font-extrabold text-blue-600">${(payslipData.net_pay || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* YTD Summary */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Year-to-Date Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">YTD Gross</p>
                <p className="text-lg font-semibold text-gray-900">${(payslipData.ytd_gross || 0).toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">YTD Deductions</p>
                <p className="text-lg font-semibold text-gray-900">${(payslipData.ytd_deductions || 0).toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">YTD Net</p>
                <p className="text-lg font-semibold text-gray-900">${(payslipData.ytd_net || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center text-xs text-gray-500">
            <p>This is a computer-generated document. No signature is required.</p>
            <p className="mt-1">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}



