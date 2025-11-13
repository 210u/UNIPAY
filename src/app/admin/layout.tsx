import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import MainContentWrapper from '@/components/layout/MainContentWrapper';
import DashboardHeader from '@/components/layout/DashboardHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-textPrimary">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* The DashboardHeader title will be dynamic based on the child page */}
        <DashboardHeader title="Employees Overview" />
        <MainContentWrapper>
          {children}
        </MainContentWrapper>
      </div>
    </div>
  );
}
