'use client';

import React from 'react';

const SystemAdminDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">System Administrator Dashboard</h1>
      <p>Welcome to the System Administrator Dashboard. Here you will find an overview of system-wide operations.</p>
      {/* TODO: Add system admin specific metrics and tools here */}
    </div>
  );
};

export default SystemAdminDashboard;
