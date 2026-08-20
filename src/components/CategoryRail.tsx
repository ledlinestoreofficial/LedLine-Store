"use client";

import React, { useRef, useState, useEffect } from 'react';
import { CategoryId, CategoryData } from '../types';
import { CATEGORIES } from '../data/products';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface CategoryRailProps {
  categories?: CategoryData[];
  selectedCategory: CategoryId;
  onSelectCategory: (c: CategoryId) => void;
  lang?: 'ar' | 'en';
}

export const CategoryRail: React.FC<CategoryRailProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const rawList = (categories && categories.length > 0) ? categories : (CATEGORIES as CategoryData[]);
  
  // Ensure "all" (جميع المنتجات) is ALWAYS the first item
  const allCat = rawList.find((c) => c.id === 'all');
  const otherCats = rawList.filter((c) => c.id !== 'all');
  const displayCategories = allCat ? [allCat, ...otherCats] : rawList;

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const current = Math.abs(el.scrollLeft);
    setCanScrollPrev(current > 15);
    setCanScrollNext(current < maxScroll - 15);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollState, { passive: true });
      window.addEventListener('resize', updateScrollState);
      return () => {
        el.removeEventListener('scroll', updateScrollState);
        window.removeEventListener('resize', updateScrollState);
      };
    }
  }, [displayCategories]);

  const handleScroll = (direction: 'next' | 'prev') => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    // In Arabic RTL: 'next' moves further into the rail (leftwards), 'prev' moves back (rightwards)
    const step = 340;
    const delta = direction === 'next' ? -step : step;
    container.scrollBy({ left: delta, behavior: 'smooth' });
    setTimeout(updateScrollState, 350);
  };

  return (
    <section className="bg-[#F5F5F5] py-8 sm:py-10 border-b border-[#E5E5E5] relative group">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight font-display">
            استكشف التشكيلات الهندسية
          </h2>
        </div>

        {/* Rail Container with Dynamic Lateral Scroll Buttons */}
        <div className="relative">
          {/* Left Lateral Floating Arrow (Reveals more in RTL - auto-hides when end is reached) */}
          {canScrollNext && (
            <button
              onClick={() => handleScroll('next')}
              aria-label="التالي"
              title="عرض المزيد من الأقسام"
              className="flex absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 backdrop-blur-md border border-[#E5E5E5] shadow-lg hover:bg-[#111111] hover:text-white hover:border-[#111111] hover:scale-105 text-[#111111] items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Right Lateral Floating Arrow (Auto-hides when at the very start) */}
          {canScrollPrev && (
            <button
              onClick={() => handleScroll('prev')}
              aria-label="السابق"
              title="الأقسام السابقة"
              className="flex absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 backdrop-blur-md border border-[#E5E5E5] shadow-lg hover:bg-[#111111] hover:text-white hover:border-[#111111] hover:scale-105 text-[#111111] items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Horizontal Category Cards Rail */}
          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {displayCategories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`shrink-0 group relative overflow-hidden rounded-2xl transition-all duration-300 w-36 sm:w-44 text-right ${
                    isSelected
                      ? 'ring-2 ring-[#111111] shadow-md scale-[1.02]'
                      : 'hover:scale-[1.01] hover:shadow-xs'
                  }`}
                >
                  <div className="aspect-4/3 w-full relative bg-[#E5E5E5] overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity ${
                      isSelected ? 'opacity-95' : 'opacity-85 group-hover:opacity-75'
                    }`} />
                  </div>

                  <div className="absolute inset-0 p-3.5 flex flex-col justify-end text-white">
                    <span className="text-[10px] font-bold text-[#FFF2B2] uppercase tracking-wider">
                      {cat.count} منتج
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold leading-tight mt-0.5">
                      {cat.name}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

