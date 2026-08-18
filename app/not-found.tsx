import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl sm:text-6xl font-black font-mono mb-4 text-[#F59E0B]">404</h1>
      <h2 className="text-xl sm:text-2xl font-bold mb-2">الصفحة غير موجودة</h2>
      <p className="text-sm text-neutral-400 max-w-md mb-8">
        عذراً، الصفحة التي تبحث عنها غير متوفرة أو تم نقلها.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-2xl bg-[#F59E0B] text-black font-black text-sm hover:bg-[#D97706] transition-colors"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
