'use client';

import React, { useState } from 'react';
import { CategoryData, Product } from '../../types';
import { saveCategoryAction, deleteCategoryAction } from '../../lib/actions';
import { Layers, Plus, Edit2, Trash2, X, Save, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface CategoriesClientProps {
  initialCategories: CategoryData[];
  products: Product[];
}

export function CategoriesClient({ initialCategories, products }: CategoriesClientProps) {
  const [categories, setCategories] = useState<CategoryData[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);

  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Sparkles');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setNameEn('');
    setDescription('');
    setIcon('Sparkles');
    setFeedback(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryData) => {
    setEditingCategory(cat);
    setName(cat.name);
    setNameEn(cat.nameEn || '');
    setDescription(cat.description || '');
    setIcon(cat.icon || 'Sparkles');
    setFeedback(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const payload: Partial<CategoryData> = {
      id: editingCategory?.id,
      name,
      nameEn,
      description,
      icon,
    };

    try {
      const res = await saveCategoryAction(payload);
      if (res.success) {
        setFeedback({ type: 'success', text: 'تم حفظ القسم بنجاح في Sanity' });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setFeedback({ type: 'error', text: res.error || 'حدث خطأ أثناء الحفظ' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'خطأ غير معروف' });
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
            أقسام المتجر والتصنيفات ({categories.length})
          </h2>
          <p className="text-xs text-[#757575] mt-1 font-medium">
            هيكلة أقسام إنارة الليد المعمارية وألواح أخشاب الجدران المودرن
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#111111] hover:bg-black text-white font-bold text-xs transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة قسم جديد</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const productCount = products.filter((p) => p.category === category.id).length;
          return (
            <div
              key={category.id}
              className="bg-white border border-[#E5E5E5] rounded-3xl p-5 hover:border-[#111111] transition-all flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-2xl bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(category)}
                      className="p-1.5 rounded-lg text-[#757575] hover:text-[#111111] hover:bg-[#F5F5F5] transition-colors"
                      title="تعديل القسم"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="p-1.5 rounded-lg text-[#757575] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="حذف القسم"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-bold text-[#111111] text-base">{category.name}</h3>
                  <p className="text-[#757575] text-xs font-mono mt-0.5 font-medium">{category.nameEn}</p>
                  {category.description && (
                    <p className="text-[#757575] text-xs mt-2 line-clamp-2 font-medium">{category.description}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
                <span className="text-[#757575] font-medium">عدد المنتجات المرتبطة:</span>
                <span className="font-black text-[#111111] font-mono">{productCount} منتج</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E5E5] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
              <h3 className="font-black text-[#111111] text-base font-display">
                {editingCategory ? 'تعديل القسم' : 'إضافة قسم جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full text-[#757575] hover:text-[#111111] hover:bg-[#F5F5F5] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 font-medium ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1.5">
                  اسم القسم (بالعربية) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1.5">
                  Category Name (English)
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all shadow-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1.5">الوصف</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl p-3 text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all shadow-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#757575] hover:text-[#111111] hover:bg-[#F5F5F5] transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ القسم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E5E5] shadow-2xl space-y-4 text-right">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[#111111]">تأكيد حذف القسم</h3>
            </div>
            <p className="text-xs text-[#757575] leading-relaxed">
              هل أنت متأكد من رغبتك في حذف القسم <span className="font-bold text-[#111111]">"{categoryToDelete.name}"</span>؟
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#111111] text-xs font-bold transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmDeleteCategory}
                disabled={deletingId !== null}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {deletingId !== null ? 'جاري الحذف...' : 'نعم، احذف القسم'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
