'use client';

import React from 'react';
import Badge from '@/components/ui/Badge';

interface RecentPayrollRun {
  id: number;
  cycle: string;
  date: string;
  employeesPaid: number;
  totalAmount: string;
  status: string;
}

export const recentPayrollRunColumns = [
  {
    key: "cycle",
    header: "Payroll Cycle",
    render: (item: RecentPayrollRun) => <span className="font-medium text-textPrimary">{item.cycle}</span>,
  },
  {
    key: "date",
    header: "Date",
    render: (item: RecentPayrollRun) => <span className="text-textSecondary text-sm">{item.date}</span>,
  },
  {
    key: "employeesPaid",
    header: "Employees Paid",
    render: (item: RecentPayrollRun) => <span className="text-textPrimary">{item.employeesPaid}</span>,
  },
  {
    key: "totalAmount",
    header: "Total Amount",
    render: (item: RecentPayrollRun) => <span className="font-medium text-textPrimary">{item.totalAmount}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (item: RecentPayrollRun) => (
      <Badge variant={item.status === "Paid" ? "low" : "medium"}>
        {item.status}
      </Badge>
    ),
  },
];
