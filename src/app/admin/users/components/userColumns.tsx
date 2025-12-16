'use client';

import React from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Edit, Trash2 } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

export const userColumns = [
  {
    key: "name",
    header: "Name",
    render: (item: User) => <span className="font-medium text-textPrimary">{item.name}</span>,
  },
  {
    key: "email",
    header: "Email",
    render: (item: User) => <span className="text-textSecondary text-sm">{item.email}</span>,
  },
  {
    key: "role",
    header: "Role",
    render: (item: User) => <Badge variant="review">{item.role}</Badge>,
  },
  {
    key: "status",
    header: "Status",
    render: (item: User) => (
      <Badge variant={item.status === "Active" ? "low" : "medium"}>
        {item.status}
      </Badge>
    ),
  },
  {
    key: "lastLogin",
    header: "Last Login",
    render: (item: User) => <span className="text-textSubtle text-sm">{item.lastLogin}</span>,
  },
  {
    key: "actions",
    header: "Actions",
    render: () => (
      <div className="flex space-x-2">
        <Button variant="secondary" size="sm" className="flex items-center space-x-1 text-xs">
          <Edit className="h-3 w-3" />
          <span>Edit</span>
        </Button>
        <Button variant="secondary" size="sm" className="flex items-center space-x-1 text-xs text-red-500 hover:bg-red-100 dark:hover:bg-red-900">
          <Trash2 className="h-3 w-3" />
          <span>Delete</span>
        </Button>
      </div>
    ),
  },
];
