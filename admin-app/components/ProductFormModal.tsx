'use client';

import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { saveProductAction } from '../lib/actions';
import { toEnglishDigits, parseNumericEnglish } from '../lib/num-utils';
import {
  X,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Upload,
  Link as LinkIcon,
  Star,
  Layers,
} from 'lucide-react';

interface ProductFormModalProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Sample presets for quick testing
const QUICK_PRESET_IMAGES = [
  { label: 'شريط COB 3000K', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop' },
  { label: 'بروفايل ألمنيوم غاطس', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop' },
  { label: 'بديل خشب سلات بلوط', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1000&auto=format&fit=crop' },
  { label: 'مسار مغناطيسي 48V', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1000&auto=format&fit=crop' },
  { label: 'إنارة معلقة مودرن', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1000&auto=format&fit=crop' },
  { label: 'نيون فليكس سيليكون', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1000&auto=format&fit=crop' },
];

export function ProductFormModal({
  product,
  isOpen,
  onClose,
  onSuccess,
}: ProductFormModalProps) {
  const isEdit = Boolean(product);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State - 100% Arabic
  const [formData, setFormData] = useState<Partial<Product>>(() => {
    if (product) return { ...product };
    return {
      name: '',
      sku: `LL-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'led-cob',
      categoryName: 'شريط ليد وسيليكون',
      badge: '',
      price: undefined,
      originalPrice: undefined,
      shortDescription: '',
      description: '',
      inStock: true,
      featured: false,
      isSale: false,
      stockCount: undefined,
      images: [],
      features: ['ضمان 3 سنوات معتمد', 'إنارة متصلة متجانسة بدون نقاط'],
      specs: {
        wattage: '10W/M',
        voltage: 'DC 24V',
        cri: 'CRI > 90',
        ipRating: 'IP20',
        warranty: '3 سنوات',
        colorTemp: '3000K / 4000K',
      },
    };
  });

  // Display strings for numeric inputs to allow seamless Arabic keypad typing
  const [priceStr, setPriceStr] = useState<string>(
    product?.price !== undefined ? String(product.price) : ''
  );
  const [origPriceStr, setOrigPriceStr] = useState<string>(
    product?.originalPrice !== undefined ? String(product.originalPrice) : ''
  );
  const [stockStr, setStockStr] = useState<string>(
    product?.stockCount !== undefined ? String(product.stockCount) : ''
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Images state
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [newFeature, setNewFeature] = useState('');

  // Handle Arabic name change
  const handleArabicNameChange = (arabicName: string) => {
    setFormData((prev) => ({ ...prev, name: arabicName }));
  };

  // Sync category names in Arabic
  const handleCategoryChange = (cat: string) => {
    const catNames: Record<string, string> = {
      'led-cob': 'شريط ليد وسيليكون',
      'aluminum-profiles': 'بروفايلات الألمنيوم',
      'wood-panels': 'أخشاب الجدران المودرن',
      'magnetic-track': 'المسارات المغناطيسية',
      'pendant-modern': 'الإنارة المعلقة الحديثة',
      'outdoor-linear': 'الإنارة الخارجية والحدائق',
      'power-smart': 'المحولات والتحكم الذكي',
    };

    setFormData((prev) => ({
      ...prev,
      category: cat,
      categoryName: catNames[cat] || cat,
    }));
  };

  // Handle Numeric Inputs with Arabic-to-English conversion
  const handlePriceInput = (val: string) => {
    const englishVal = toEnglishDigits(val).replace(/[^0-9.]/g, '');
    setPriceStr(englishVal);
    setFormData((prev) => ({
      ...prev,
      price: englishVal ? parseNumericEnglish(englishVal, 0) : undefined,
    }));
  };

  const handleOrigPriceInput = (val: string) => {
    const englishVal = toEnglishDigits(val).replace(/[^0-9.]/g, '');
    setOrigPriceStr(englishVal);
    setFormData((prev) => ({
      ...prev,
      originalPrice: englishVal ? parseNumericEnglish(englishVal, undefined) : undefined,
    }));
  };

  const handleStockInput = (val: string) => {
    const englishVal = toEnglishDigits(val).replace(/[^0-9]/g, '');
    setStockStr(englishVal);
    setFormData((prev) => ({
      ...prev,
      stockCount: englishVal ? parseNumericEnglish(englishVal, 0) : undefined,
    }));
  };

  const handleSkuInput = (val: string) => {
    const englishVal = toEnglishDigits(val).toUpperCase();
    setFormData((prev) => ({ ...prev, sku: englishVal }));
  };

  // Local Device File Upload Handler
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Url = e.target?.result as string;
        if (base64Url) {
          setFormData((prev) => ({
            ...prev,
            images: [...(prev.images || []), base64Url],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // Add Image via URL (Secondary)
  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), newImageUrl.trim()],
      }));
      setNewImageUrl('');
    }
  };

  // Add Preset Image
  const handleAddPresetImage = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), url],
    }));
  };

  // Set as Cover / Main Image (Moves to index 0)
  const handleSetCoverImage = (index: number) => {
    setFormData((prev) => {
      const list = [...(prev.images || [])];
      if (index > 0 && index < list.length) {
        const [target] = list.splice(index, 1);
        list.unshift(target);
      }
      return { ...prev, images: list };
    });
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  // Features
  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()],
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index),
    }));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name?.trim()) {
      setErrorMsg('يرجى كتابة اسم المنتج بالعربية');
      return;
    }

    if (!priceStr.trim()) {
      setErrorMsg('يرجى تحديد السعر الحالي للمنتج');
      return;
    }

    const numericPrice = parseNumericEnglish(priceStr, 0);
    if (numericPrice <= 0) {
      setErrorMsg('يجب أن يكون السعر أكبر من صفر');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validate images
    const finalImages = (formData.images && formData.images.length > 0)
      ? formData.images
      : ['https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop'];

    try {
      const res = await saveProductAction({
        ...formData,
        images: finalImages,
        price: numericPrice,
        originalPrice: origPriceStr.trim() ? parseNumericEnglish(origPriceStr, undefined) : undefined,
        stockCount: stockStr.trim() ? parseNumericEnglish(stockStr, 0) : 0,
      });

      if (res.success) {
        setSuccessMsg(res.message || 'تم حفظ ورفع المنتج إلى Sanity بنجاح');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.error || 'حدث خطأ أثناء الحفظ');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-[#E5E5E5] rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-[#111111]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#E5E5E5] bg-[#F9FAFB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#111111] text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#111111] font-display">
                {isEdit ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
              </h2>
              <p className="text-[11px] text-[#757575] font-medium mt-0.5">
                أدخل تفاصيل المنتج باللغة العربية وسيتم الحفظ والربط مباشرة مع المتجر وقاعدة البيانات
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#757575] hover:text-[#111111] hover:bg-[#EAEAEA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#111111] mb-1.5">
                  اسم المنتج *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => handleArabicNameChange(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#E5E5E5] rounded-2xl px-4 py-3 text-sm font-bold text-[#111111] placeholder-[#9CA3AF] focus:bg-white focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all shadow-2xs"
                  placeholder="مثال: شريط ليد COB فائق النعومة 24V أصفر دافئ"
                />
              </div>

              {/* SKU Code */}
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1.5">
                  رمز المنتج (SKU) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku || ''}
                  onChange={(e) => handleSkuInput(e.target.value)}
                  dir="ltr"
                  className="w-full bg-[#F9FAFB] border border-[#E5E5E5] rounded-2xl px-4 py-2.5 text-xs font-mono font-bold text-[#111111] focus:bg-white focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
                  placeholder="LL-COB-24V"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1.5">
                  القسم / الفئة *
                </label>
                <select
                  value={formData.category || 'led-cob'}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#E5E5E5] rounded-2xl px-4 py-2.5 text-xs text-[#111111] focus:bg-white focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all font-bold"
                >
                  <option value="led-cob">شريط ليد وسيليكون</option>
                  <option value="aluminum-profiles">بروفايلات الألمنيوم</option>
                  <option value="wood-panels">أخشاب الجدران المودرن وبديل الخشب</option>
                  <option value="magnetic-track">المسارات المغناطيسية</option>
                  <option value="pendant-modern">الإنارة المعلقة الحديثة</option>
                  <option value="outdoor-linear">الإنارة الخارجية والحدائق</option>
                  <option value="power-smart">المحولات والتحكم الذكي</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Stock (EMPTY BY DEFAULT) */}
          <div className="bg-[#F9FAFB] border border-[#E5E5E5] p-4.5 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#111111]">
                الأسعار والمخزون
              </h3>
              <span className="text-[10px] text-[#757575] font-bold">العملة: ريال سعودي (ر.س)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Current Price */}
              <div>
                <label className="block text-[11px] font-bold text-[#111111] mb-1">
                  السعر الحالي (ر.س) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    dir="ltr"
                    required
                    value={priceStr}
                    onChange={(e) => handlePriceInput(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-sm font-mono font-black text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
                    placeholder=""
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-[#757575] font-bold pointer-events-none">
                    ر.س
                  </span>
                </div>
              </div>

              {/* Original Price */}
              <div>
                <label className="block text-[11px] font-bold text-[#111111] mb-1">
                  السعر قبل الخصم (اختياري)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    dir="ltr"
                    value={origPriceStr}
                    onChange={(e) => handleOrigPriceInput(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-[#757575] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
                    placeholder=""
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-[#757575] font-bold pointer-events-none">
                    ر.س
                  </span>
                </div>
              </div>

              {/* Stock Count */}
              <div>
                <label className="block text-[11px] font-bold text-[#111111] mb-1">
                  كمية المخزون (عدد/متر)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  value={stockStr}
                  onChange={(e) => handleStockInput(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
                  placeholder=""
                />
              </div>
            </div>

            {/* Badges and Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-[#111111] mb-1">
                  شارة ترويجية (اختياري)
                </label>
                <input
                  type="text"
                  value={formData.badge || ''}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111111]"
                  placeholder="مثال: الأكثر طلباً / جديد / عرض خاص"
                />
              </div>

              <div className="flex items-center gap-5 pt-3 sm:pt-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#111111]">
                  <input
                    type="checkbox"
                    checked={formData.inStock !== false}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="rounded border-[#E5E5E5] w-4 h-4 accent-black"
                  />
                  <span>متوفر للطلب</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#111111]">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.featured)}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-[#E5E5E5] w-4 h-4 accent-black"
                  />
                  <span>منتج مميز</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#111111]">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isSale)}
                    onChange={(e) => setFormData({ ...formData, isSale: e.target.checked })}
                    className="rounded border-[#E5E5E5] w-4 h-4 accent-black"
                  />
                  <span>عرض تخفيض</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: IMAGES MANAGEMENT */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-[#111111]">
                  صور المنتج (الرفع المباشر من جهازك) *
                </label>
                <p className="text-[11px] text-[#757575] mt-0.5">
                  يمكنك رفع صور من جهازك أو سحبها وإفلاتها مباشرة
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] text-[#111111] hover:underline font-bold flex items-center gap-1"
              >
                <LinkIcon className="w-3 h-3" />
                {showUrlInput ? 'إخفاء خيار الرابط' : 'إضافة عبر رابط URL خارجي'}
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />

            {/* Primary Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#111111] bg-[#F5F5F5] scale-[0.99]'
                  : 'border-[#D1D5DB] bg-[#F9FAFB] hover:border-[#111111] hover:bg-white'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E5E5] flex items-center justify-center text-[#111111] shadow-2xs">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-[#111111]">
                  اضغط هنا لاختيار صور من جهازك أو اسحب الصور وأفلتها هنا
                </p>
                <p className="text-[11px] text-[#757575]">
                  يدعم صور JPG, PNG, WEBP عالية الدقة
                </p>
              </div>
            </div>

            {/* Secondary Option: URL input (Collapsible) */}
            {showUrlInput && (
              <div className="p-3.5 rounded-2xl bg-[#F5F5F5] border border-[#E5E5E5] space-y-2 animate-in fade-in duration-150">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://... رابط صورة المنتج المباشر"
                    className="flex-1 bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2 text-xs text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111111]"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 bg-[#111111] hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة الرابط
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="pt-2 border-t border-[#E5E5E5]/80">
                  <p className="text-[10px] font-bold text-[#757575] mb-1.5">نماذج صور سريعة للتجربة:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddPresetImage(preset.url)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#EAEAEA] border border-[#E5E5E5] text-[10px] font-bold text-[#111111] transition-colors"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Uploaded Images Gallery Grid */}
            {formData.images && formData.images.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#757575]">
                  الصور المرفوعة ({formData.images.length} صورة) - الأولى هي الصورة الرئيسية:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {formData.images.map((img, idx) => {
                    const isCover = idx === 0;
                    return (
                      <div
                        key={idx}
                        className={`group relative rounded-2xl overflow-hidden border transition-all ${
                          isCover ? 'border-[#111111] ring-2 ring-[#111111]/10' : 'border-[#E5E5E5]'
                        } bg-white`}
                      >
                        <div className="aspect-square w-full relative bg-[#F5F5F5]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img}
                            alt={`Product preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Top Badges & Actions */}
                        <div className="absolute top-2 right-2 left-2 flex items-center justify-between">
                          {isCover ? (
                            <span className="px-2 py-0.5 rounded-md bg-[#111111] text-white text-[9px] font-black tracking-wide flex items-center gap-1 shadow-sm">
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              الرئيسية
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetCoverImage(idx)}
                              className="px-2 py-0.5 rounded-md bg-white/90 hover:bg-white text-[#111111] text-[9px] font-bold shadow-sm backdrop-blur-xs border border-[#E5E5E5]"
                            >
                              تعيين كرئيسية
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1 rounded-md bg-rose-600/90 hover:bg-rose-700 text-white shadow-sm"
                            title="حذف الصورة"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Short Description & Features */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1.5">
                الوصف المختصر للمنتج
              </label>
              <textarea
                rows={2}
                value={formData.shortDescription || ''}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="w-full bg-[#F9FAFB] border border-[#E5E5E5] rounded-2xl p-3.5 text-xs text-[#111111] placeholder-[#9CA3AF] focus:bg-white focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
                placeholder="وصف تسويقي موجز يشرح أهم استخدامات ومزايا المنتج..."
              />
            </div>

            {/* Features List */}
            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1.5">
                المزايا والنقاط البارزة
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="مثال: رقائق سانان الأصلية San'an CRI>92 مع ضمان 3 سنوات"
                  className="flex-1 bg-[#F9FAFB] border border-[#E5E5E5] rounded-xl px-3.5 py-2 text-xs text-[#111111] placeholder-[#9CA3AF] focus:bg-white focus:outline-none focus:border-[#111111] transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-4 py-2 bg-[#111111] hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" /> إضافة ميزة
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(formData.features || []).map((feat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] text-xs text-[#111111] font-medium"
                  >
                    {feat}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="text-[#757575] hover:text-rose-600 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E5E5] bg-[#F9FAFB]">
          <div className="flex items-center gap-2 text-[11px] text-[#757575]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium">الربط مباشر مع Sanity CMS والمتجر</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#757575] hover:text-[#111111] hover:bg-[#EAEAEA] transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#111111] hover:bg-black text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري حفظ ورفع المنتج...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? 'حفظ التعديلات' : 'إضافة ونشر المنتج'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
