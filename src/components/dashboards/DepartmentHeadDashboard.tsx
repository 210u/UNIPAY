'use client';

import React from 'react';

const DepartmentHeadDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Department Head Dashboard</h1>
      <p>Welcome to the Department Head Dashboard. Here you can approve timesheets and manage departmental employees.</p>
      {/* TODO: Add department head specific metrics and tools here */}
    </div>
  );
};

export default DepartmentHeadDashboard;
