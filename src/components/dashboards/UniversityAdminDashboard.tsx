'use client';

import React from 'react';

const UniversityAdminDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">University Administrator Dashboard</h1>
      <p>Welcome to the University Administrator Dashboard. Here you can manage departments, job positions, and university-wide settings.</p>
      {/* TODO: Add university admin specific metrics and tools here */}
    </div>
  );
};

export default UniversityAdminDashboard;
