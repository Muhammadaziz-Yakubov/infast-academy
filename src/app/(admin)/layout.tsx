import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-16 md:pt-0">
        {children}
      </div>
    </div>
  );
}
