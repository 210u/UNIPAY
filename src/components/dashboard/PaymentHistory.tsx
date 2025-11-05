import Link from 'next/link';

interface PaymentHistoryProps {
  payments: any[];
  loading: boolean;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  refunded: 'bg-orange-100 text-orange-800',
};

export default function PaymentHistory({ payments, loading }: PaymentHistoryProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
        <Link
          href="/payments"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="px-6 py-12 text-center text-gray-500">Loading...</div>
      ) : payments.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-500">
          No payment history available.
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {payments.map((payment) => (
            <div key={payment.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-900">
                      {payment.assignment?.job_position?.title || 'Payment'}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        statusColors[payment.status as keyof typeof statusColors]
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {payment.payroll_run?.payroll_period?.period_name || 'N/A'}
                  </p>
                  {payment.paid_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      Paid: {new Date(payment.paid_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${payment.net_pay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500">
                    Gross: ${payment.gross_pay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



