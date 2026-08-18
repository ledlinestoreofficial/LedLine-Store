"use client";

import React from 'react';
import { FilterState } from '../types';
import { CATEGORIES } from '../data/products';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalMatches: number;
  lang?: 'ar' | 'en';
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalMatches,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#111111]" />
          <h3 className="font-bold text-sm text-[#111111]">
            تصفية المنتجات
          </h3>
          <span className="text-xs font-mono font-bold text-[#757575] bg-[#F5F5F5] px-2 py-0.5 rounded-full">
            {totalMatches}
          </span>
        </div>

        <button
          onClick={onResetFilters}
          className="text-xs text-[#757575] hover:text-[#111111] font-semibold flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>إعادة ضبط</span>
        </button>
      </div>

      {/* Category Pills List */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#757575]">
          التصنيف المعماري
        </label>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onFilterChange({ category: cat.id })}
              className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                filters.category === cat.id
                  ? 'bg-[#111111] text-white'
                  : 'text-[#111111] hover:bg-[#F5F5F5]'
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-[11px] opacity-75 font-mono">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-2 pt-2 border-t border-[#E5E5E5]">
        <div className="flex justify-between text-xs font-bold text-[#111111]">
          <span>السعر حتى:</span>
          <span className="font-mono">{filters.priceRange[1]} ر.س</span>
        </div>
        <input
          type="range"
          min="40"
          max="600"
          step="10"
          value={filters.priceRange[1]}
          onChange={(e) => onFilterChange({ priceRange: [filters.priceRange[0], Number(e.target.value)] })}
          className="w-full h-2 bg-[#E5E5E5] rounded-lg appearance-none cursor-pointer accent-[#111111]"
        />
      </div>

      {/* Stock & Promo Checkboxes */}
      <div className="space-y-2.5 pt-2 border-t border-[#E5E5E5] text-xs font-bold text-[#111111]">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onlyInStock}
            onChange={(e) => onFilterChange({ onlyInStock: e.target.checked })}
            className="w-4 h-4 accent-[#111111] rounded"
          />
          <span>المتوفر في المخزن فقط</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onlySale}
            onChange={(e) => onFilterChange({ onlySale: e.target.checked })}
            className="w-4 h-4 accent-[#111111] rounded"
          />
          <span className="text-[#D33918]">العروض والتخفيضات فقط</span>
        </label>
      </div>
    </div>
  );
};

