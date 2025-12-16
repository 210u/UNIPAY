'use client';

import React from 'react';

const EmployeeDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Employee Dashboard</h1>
      <p>Welcome to your Employee Dashboard. Here you can view your timesheets, payments, and profile.</p>
      {/* TODO: Add employee specific metrics and tools here */}
    </div>
  );
};

export default EmployeeDashboard;
