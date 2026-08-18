import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LED LINE™ | متجر ليد لاين للإنارة وأخشاب الجدران الديكورية',
  description:
    'متجر إلكتروني احترافي لأنظمة إضاءة الـ LED المعمارية، البروفايلات الذكية، وألواح أخشاب الجدران المودرن بأعلى معايير الجودة في المكلا والخليج.',
  keywords: [
    'ليد لاين',
    'LED LINE',
    'إنارة معمارية',
    'شريط ليد COB',
    'بروفايل ألمنيوم',
    'أخشاب جدران ديكورية',
    'بديل الخشب',
  ],
  authors: [{ name: 'LED LINE LLC' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
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
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Oswald:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#FFFFFF] text-[#111111] antialiased selection:bg-[#111111] selection:text-[#FFFFFF]">
        {children}
      </body>
    </html>
  );
}
