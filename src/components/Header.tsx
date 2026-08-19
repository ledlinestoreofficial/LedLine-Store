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

  const activeCategories = (categories && categories.length > 0) ? categories : DEFAULT_CATEGORIES;

  // Build nav items dynamically from Sanity categories
  // Ensure "all" is available as the first option
  const hasAll = activeCategories.some((c) => c.id === 'all');
  const dynamicNavItems: { id: CategoryId; labelAr: string }[] = [];

  if (!hasAll) {
    dynamicNavItems.push({ id: 'all', labelAr: 'الكل' });
  }

  activeCategories.forEach((cat) => {
    dynamicNavItems.push({
      id: cat.id,
      labelAr: cat.id === 'all' ? 'الكل' : cat.name,
    });
  });

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] transition-all">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-4">
          
          {/* Left: Mobile Toggle & Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 -mr-2 text-[#111111] hover:bg-[#F5F5F5] rounded-full transition-colors cursor-pointer"
              aria-label="القائمة الرئيسية"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Brand Logo */}
            <div
              onClick={() => onSelectCategory('all')}
              className="flex items-center gap-2.5 cursor-pointer group select-none py-1 whitespace-nowrap"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={BRAND_CONFIG.headerIcon}
                alt="LED LINE Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain shadow-xs flex-shrink-0 group-hover:opacity-90 transition-opacity"
                referrerPolicy="no-referrer"
              />
              <div className="flex items-center">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#111111] font-display whitespace-nowrap leading-none">
                  LED LINE
                </span>
              </div>
            </div>
          </div>

          {/* Center: Dynamic Desktop Navigation Links from Sanity */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 overflow-x-auto no-scrollbar py-1">
            {dynamicNavItems.map((item) => {
              const isActive = selectedCategory === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectCategory(item.id)}
                  className={`relative px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'text-[#111111] hover:bg-[#F5F5F5] hover:text-black'
                  }`}
                >
                  <span>{item.labelAr}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Actions & Tools */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            {/* Desktop Search Bar */}
            <div className="hidden sm:flex items-center relative w-44 md:w-56">
              <div className="w-full flex items-center bg-[#F5F5F5] hover:bg-[#EAEAEA] focus-within:bg-white rounded-full px-3.5 py-2 border border-transparent focus-within:border-[#111111] transition-all">
                <Search className="w-3.5 h-3.5 text-[#757575] flex-shrink-0" />
                <input
                  type="text"
                  placeholder="بحث سريع في المنتجات..."
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

            {/* Mobile Search Icon */}
            <button
              onClick={() => setIsSearchOpenMobile(!isSearchOpenMobile)}
              className="sm:hidden p-2 text-[#111111] hover:bg-[#F5F5F5] rounded-full transition-colors cursor-pointer"
              aria-label="البحث"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2.5 text-[#111111] hover:bg-[#F5F5F5] rounded-full transition-colors cursor-pointer"
              aria-label="المفضلة"
              title="المفضلة"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#D33918] text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 bg-[#111111] hover:bg-[#2A2A2A] text-white px-3.5 sm:px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
              aria-label="حقيبة التسوق"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">السلة</span>
              <span className="w-5 h-5 bg-white text-[#111111] text-[11px] font-bold rounded-full flex items-center justify-center font-mono">
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
                <span className="text-[11px] opacity-70 font-mono">
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
            <a href="tel:920008899" className="text-sm font-bold text-[#111111] font-mono block">
              920008899
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
