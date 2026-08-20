"use client";

import React, { useState } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { CategoryId, CategoryData } from '../types';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../data/products';
import { BRAND_CONFIG } from '../data/brand';

interface HeaderProps {
  categories?: CategoryData[];
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenCalculator?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: CategoryId;
  onSelectCategory: (c: CategoryId) => void;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpenMobile, setIsSearchOpenMobile] = useState(false);

  const rawActive = (categories && categories.length > 0) ? categories : DEFAULT_CATEGORIES;
  // Ensure "all" (الكل / جميع المنتجات) is ALWAYS the first category
  const allCat = rawActive.find((c) => c.id === 'all');
  const otherCats = rawActive.filter((c) => c.id !== 'all');
  const activeCategories = allCat ? [allCat, ...otherCats] : rawActive;

  // Build nav items dynamically from Sanity categories (4 categories in total including 'الكل')
  const desktopNavItems: { id: CategoryId; labelAr: string }[] = [
    { id: 'all', labelAr: 'الكل' },
    ...otherCats.slice(0, 3).map((cat) => ({
      id: cat.id,
      labelAr: cat.name,
    })),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] transition-all w-full">
      {/* Main Navigation Bar - Spacious with balanced comfortable margins */}
      <div className="max-w-[1536px] w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-4 lg:gap-8">
          
          {/* Brand Logo & Mobile Toggle (Right side in RTL) */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 -mr-1.5 text-[#111111] hover:bg-[#F5F5F5] rounded-full transition-colors cursor-pointer"
              aria-label="القائمة الرئيسية"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            {/* Brand Logo */}
            <div
              onClick={() => onSelectCategory('all')}
              className="flex items-center gap-3 cursor-pointer group select-none py-1 whitespace-nowrap"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={BRAND_CONFIG.headerIcon}
                alt="LED LINE Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain shadow-xs shrink-0 group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-black tracking-tight text-[#111111] font-display whitespace-nowrap leading-tight">
                  LED LINE
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#757575] font-bold tracking-wider uppercase hidden sm:block">
                  أنظمة الإضاءة والديكور المعماري
                </span>
              </div>
            </div>
          </div>

          {/* Center: Dynamic Desktop Navigation Links (Strictly 5 items: 'الكل' + 4 categories) */}
          <nav className="hidden lg:flex items-center justify-center gap-1.5 xl:gap-3 py-1 flex-1 min-w-0">
            {desktopNavItems.map((item) => {
              const isActive = selectedCategory === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectCategory(item.id)}
                  className={`relative px-4 xl:px-5 py-2 rounded-full text-xs xl:text-sm font-bold transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#111111] text-white shadow-sm'
                      : 'text-[#111111] hover:bg-[#F5F5F5] hover:text-black'
                  }`}
                >
                  <span>{item.labelAr}</span>
                </button>
              );
            })}
          </nav>

          {/* Left Actions in RTL (Search, Wishlist, Cart) - Spacious and well-balanced */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 justify-end">
            
            {/* Desktop Search Bar */}
            <div className="hidden xl:flex items-center relative w-48 lg:w-56 xl:w-64">
              <div className="w-full flex items-center bg-[#F5F5F5] hover:bg-[#EAEAEA] focus-within:bg-white rounded-full px-3.5 py-2 border border-transparent focus-within:border-[#111111] transition-all shadow-2xs">
                <Search className="w-3.5 h-3.5 text-[#757575] shrink-0" />
                <input
                  type="text"
                  placeholder="ابحث عن منتج..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs w-full px-2 text-[#111111] placeholder:text-[#757575]"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="text-[#757575] hover:text-[#111111] p-0.5 cursor-pointer"
                    aria-label="مسح البحث"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile / Tablet Search Icon */}
            <button
              onClick={() => setIsSearchOpenMobile(!isSearchOpenMobile)}
              className="xl:hidden p-2 sm:p-2.5 text-[#111111] hover:bg-[#F5F5F5] rounded-full transition-colors cursor-pointer shrink-0"
              aria-label="البحث"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 sm:p-2.5 text-[#111111] hover:bg-[#F5F5F5] rounded-full transition-colors cursor-pointer shrink-0"
              aria-label="المفضلة"
              title="المفضلة"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 sm:w-4.5 sm:h-4.5 bg-[#D33918] text-white text-[10px] sm:text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-1.5 sm:gap-2 bg-[#111111] hover:bg-[#2A2A2A] text-white px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
              aria-label="حقيبة التسوق"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden md:inline">السلة</span>
              <span className="w-4.5 h-4.5 sm:w-5 sm:h-5 bg-white text-[#111111] text-[10px] sm:text-[11px] font-bold rounded-full flex items-center justify-center shadow-2xs">
                {cartCount}
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Search Dropdown Field */}
        {isSearchOpenMobile && (
          <div className="sm:hidden pb-3 pt-1">
            <div className="flex items-center bg-[#F5F5F5] rounded-full px-4 py-2 border border-[#111111]">
              <Search className="w-4 h-4 text-[#757575] flex-shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="ابحث عن شريط ليد، بروفايل، بديل خشب..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full px-2 text-[#111111]"
              />
              {searchQuery && (
                <button onClick={() => onSearchChange('')} className="text-[#757575] cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation Drawer (Dynamic Categories from Sanity) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[72px] sm:top-[80px] bottom-0 bg-white/98 backdrop-blur-lg z-50 border-t border-[#E5E5E5] overflow-y-auto p-5 space-y-6 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Category List */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#757575] px-2 mb-2">
              أقسام المنتجات المعمارية
            </p>
            {activeCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-right flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-xs transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#111111] text-white'
                    : 'text-[#111111] bg-[#F5F5F5] hover:bg-[#EAEAEA]'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[11px] opacity-70">
                  {cat.count} منتج
                </span>
              </button>
            ))}
          </div>

          {/* Mobile Footer Help */}
          <div className="p-4 bg-[#F5F5F5] rounded-2xl border border-[#E5E5E5] text-center space-y-1">
            <span className="text-[11px] text-[#757575] block">
              خدمة العملاء والاستشارات الهندسية
            </span>
            <a href="tel:920008899" className="text-sm font-bold text-[#111111] block">
              920008899
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
