import React from 'react';

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b">
    {children}
  </div>
);

export const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-medium">{children}</h3>
);

export const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6">
    {children}
  </div>
);
