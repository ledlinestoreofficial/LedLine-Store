'use client';

import React, { useState, useRef } from 'react';
import { CategoryData, Product } from '../../types';
import { saveCategoryAction, deleteCategoryAction } from '../../lib/actions';
import {
  Layers,
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
  Sliders,
  Zap,
  Compass,
  SunMedium,
  Cpu,
  Eye,
} from 'lucide-react';

interface CategoriesClientProps {
  initialCategories: CategoryData[];
  products: Product[];
}

const ICON_OPTIONS = [
  { name: 'Sparkles', label: 'بريق / تميز', Icon: Sparkles },
  { name: 'Layers', label: 'طبقات / خشب', Icon: Layers },
  { name: 'Sliders', label: 'بروفايل / تحكم', Icon: Sliders },
  { name: 'Zap', label: 'مغناطيسي / طاقة', Icon: Zap },
  { name: 'Compass', label: 'معلق / تصميم', Icon: Compass },
  { name: 'SunMedium', label: 'خارجي / شمس', Icon: SunMedium },
  { name: 'Cpu', label: 'محولات / ذكي', Icon: Cpu },
];

const PRESET_CATEGORY_IMAGES = [
  { label: 'شريط ليد COB', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop' },
  { label: 'بروفايل ألمنيوم', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop' },
  { label: 'بديل خشب سلات', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop' },
  { label: 'مسار مغناطيسي', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop' },
  { label: 'إنارة معلقة', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop' },
  { label: 'إنارة خارجية', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop' },
];

export function CategoriesClient({ initialCategories, products }: CategoriesClientProps) {
  const [categories, setCategories] = useState<CategoryData[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Sparkles');
  const [image, setImage] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setId(`cat-${Date.now().toString().slice(-4)}`);
    setName('');
    setNameEn('');
    setDescription('');
    setIcon('Sparkles');
    setImage('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop');
    setShowUrlInput(false);
    setFeedback(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryData) => {
    setEditingCategory(cat);
    setId(cat.id);
    setName(cat.name);
    setNameEn(cat.nameEn || '');
    setDescription(cat.description || '');
    setIcon(cat.icon || 'Sparkles');
    setImage(cat.image || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop');
    setShowUrlInput(false);
    setFeedback(null);
    setIsModalOpen(true);
  };

  // Upload image to Sanity directly
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
        // Fallback to client base64 preview
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImage(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      // Fallback
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    const payload: Partial<CategoryData> = {
      id: editingCategory ? editingCategory.id : (id.trim() || `cat-${Date.now()}`),
      name: name.trim(),
      nameEn: nameEn.trim() || name.trim(),
      description: description.trim(),
      icon,
      image: image || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
    };

    try {
      const res = await saveCategoryAction(payload);
      if (res.success) {
        setFeedback({ type: 'success', text: 'تم حفظ وتحديث القسم والصورة بنجاح في Sanity والمتجر' });
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setFeedback({ type: 'error', text: res.error || 'حدث خطأ أثناء الحفظ' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'خطأ غير معروف في حفظ القسم' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (categoryId: string, name: string) => {
    setCategoryToDelete({ id: categoryId, name });
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    const { id: categoryId } = categoryToDelete;
    setDeletingId(categoryId);
    try {
      const res = await deleteCategoryAction(categoryId);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== categoryId));
        setCategoryToDelete(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E5E5] p-5 sm:p-6 rounded-3xl shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[#111111] flex items-center gap-2 font-display">
            <Layers className="w-5 h-5 text-[#111111]" />
            أقسام المتجر والتشكيلات الهندسية ({categories.length})
          </h2>
          <p className="text-xs text-[#757575] mt-1 font-medium">
            التحكم في الأقسام، الصور المعمارية الخاصة بكل قسم، والتي تظهر في واجهة المتجر في قسم (استكشف التشكيلات الهندسية)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#111111] hover:bg-black text-white font-bold text-xs transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة قسم جديد + صورة مخصصة</span>
        </button>
      </div>

      {/* Live Preview Info Banner */}
      <div className="bg-[#FAF9F5] border border-[#ECE5D8] rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#B8860B] shrink-0 mt-0.5" />
        <div className="text-xs text-[#4A4637] leading-relaxed">
          <span className="font-bold text-[#111111]">تلميح معماري:</span> الصور المحددة لكل قسم هنا تظهر مباشرة في الشريط العلوي التفاعلي <span className="font-bold">«استكشف التشكيلات الهندسية»</span> في الصفحة الرئيسية لتمكين الزوار من التصفح البصري السريع.
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((category) => {
          const productCount = products.filter((p) => p.category === category.id).length;
          return (
            <div
              key={category.id}
              className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden hover:border-[#111111] transition-all flex flex-col justify-between shadow-xs group"
            >
              {/* Category Card Header with Image */}
              <div className="relative aspect-16/9 w-full bg-[#E5E5E5] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={category.image || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop'}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="absolute top-3 right-3 left-3 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold">
                    {category.id}
                  </span>

                  <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-xl shadow-xs">
                    <button
                      onClick={() => handleOpenEdit(category)}
                      className="p-1.5 rounded-lg text-[#111111] hover:bg-black hover:text-white transition-colors"
                      title="تعديل القسم وتغيير الصورة"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {category.id !== 'all' && (
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                        title="حذف القسم"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-3 right-3 left-3 text-white">
                  <span className="text-[10px] font-bold text-[#FFF2B2] uppercase tracking-wider font-mono">
                    {productCount} منتج متوفر
                  </span>
                  <h3 className="font-bold text-sm sm:text-base leading-tight mt-0.5">
                    {category.name}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-4.5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[#757575] text-xs font-mono font-medium">{category.nameEn}</p>
                  {category.description ? (
                    <p className="text-[#555555] text-xs mt-2 line-clamp-2 leading-relaxed">{category.description}</p>
                  ) : (
                    <p className="text-[#9CA3AF] text-xs mt-2 italic">لا يوجد وصف مدخل</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                  <button
                    onClick={() => handleOpenEdit(category)}
                    className="text-xs font-bold text-[#111111] hover:underline flex items-center gap-1"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>تغيير صورة القسم</span>
                  </button>

                  <span className="text-[11px] font-bold text-[#757575] bg-[#F5F5F5] px-2.5 py-1 rounded-lg">
                    {category.icon || 'Sparkles'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-[#E5E5E5] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
              <h3 className="font-black text-[#111111] text-base font-display flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#111111]" />
                {editingCategory ? `تعديل قسم: ${editingCategory.name}` : 'إضافة قسم جديد وتعيين صورته'}
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
                className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold ${
                  feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{feedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Identifier */}
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1">
                  معرّف القسم (ID / Slug الإنجليزي) *
                </label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingCategory)}
                  value={id}
                  onChange={(e) => setId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  className="w-full bg-[#F9FAFB] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#111111] focus:outline-none focus:border-[#111111] disabled:opacity-60"
                  placeholder="مثال: custom-profiles"
                />
                <p className="text-[10px] text-[#757575] mt-1">يُستخدم لربط المنتجات بهذا القسم برمجياً</p>
              </div>

              {/* Names in Arabic & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">
                    اسم القسم (عربي) *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    placeholder="مثال: بروفايلات ألمنيوم معمارية"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">
                    اسم القسم (إنجليزي)
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    placeholder="Aluminum Profiles"
                  />
                </div>
              </div>

              {/* Category Image Upload & Preview */}
              <div className="bg-[#F9FAFB] border border-[#E5E5E5] p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#111111] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#111111]" />
                    صورة القسم في (استكشف التشكيلات الهندسية) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[11px] text-[#111111] hover:underline font-bold flex items-center gap-1"
                  >
                    <LinkIcon className="w-3 h-3" />
                    {showUrlInput ? 'إخفاء الرابط' : 'إدخال رابط صورة'}
                  </button>
                </div>

                {/* Hidden input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageFileSelected(e.target.files)}
                />

                {/* Live Preview Card */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-36 h-28 relative rounded-2xl overflow-hidden bg-[#E5E5E5] shrink-0 border border-[#111111] shadow-xs group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop'}
                      alt="Category Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-2 right-2 left-2 text-white">
                      <span className="text-[8px] font-bold text-[#FFF2B2] font-mono">معاينة مباشرة</span>
                      <p className="text-[11px] font-bold truncate">{name || 'اسم القسم'}</p>
                    </div>

                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white gap-1">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-[9px] font-bold">جاري الرفع إلى Sanity...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="w-full py-2.5 px-4 bg-white border border-[#111111] hover:bg-[#111111] hover:text-white rounded-xl text-xs font-bold text-[#111111] flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع صورة من جهازك إلى Sanity</span>
                    </button>

                    <p className="text-[10px] text-[#757575]">
                      يتم رفع الصورة وتوليد رابط فائق السرعة عبر Sanity CDN
                    </p>
                  </div>
                </div>

                {/* URL Input (Collapsible) */}
                {showUrlInput && (
                  <div className="pt-2 border-t border-[#E5E5E5] space-y-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                )}

                {/* Quick Preset Images */}
                <div className="pt-2 border-t border-[#E5E5E5]">
                  <p className="text-[10px] font-bold text-[#757575] mb-1.5">أو اختر صورة معمارية جاهزة:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_CATEGORY_IMAGES.map((preset, idx) => (
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

              {/* Icon Selector */}
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1.5">
                  أيقونة القسم
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {ICON_OPTIONS.map((opt) => {
                    const isSelected = icon === opt.name;
                    const IconComp = opt.Icon;
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setIcon(opt.name)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? 'border-[#111111] bg-[#111111] text-white'
                            : 'border-[#E5E5E5] bg-white text-[#757575] hover:border-[#111111] hover:text-[#111111]'
                        }`}
                        title={opt.label}
                      >
                        <IconComp className="w-4 h-4" />
                        <span className="text-[9px] font-bold truncate max-w-full">{opt.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1">
                  وصف القسم الفني
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  placeholder="وصف مختصر لمواصفات وتطبيقات هذا القسم..."
                />
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
                      <span>حفظ وتطبيق القسم</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E5E5] rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-[#111111] text-base">هل أنت متأكد من حذف القسم؟</h3>
              <p className="text-xs text-[#757575]">
                سيتم حذف قسم <span className="font-bold text-[#111111]">«{categoryToDelete.name}»</span> من Sanity والمتجر.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E5E5E5] text-xs font-bold text-[#757575] hover:text-[#111111] transition-colors"
              >
                تراجع
              </button>
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={confirmDeleteCategory}
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
