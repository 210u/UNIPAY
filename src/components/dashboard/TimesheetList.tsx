import Link from 'next/link';

interface TimesheetListProps {
  timesheets: any[];
  loading: boolean;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  processed: 'bg-purple-100 text-purple-800',
  paid: 'bg-green-100 text-green-800',
};

export default function TimesheetList({ timesheets, loading }: TimesheetListProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Recent Timesheets</h2>
        <Link
          href="/timesheets"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="px-6 py-12 text-center text-gray-500">Loading...</div>
      ) : timesheets.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-500 mb-4">No timesheets yet</p>
          <Link
            href="/timesheets/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Timesheet
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {timesheets.map((timesheet) => (
            <Link
              key={timesheet.id}
              href={`/timesheets/${timesheet.id}`}
              className="block px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-900">
                      {timesheet.assignment?.job_position?.title || 'Timesheet'}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        statusColors[timesheet.status as keyof typeof statusColors]
                      }`}
                    >
                      {timesheet.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(timesheet.period_start_date).toLocaleDateString()} -{' '}
                    {new Date(timesheet.period_end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {timesheet.total_hours}h
                  </p>
                  <p className="text-xs text-gray-500">Total hours</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}



