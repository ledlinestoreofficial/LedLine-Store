'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Tag,
  Warehouse,
  Settings,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

const RAW_NAV_ITEMS = [
  { path: '', label: 'نظرة عامة', icon: LayoutDashboard },
  { path: '/products', label: 'المنتجات والكتالوج', icon: Package },
  { path: '/orders', label: 'الطلبات والمبيعات', icon: ShoppingBag },
  { path: '/categories', label: 'الأقسام والتصنيفات', icon: Layers },
  { path: '/inventory', label: 'إدارة المخزون', icon: Warehouse },
  { path: '/coupons', label: 'كوبونات الخصم', icon: Tag },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const isAdminPrefix = pathname?.startsWith('/admin');
  const base = isAdminPrefix ? '/admin' : '';

  return (
    <aside className="fixed inset-y-0 right-0 z-40 hidden md:flex w-64 flex-col bg-white border-l border-[#E5E5E5]">
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#111111] flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-[#111111] font-display">
                LED LINE
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#111111] text-white">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-[#757575] font-medium">لوحة الإدارة والعمليات</p>
          </div>
        </div>
      </div>

      {/* Sanity Database Status Badge */}
      <div className="px-4 py-3 mx-4 my-3 rounded-2xl bg-[#F9FAFB] border border-[#E5E5E5] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="text-[11px] leading-tight">
            <p className="text-[#111111] font-bold">قاعدة بيانات متزامنة</p>
            <p className="text-[#757575] text-[10px] mt-0.5 font-mono">Sanity Cloud Sync</p>
          </div>
        </div>
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto py-1">
        {RAW_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const href = `${base}${item.path}` || '/';
          const isActive = item.path === ''
            ? (pathname === '/admin' || pathname === '/')
            : (pathname?.startsWith(`${base}${item.path}`));

          return (
            <Link
              key={item.path}
              href={href}
              prefetch={true}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 ${
                isActive
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'text-[#4B5563] hover:text-[#111111] hover:bg-[#F5F5F5]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#F59E0B]' : 'text-[#757575]'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* External Store Link & Footer */}
      <div className="p-4 border-t border-[#E5E5E5] space-y-3">
        <a
          href="/"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#F5F5F5] hover:bg-[#EAEAEA] border border-[#E5E5E5] text-xs font-bold text-[#111111] transition-colors shadow-xs"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-[#111111]" />
            العودة للمتجر
          </span>
          <span className="text-[10px] text-[#757575] font-mono">Storefront</span>
        </a>
        <div className="text-center text-[10px] text-[#757575]">
          LED LINE™ • نظام الإدارة v1.0
        </div>
      </div>
    </aside>
  );
}
