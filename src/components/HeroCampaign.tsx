"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { CategoryId } from '../types';

interface HeroCampaignProps {
  onSelectCategory: (c: CategoryId) => void;
  lang?: 'ar' | 'en';
}

interface Slide {
  id: string;
  tagAr: string;
  headlineAr: string;
  subheadlineAr: string;
  ctaPrimaryAr: string;
  ctaSecondaryAr: string;
  category: CategoryId;
  image: string;
  accentBg: string;
  badgeAr: string;
}

const SLIDES: Slide[] = [
  {
    id: 'hero-1',
    tagAr: '',
    headlineAr: 'إضاءة معمارية نقية بلا نقاط.',
    subheadlineAr: 'تقنية COB فائقة الكثافة مع بروفايلات ألمنيوم مخفية تندمج بسلاسة في الأسقف والجدران الديكورية.',
    ctaPrimaryAr: 'تسوق أشرطة COB',
    ctaSecondaryAr: 'استكشف كافة المقاسات',
    category: 'led-cob',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop',
    accentBg: '#111111',
    badgeAr: ''
  },
  {
    id: 'hero-2',
    tagAr: '',
    headlineAr: 'ألواح بديل الخشب والسلات الصوتية.',
    subheadlineAr: 'قشرة خشب البلوط والجوز الطبيعي المدمجة مع لباد عازل للصدى وتجاويف مخصصة للإنارة المخفية.',
    ctaPrimaryAr: 'استكشف ألواح الخشب',
    ctaSecondaryAr: 'إلهام المساحات والتركيب',
    category: 'wood-panels',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600&auto=format&fit=crop',
    accentBg: '#211C18',
    badgeAr: ''
  },
  {
    id: 'hero-3',
    tagAr: '',
    headlineAr: 'الإنارة المغناطيسية الذكية.',
    subheadlineAr: 'نظام الجهد المنخفض الآمن، ركّب وحرّك وحدات السبوت لايت والإنارة الخطية بلمسة يد.',
    ctaPrimaryAr: 'اكتشف الأنظمة المغناطيسية',
    ctaSecondaryAr: 'استكشف التشكيلة',
    category: 'magnetic-track',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1600&auto=format&fit=crop',
    accentBg: '#181A1C',
    badgeAr: ''
  }
];

export const HeroCampaign: React.FC<HeroCampaignProps> = ({
  onSelectCategory,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <section className="relative bg-[#111111] text-white overflow-hidden">
      {/* Background Image Container with Gradient Overlay */}
      <div className="relative min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] flex items-center">
        {SLIDES.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            <img
              src={s.image}
              alt={s.headlineAr}
              className="w-full h-full object-cover object-center brightness-[0.45] contrast-[1.1]"
              referrerPolicy="no-referrer"
            />
            {/* Dark Gradient Overlay for Nike High Contrast Typography */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/80 via-transparent to-[#111111]/40" />
          </div>
        ))}

        {/* Content Box */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
          <div className="max-w-2xl sm:max-w-3xl space-y-6 text-right">
            {/* Tag Badge */}
            {slide.tagAr && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#FFF2B2]" />
                <span>{slide.tagAr}</span>
              </div>
            )}

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-white font-display">
              {slide.headlineAr}
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg lg:text-xl text-[#E5E5E5] font-normal leading-relaxed max-w-2xl">
              {slide.subheadlineAr}
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                onClick={() => onSelectCategory(slide.category)}
                className="bg-white text-[#111111] hover:bg-[#E5E5E5] rounded-full min-h-[48px] px-8 font-bold text-base transition-all duration-200 active:scale-95 shadow-lg flex items-center gap-2"
              >
                <span>{slide.ctaPrimaryAr}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectCategory(slide.category)}
                className="bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/30 rounded-full min-h-[48px] px-6 font-semibold text-sm transition-all duration-200"
              >
                {slide.ctaSecondaryAr}
              </button>

              {slide.badgeAr && (
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-semibold text-[#FFF2B2]">
                  <ShieldCheck className="w-4 h-4 text-[#12805C]" />
                  <span>{slide.badgeAr}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Slide navigation indicators & buttons */}
        <div className="absolute bottom-6 left-0 right-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Dots */}
            <div className="flex items-center gap-2">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 transition-all duration-300 rounded-full ${
                    idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`شريحة ${idx + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-all active:scale-90"
                aria-label="السابق"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-all active:scale-90"
                aria-label="التالي"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
