"use client";

import React from 'react';
import { Phone, MapPin, Mail } from 'lucide-react';
import { CategoryId } from '../types';
import { CATEGORIES } from '../data/products';
import { BRAND_CONFIG } from '../data/brand';

interface FooterProps {
  onSelectCategory: (c: CategoryId) => void;
  lang?: 'ar' | 'en';
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
}) => {
  return (
    <footer className="bg-[#111111] text-white pt-16 pb-12 border-t border-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            {/* Brand Logo - Icon Image beside LED LINE text */}
            <div className="flex items-center gap-3">
              <img
                src={BRAND_CONFIG.footerIcon}
                alt="LED LINE Logo"
                className="w-10 h-10 rounded-xl object-contain shadow-xs flex-shrink-0"
                referrerPolicy="no-referrer"
              />
              <span className="text-2xl font-black tracking-tight text-white font-display">
                LED LINE
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#757575] leading-relaxed max-w-sm">
              العلامة الرائدة في حلول الإنارة المعمارية وأشرطة الليد COB وبروفايلات الألمنيوم وألواح خشب الجدران الديكورية.
            </p>
          </div>

          {/* Categories Col */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">
              أقسام المنتجات
            </h5>
            <ul className="space-y-2 text-xs text-[#757575]">
              {CATEGORIES.slice(1, 7).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory(cat.id)}
                    className="hover:text-white transition-colors text-right"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Showrooms & Location */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">
              معارضنا ومستودعاتنا
            </h5>
            <ul className="space-y-2.5 text-xs text-[#757575]">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-white flex-shrink-0 mt-0.5" />
                <span>
                  المكلا: الديس, جولة الشهيدة منار, طلعة الماليشيا
                </span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">
              خدمة العملاء والمشاريع
            </h5>
            <ul className="space-y-2.5 text-xs text-[#757575]">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-white flex-shrink-0" />
                <span className="font-mono text-white font-semibold">920008899 / 0500123456</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-white flex-shrink-0" />
                <span className="font-mono">ledlinestoreofficial@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#757575]">
          <p>© جميع الحقوق محفوظة لمتجر LED LINE.</p>
        </div>
      </div>
    </footer>
  );
};
