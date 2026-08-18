'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Plus,
  RefreshCw,
  Layers,
  Package,
  ShoppingBag,
  Tag,
  Warehouse,
  Settings,
  LayoutDashboard,
} from 'lucide-react';

const RAW_MOBILE_NAV = [
  { path: '', label: 'نظرة عامة', icon: LayoutDashboard },
  { path: '/products', label: 'المنتجات', icon: Package },
  { path: '/orders', label: 'الطلبات', icon: ShoppingBag },
  { path: '/categories', label: 'الأقسام', icon: Layers },
  { path: '/inventory', label: 'المخزون', icon: Warehouse },
  { path: '/coupons', label: 'الكوبونات', icon: Tag },
];

export function AdminHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isAdminPrefix = pathname?.startsWith('/admin');
  const base = isAdminPrefix ? '/admin' : '';
  const currentSubPath = pathname?.replace('/admin', '') || '';

  const getPageTitle = () => {
    switch (currentSubPath) {
      case '':
      case '/':
        return 'لوحة المتابعة التنفيذية';
      case '/products':
        return 'إدارة المنتجات والكتالوج';
      case '/orders':
        return 'إدارة الطلبات والمبيعات';
      case '/categories':
        return 'إدارة الأقسام والتصنيفات';
      case '/inventory':
        return 'إدارة المخزون والتوافر';
      case '/coupons':
        return 'أكواد الخصم والعروض';
      default:
        return 'لوحة الإدارة';
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 md:hidden rounded-xl bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#111111] transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight font-display">
            {getPageTitle()}
          </h1>
          <p className="hidden sm:block text-xs text-[#757575] font-medium">
            لوحة الإدارة والعمليات • متجر LED LINE™
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Fast Action / Reload */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#111111] text-xs font-bold border border-[#E5E5E5] transition-colors"
          title="تحديث البيانات"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#111111]' : 'text-[#757575]'}`} />
          <span className="hidden sm:inline">تحديث</span>
        </button>

        {/* Quick Add Product Button */}
        <Link
          href={`${base}/products`}
          prefetch={true}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111111] hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منتج</span>
        </Link>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-20 bg-white border-b border-[#E5E5E5] p-4 shadow-xl md:hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <nav className="grid grid-cols-2 gap-2">
            {RAW_MOBILE_NAV.map((item) => {
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
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive ? 'bg-[#111111] text-white shadow-xs' : 'bg-[#F5F5F5] text-[#4B5563] hover:text-[#111111]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F59E0B]' : 'text-[#757575]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
