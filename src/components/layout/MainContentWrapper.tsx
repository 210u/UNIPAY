import React from 'react';

const MainContentWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex-1 p-8 bg-background overflow-y-auto">
      {children}
    </div>
  );
};

export default MainContentWrapper;

