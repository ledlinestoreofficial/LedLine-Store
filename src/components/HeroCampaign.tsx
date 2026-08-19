"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { BannerSlide, CategoryId } from '../types';

interface HeroCampaignProps {
  banners?: BannerSlide[];
  onSelectCategory: (c: CategoryId) => void;
  lang?: 'ar' | 'en';
}

const DEFAULT_FALLBACK_SLIDES: BannerSlide[] = [
  {
    id: 'hero-1',
    tagAr: 'تشكيلة معمارية 2026',
    headlineAr: 'إضاءة معمارية نقية بلا نقاط.',
    subheadlineAr: 'تقنية COB فائقة الكثافة مع بروفايلات ألمنيوم مخفية تندمج بسلاسة في الأسقف والجدران الديكورية.',
    ctaPrimaryAr: 'تسوق أشرطة COB',
    ctaPrimaryLink: 'led-cob',
    ctaSecondaryAr: 'استكشف كافة المقاسات',
    ctaSecondaryLink: 'aluminum-profiles',
    category: 'led-cob',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop',
    badgeAr: 'ضمان ذهبي 5 سنوات',
    order: 1,
    active: true,
  },
  {
    id: 'hero-2',
    tagAr: 'تصاميم ديكورية متميزة',
    headlineAr: 'ألواح بديل الخشب والسلات الصوتية.',
    subheadlineAr: 'قشرة خشب البلوط والجوز الطبيعي المدمجة مع لباد عازل للصدى وتجاويف مخصصة للإنارة المخفية.',
    ctaPrimaryAr: 'استكشف ألواح الخشب',
    ctaPrimaryLink: 'wood-panels',
    ctaSecondaryAr: 'إلهام المساحات والتركيب',
    ctaSecondaryLink: 'wood-panels',
    category: 'wood-panels',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600&auto=format&fit=crop',
    badgeAr: 'عازل للصوت ومقاوم للرطوبة',
    order: 2,
    active: true,
  },
  {
    id: 'hero-3',
    tagAr: 'أنظمة الإنارة الحديثة',
    headlineAr: 'الإنارة المغناطيسية الذكية.',
    subheadlineAr: 'نظام الجهد المنخفض الآمن، ركّب وحرّك وحدات السبوت لايت والإنارة الخطية بلمسة يد.',
    ctaPrimaryAr: 'اكتشف الأنظمة المغناطيسية',
    ctaPrimaryLink: 'magnetic-track',
    ctaSecondaryAr: 'استكشف التشكيلة',
    ctaSecondaryLink: 'magnetic-track',
    category: 'magnetic-track',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1600&auto=format&fit=crop',
    badgeAr: 'جهد منخفض آمن 48V',
    order: 3,
    active: true,
  }
];

export const HeroCampaign: React.FC<HeroCampaignProps> = ({
  banners,
  onSelectCategory,
}) => {
  const slides = (banners && banners.length > 0) ? banners : DEFAULT_FALLBACK_SLIDES;
  const [currentSlide, setCurrentSlide] = useState(0);

  // Guard against out of bound index if banners array changes
  useEffect(() => {
    if (currentSlide >= slides.length) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[currentSlide] || slides[0] || DEFAULT_FALLBACK_SLIDES[0];

  return (
    <section className="relative bg-[#111111] text-white overflow-hidden select-none border-b border-[#222222]">
      {/* 
        Balanced proportions:
        Strict uniform fixed heights across all viewports to ensure balanced dimensions
        and prevent any resizing or jumping between images of different sizes.
      */}
      <div className="relative h-[440px] sm:h-[500px] lg:h-[560px] flex items-center">
        {/* Background Images with Crossfade */}
        {slides.map((s, idx) => {
          const isCurrent = idx === currentSlide;
          return (
            <div
              key={s.id || idx}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                isCurrent ? 'opacity-100 scale-100 z-0' : 'opacity-0 scale-105 pointer-events-none -z-10'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop'}
                alt={s.headlineAr || 'LED LINE Hero'}
                className="w-full h-full object-cover object-center brightness-[0.45] contrast-[1.1]"
                referrerPolicy="no-referrer"
              />
              {/* Balanced Dark Gradient Overlays for High Contrast Typography */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/85 via-[#111111]/40 to-transparent" />
            </div>
          );
        })}

        {/* Content Layer (Aligned in Max-Width Container) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl sm:max-w-3xl space-y-3 sm:space-y-4 text-right">
            {/* Display Headline with generous vertical line-height & padding to prevent any clipping */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white font-display leading-[1.3] sm:leading-[1.25] lg:leading-[1.22] py-2 overflow-visible">
              {activeSlide.headlineAr}
            </h1>

            {/* Sub-headline */}
            {activeSlide.subheadlineAr && (
              <p className="text-xs sm:text-base lg:text-lg text-[#E5E5E5] font-normal leading-relaxed max-w-2xl">
                {activeSlide.subheadlineAr}
              </p>
            )}

            {/* Primary Call to Action Button */}
            <div className="pt-2 sm:pt-3">
              <button
                onClick={() => onSelectCategory(activeSlide.ctaPrimaryLink || activeSlide.category || 'all')}
                className="bg-white text-[#111111] hover:bg-[#F5F5F5] rounded-full min-h-[44px] sm:min-h-[48px] px-7 sm:px-9 font-bold text-xs sm:text-sm transition-all duration-200 active:scale-95 shadow-lg inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{activeSlide.ctaPrimaryAr || 'تسوق الآن'}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Slide navigation indicators & buttons */}
        {slides.length > 1 && (
          <div className="absolute bottom-5 left-0 right-0 z-20 pointer-events-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between pointer-events-auto">
              {/* Dots */}
              <div className="flex items-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                      idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`شريحة ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Arrow controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-all active:scale-90 cursor-pointer"
                  aria-label="السابق"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-all active:scale-90 cursor-pointer"
                  aria-label="التالي"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
