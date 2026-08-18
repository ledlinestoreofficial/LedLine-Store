"use client";

import React from 'react';
import { CategoryId, CategoryData } from '../types';
import { CATEGORIES } from '../data/products';

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
  const displayCategories = (categories && categories.length > 0) ? categories : (CATEGORIES as CategoryData[]);

  return (
    <section className="bg-[#F5F5F5] py-8 sm:py-10 border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
              استكشف التشكيلات الهندسية
            </h2>
            <p className="text-xs sm:text-sm text-[#757575] mt-0.5">
              اختر القسم لتصفح أحدث المنتجات والمواصفات الفنية
            </p>
          </div>

          <span className="text-xs font-bold text-[#757575] uppercase tracking-wider hidden sm:inline-block font-mono">
            {displayCategories.length} تصنيفات معمارية
          </span>
        </div>

        {/* Horizontal Category Cards Rail */}
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
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
                  <span className="text-[10px] font-bold text-[#FFF2B2] uppercase tracking-wider font-mono">
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
    </section>
  );
};
