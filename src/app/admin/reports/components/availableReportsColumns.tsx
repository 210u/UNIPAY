'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Download, FileText } from 'lucide-react';

interface Report {
  id: number;
  name: string;
  type: string;
  dateGenerated: string;
  status: string;
  actions: string;
}

export const availableReportsColumns = [
  {
    key: "name",
    header: "Report Name",
    render: (item: Report) => <span className="font-medium text-textPrimary">{item.name}</span>,
  },
  {
    key: "type",
    header: "Type",
    render: (item: Report) => <Badge variant="review">{item.type}</Badge>,
  },
  {
    key: "dateGenerated",
    header: "Date Generated",
    render: (item: Report) => <span className="text-textSecondary text-sm">{item.dateGenerated}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (item: Report) => (
      <Badge variant={item.status === "Completed" ? "low" : "medium"}>
        {item.status}
      </Badge>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    render: (item: Report) => (
      <Button variant="secondary" size="sm" className="flex items-center space-x-2 text-xs">
        {item.actions === "Download" ? <Download className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
        <span>{item.actions}</span>
      </Button>
    ),
  },
];
