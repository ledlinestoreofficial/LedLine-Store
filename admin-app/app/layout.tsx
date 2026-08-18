import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';

export const metadata: Metadata = {
  title: 'LED LINE™ Admin | لوحة التحكم التنفيذية المستقلة',
  description: 'لوحة إدارة متجر ليد لاين للإنارة وأخشاب الجدران - Next.js Standalone BFF Admin App',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F9FAFB] text-[#111111] min-h-screen flex antialiased selection:bg-[#111111] selection:text-white">
        {/* Persistent Standalone Sidebar */}
        <AdminSidebar />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 md:mr-64 transition-all duration-300">
          <AdminHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
