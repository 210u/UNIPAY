'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Settings } from 'lucide-react';

interface ScheduledReport {
  id: number;
  name: string;
  frequency: string;
  nextRun: string;
  status: string;
}

export const scheduledReportsColumns = [
  {
    key: "name",
    header: "Report Name",
    render: (item: ScheduledReport) => <span className="font-medium text-textPrimary">{item.name}</span>,
  },
  {
    key: "frequency",
    header: "Frequency",
    render: (item: ScheduledReport) => <span className="text-textSecondary text-sm">{item.frequency}</span>,
  },
  {
    key: "nextRun",
    header: "Next Run",
    render: (item: ScheduledReport) => <span className="text-textSecondary text-sm">{item.nextRun}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (item: ScheduledReport) => (
      <Badge variant={item.status === "Active" ? "low" : "medium"}>
        {item.status}
      </Badge>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    render: () => (
      <Button variant="secondary" size="sm" className="flex items-center space-x-2 text-xs">
        <Settings className="h-3 w-3" />
        <span>Manage</span>
      </Button>
    ),
  },
];
