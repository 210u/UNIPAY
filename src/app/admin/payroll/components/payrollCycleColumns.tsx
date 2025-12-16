'use client';

import React from 'react';
import Badge from '@/components/ui/Badge';

interface PayrollCycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: string;
}

export const payrollCycleColumns = [
  {
    key: "name",
    header: "Payroll Cycle",
    render: (item: PayrollCycle) => <span className="font-medium text-textPrimary">{item.name}</span>,
  },
  {
    key: "startDate",
    header: "Start Date",
    render: (item: PayrollCycle) => <span className="text-textSecondary text-sm">{item.startDate}</span>,
  },
  {
    key: "endDate",
    header: "End Date",
    render: (item: PayrollCycle) => <span className="text-textSecondary text-sm">{item.endDate}</span>,
  },
  {
    key: "totalAmount",
    header: "Total Amount",
    render: (item: PayrollCycle) => <span className="font-medium text-textPrimary">{item.totalAmount}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (item: PayrollCycle) => (
      <Badge variant={item.status === "Completed" ? "low" : "medium"}>
        {item.status}
      </Badge>
    ),
  },
];
