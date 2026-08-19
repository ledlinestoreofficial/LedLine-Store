'use client';

import React, { useState, useRef } from 'react';
import { BannerSlide, CategoryData } from '../../types';
import { saveBannerAction, deleteBannerAction } from '../../lib/actions';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  Loader2,
  Image as ImageIcon,
  ArrowLeft,
  ShieldCheck,
  Eye,
  Check,
} from 'lucide-react';

interface BannersClientProps {
  initialBanners: BannerSlide[];
  categories: CategoryData[];
}

const PRESET_BANNER_IMAGES = [
  { label: 'إضاءة COB معمارية', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop' },
  { label: 'بديل خشب وسلات', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600&auto=format&fit=crop' },
  { label: 'مسار مغناطيسي ذكي', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1600&auto=format&fit=crop' },
  { label: 'صالون مودرن وإنارة مخفية', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&auto=format&fit=crop' },
  { label: 'إنارة معلقة فندقية', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1600&auto=format&fit=crop' },
];

export function BannersClient({ initialBanners, categories }: BannersClientProps) {
  const [banners, setBanners] = useState<BannerSlide[]>(initialBanners);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerSlide | null>(null);

  // Form fields
  const [id, setId] = useState('');
  const [headlineAr, setHeadlineAr] = useState('');
  const [subheadlineAr, setSubheadlineAr] = useState('');
  const [ctaPrimaryAr, setCtaPrimaryAr] = useState('تسوق الآن');
  const [ctaPrimaryLink, setCtaPrimaryLink] = useState('led-cob');
  const [ctaSecondaryAr, setCtaSecondaryAr] = useState('استكشف التشكيلة');
  const [category, setCategory] = useState('led-cob');
  const [tagAr, setTagAr] = useState('');
  const [badgeAr, setBadgeAr] = useState('');
  const [image, setImage] = useState('');
  const [order, setOrder] = useState(1);
  const [active, setActive] = useState(true);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [bannerToDelete, setBannerToDelete] = useState<{ id: string; title: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setId(`banner-${Date.now().toString().slice(-4)}`);
    setHeadlineAr('');
    setSubheadlineAr('');
    setCtaPrimaryAr('تسوق أشرطة COB');
    setCtaPrimaryLink('led-cob');
    setCtaSecondaryAr('استكشف كافة المقاسات');
    setCategory('led-cob');
    setTagAr('تشكيلة معمارية 2026');
    setBadgeAr('ضمان ذهبي 5 سنوات');
    setImage('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop');
    setOrder(banners.length + 1);
    setActive(true);
    setShowUrlInput(false);
    setFeedback(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: BannerSlide) => {
    setEditingBanner(b);
    setId(b.id);
    setHeadlineAr(b.headlineAr);
    setSubheadlineAr(b.subheadlineAr || '');
    setCtaPrimaryAr(b.ctaPrimaryAr || 'تسوق الآن');
    setCtaPrimaryLink(b.ctaPrimaryLink || b.category || 'led-cob');
    setCtaSecondaryAr(b.ctaSecondaryAr || 'استكشف التشكيلة');
    setCategory(b.category || 'led-cob');
    setTagAr(b.tagAr || '');
    setBadgeAr(b.badgeAr || '');
    setImage(b.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop');
    setOrder(b.order !== undefined ? b.order : 1);
    setActive(b.active !== false);
    setShowUrlInput(false);
    setFeedback(null);
    setIsModalOpen(true);
  };

  const handleImageFileSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setImage(data.url);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) setImage(e.target.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) setImage(e.target.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headlineAr.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    const payload: Partial<BannerSlide> = {
      id: editingBanner ? editingBanner.id : (id.trim() || `banner-${Date.now()}`),
      headlineAr: headlineAr.trim(),
      subheadlineAr: subheadlineAr.trim(),
      ctaPrimaryAr: ctaPrimaryAr.trim() || 'تسوق الآن',
      ctaPrimaryLink: ctaPrimaryLink.trim() || category,
      ctaSecondaryAr: ctaSecondaryAr.trim() || 'استكشف التشكيلة',
      ctaSecondaryLink: 'all',
      category,
      tagAr: tagAr.trim(),
      badgeAr: badgeAr.trim(),
      image: image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop',
      order: Number(order) || 1,
      active,
    };

    try {
      const res = await saveBannerAction(payload);
      if (res.success) {
        setFeedback({ type: 'success', text: 'تم حفظ وتحديث البنر الإعلاني بنجاح في Sanity والمتجر' });
        
        // Optimistically update the list in UI
        const savedBanner: BannerSlide = {
          id: payload.id!,
          headlineAr: payload.headlineAr!,
          subheadlineAr: payload.subheadlineAr,
          ctaPrimaryAr: payload.ctaPrimaryAr,
          ctaPrimaryLink: payload.ctaPrimaryLink,
          ctaSecondaryAr: payload.ctaSecondaryAr,
          ctaSecondaryLink: payload.ctaSecondaryLink,
          category: payload.category || 'led-cob',
          tagAr: payload.tagAr,
          badgeAr: payload.badgeAr,
          image: payload.image || '',
          order: payload.order || 1,
          active: payload.active !== false,
        };

        setBanners((prev) => {
          const index = prev.findIndex((b) => b.id === savedBanner.id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = savedBanner;
            return next;
          }
          return [...prev, savedBanner];
        });

        setTimeout(() => {
          setIsModalOpen(false);
          setFeedback(null);
        }, 1200);
      } else {
        setFeedback({ type: 'error', text: res.error || 'حدث خطأ أثناء الحفظ' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'خطأ غير معروف في حفظ البنر' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (bannerId: string, title: string) => {
    setBannerToDelete({ id: bannerId, title });
  };

  const confirmDeleteBanner = async () => {
    if (!bannerToDelete) return;
    const { id: bannerId } = bannerToDelete;
    setDeletingId(bannerId);
    try {
      const res = await deleteBannerAction(bannerId);
      if (res.success) {
        setBanners((prev) => prev.filter((b) => b.id !== bannerId));
        setBannerToDelete(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E5E5] p-5 sm:p-6 rounded-3xl shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[#111111] flex items-center gap-2 font-display">
            <Megaphone className="w-5 h-5 text-[#111111]" />
            إدارة البنرات الإعلانية في واجهة المتجر ({banners.length})
          </h2>
          <p className="text-xs text-[#757575] mt-1 font-medium">
            التحكم الكامل في الصور الكبيرة، العناوين، نصوص الأزرار، والروابط المتزامنة مباشرة مع Sanity
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#111111] hover:bg-black text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة بنر إعلاني جديد</span>
        </button>
      </div>

      {/* Info Tip */}
      <div className="bg-[#FAF9F5] border border-[#ECE5D8] rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#B8860B] shrink-0 mt-0.5" />
        <div className="text-xs text-[#4A4637] leading-relaxed">
          <span className="font-bold text-[#111111]">ميزة الأبعاد المتوازنة:</span> يتم ضبط وتثبيت نسبة الارتفاع تلقائياً في واجهة المتجر لمنع اهتزاز أو تفاوت أبعاد البنر عند التنقل بين الصور والشرائح.
        </div>
      </div>

      {/* Banners Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((slide, idx) => (
          <div
            key={slide.id}
            className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-xs hover:border-[#111111] transition-all flex flex-col justify-between group"
          >
            {/* Slide Preview Frame */}
            <div className="relative aspect-21/9 w-full bg-[#111111] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop'}
                alt={slide.headlineAr}
                className="w-full h-full object-cover brightness-60 contrast-110 transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />

              {/* Badges & Actions */}
              <div className="absolute top-3 right-3 left-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-mono font-bold">
                    ترتيب: {slide.order || idx + 1}
                  </span>
                  {slide.active !== false ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/90 text-white text-[10px] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> نشط
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-500/90 text-white text-[10px] font-bold">
                      غير مفعّل
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-xl shadow-xs">
                  <button
                    onClick={() => handleOpenEdit(slide)}
                    className="p-1.5 rounded-lg text-[#111111] hover:bg-black hover:text-white transition-colors"
                    title="تعديل البنر"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id, slide.headlineAr)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                    title="حذف البنر"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Preview Content in Card */}
              <div className="absolute bottom-3 right-3 left-3 text-white space-y-1">
                {slide.tagAr && (
                  <span className="inline-block text-[9px] font-bold text-[#FFF2B2] bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {slide.tagAr}
                  </span>
                )}
                <h3 className="font-bold text-sm sm:text-base leading-tight drop-shadow-md">
                  {slide.headlineAr}
                </h3>
              </div>
            </div>

            {/* Details Content */}
            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                {slide.subheadlineAr && (
                  <p className="text-xs text-[#555555] leading-relaxed line-clamp-2">
                    {slide.subheadlineAr}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-[#E5E5E5] text-[11px]">
                  <div>
                    <span className="text-[#757575] block text-[10px]">زر الإجراء الأساسي:</span>
                    <span className="font-bold text-[#111111]">{slide.ctaPrimaryAr}</span>
                  </div>
                  <div>
                    <span className="text-[#757575] block text-[10px]">القسم المستهدف:</span>
                    <span className="font-bold text-[#111111]">{slide.ctaPrimaryLink || slide.category || 'all'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                <button
                  onClick={() => handleOpenEdit(slide)}
                  className="text-xs font-bold text-[#111111] hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل نصوص وصورة البنر</span>
                </button>

                {slide.badgeAr && (
                  <span className="text-[10px] font-bold text-[#12805C] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {slide.badgeAr}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-[#E5E5E5] rounded-3xl w-full max-w-2xl p-6 sm:p-7 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
              <h3 className="font-black text-[#111111] text-base sm:text-lg font-display flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#111111]" />
                {editingBanner ? 'تعديل البنر الإعلاني' : 'إضافة بنر إعلاني جديد'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-[#757575] hover:text-[#111111] hover:bg-[#F5F5F5] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3.5 rounded-xl flex items-center gap-2 text-xs font-bold ${
                  feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{feedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Live Preview Box in Modal */}
              <div className="bg-[#111111] rounded-2xl overflow-hidden relative aspect-21/9 border border-[#333333] shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop'}
                  alt="Preview"
                  className="w-full h-full object-cover brightness-50"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-3 right-4 left-4 text-white space-y-1.5">
                  {tagAr && (
                    <span className="inline-block text-[9px] font-bold text-[#FFF2B2] bg-white/10 px-2 py-0.5 rounded border border-white/20">
                      {tagAr}
                    </span>
                  )}
                  <h4 className="font-black text-sm sm:text-base leading-tight font-display">
                    {headlineAr || 'عنوان البنر الإعلاني الرئيسي...'}
                  </h4>
                  {subheadlineAr && (
                    <p className="text-[11px] text-[#D1D5DB] line-clamp-1">
                      {subheadlineAr}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-3 py-1 bg-white text-[#111111] rounded-full text-[10px] font-bold flex items-center gap-1">
                      {ctaPrimaryAr || 'تسوق الآن'}
                      <ArrowLeft className="w-3 h-3" />
                    </span>
                    {badgeAr && (
                      <span className="text-[9px] text-[#FFF2B2] bg-black/40 px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5 text-[#12805C]" />
                        {badgeAr}
                      </span>
                    )}
                  </div>
                </div>

                {isUploadingImage && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                    <span className="text-xs font-bold">جاري رفع الصورة إلى Sanity...</span>
                  </div>
                )}
              </div>

              {/* Headline */}
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1">
                  عنوان البنر الرئيسي (Headline) *
                </label>
                <input
                  type="text"
                  required
                  value={headlineAr}
                  onChange={(e) => setHeadlineAr(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111] font-bold"
                  placeholder="مثال: إضاءة معمارية نقية بلا نقاط."
                />
              </div>

              {/* Subheadline */}
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1">
                  العنوان الفرعي / الوصف المختصر
                </label>
                <textarea
                  rows={2}
                  value={subheadlineAr}
                  onChange={(e) => setSubheadlineAr(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  placeholder="تقنية COB فائقة الكثافة مع بروفايلات ألمنيوم مخفية تندمج بسلاسة في الأسقف..."
                />
              </div>

              {/* Primary & Secondary CTA Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F9FAFB] p-3.5 rounded-2xl border border-[#E5E5E5]">
                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">
                    نص زر الإجراء الأساسي (CTA) *
                  </label>
                  <input
                    type="text"
                    required
                    value={ctaPrimaryAr}
                    onChange={(e) => setCtaPrimaryAr(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    placeholder="تسوق أشرطة COB"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">
                    القسم المستهدف عند الضغط
                  </label>
                  <select
                    value={ctaPrimaryLink}
                    onChange={(e) => {
                      setCtaPrimaryLink(e.target.value);
                      setCategory(e.target.value);
                    }}
                    className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  >
                    <option value="all">كافة المنتجات</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">
                    نص الزر الثانوي (اختياري)
                  </label>
                  <input
                    type="text"
                    value={ctaSecondaryAr}
                    onChange={(e) => setCtaSecondaryAr(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    placeholder="استكشف كافة المقاسات"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">
                    شارة التمييز / الضمان (Badge)
                  </label>
                  <input
                    type="text"
                    value={badgeAr}
                    onChange={(e) => setBadgeAr(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    placeholder="ضمان ذهبي 5 سنوات"
                  />
                </div>
              </div>

              {/* Tag & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">
                    شارة التصنيف العلوية (Tag)
                  </label>
                  <input
                    type="text"
                    value={tagAr}
                    onChange={(e) => setTagAr(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    placeholder="تشكيلة معمارية 2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">
                    ترتيب العرض (Order)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs font-mono text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="flex items-center gap-2 sm:pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#111111]">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="w-4 h-4 accent-[#111111] rounded"
                    />
                    <span>تفعيل وعرض البنر</span>
                  </label>
                </div>
              </div>

              {/* Image Upload Area */}
              <div className="bg-[#F9FAFB] border border-[#E5E5E5] p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#111111] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#111111]" />
                    صورة البنر عالية الدقة *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[11px] text-[#111111] hover:underline font-bold flex items-center gap-1"
                  >
                    <LinkIcon className="w-3 h-3" />
                    {showUrlInput ? 'إخفاء الرابط' : 'إدخال رابط صورة مخصص'}
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageFileSelected(e.target.files)}
                />

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="w-full py-2.5 px-4 bg-white border border-[#111111] hover:bg-[#111111] hover:text-white rounded-xl text-xs font-bold text-[#111111] flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع صورة بنر من جهازك إلى Sanity</span>
                  </button>
                </div>

                {showUrlInput && (
                  <div className="pt-2 border-t border-[#E5E5E5]">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                )}

                {/* Preset Images */}
                <div className="pt-2 border-t border-[#E5E5E5]">
                  <p className="text-[10px] font-bold text-[#757575] mb-1.5">أو اختر صورة معمارية فائقة الدقة:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_BANNER_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImage(preset.url)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                          image === preset.url
                            ? 'bg-[#111111] text-white border-[#111111]'
                            : 'bg-white hover:bg-[#EAEAEA] text-[#111111] border-[#E5E5E5]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E5E5E5] text-xs font-bold text-[#757575] hover:text-[#111111] hover:bg-[#F5F5F5] transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#111111] hover:bg-black text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ في Sanity...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>حفظ وتطبيق البنر</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {bannerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E5E5] rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-[#111111] text-base">هل أنت متأكد من حذف البنر؟</h3>
              <p className="text-xs text-[#757575]">
                سيتم حذف بنر <span className="font-bold text-[#111111]">«{bannerToDelete.title}»</span> من Sanity والمتجر.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBannerToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E5E5E5] text-xs font-bold text-[#757575] hover:text-[#111111] transition-colors"
              >
                تراجع
              </button>
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={confirmDeleteBanner}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {deletingId ? 'جاري الحذف...' : 'تأكيد الحذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
