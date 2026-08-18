import React from 'react';
import type { Metadata } from 'next';
import { AdminSidebar } from '../../admin-app/components/AdminSidebar';
import { AdminHeader } from '../../admin-app/components/AdminHeader';

export const metadata: Metadata = {
  title: 'لوحة التحكم التنفيذية | LED LINE™ Admin',
  description: 'لوحة إدارة متجر ليد لاين للإنارة المعمارية وألواح الديكور',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111111] font-sans antialiased selection:bg-[#111111] selection:text-white">
      <AdminSidebar />
      <div className="flex flex-col md:pr-64 min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
