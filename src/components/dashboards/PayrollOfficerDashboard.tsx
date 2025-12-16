'use client';

import React from 'react';

const PayrollOfficerDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Payroll Officer Dashboard</h1>
      <p>Welcome to the Payroll Officer Dashboard. Here you can manage payroll runs, allowances, and deductions.</p>
      {/* TODO: Add payroll officer specific metrics and tools here */}
    </div>
  );
};

export default PayrollOfficerDashboard;
