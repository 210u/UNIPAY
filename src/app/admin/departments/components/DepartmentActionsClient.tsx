"use client";

import Link from 'next/link';
import Button from '@/components/ui/Button';
import React from 'react';

interface DepartmentActionsClientProps {
  departmentId: string;
}

const DepartmentActionsClient: React.FC<DepartmentActionsClientProps> = ({ departmentId }) => {
  return (
    <div className="flex space-x-2">
      <Link href={`/admin/departments/${departmentId}/edit`}>
        <Button variant="secondary" size="sm">
          Edit
        </Button>
      </Link>
    </div>
  );
};

export default DepartmentActionsClient;

