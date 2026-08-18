'use client';

import React, { useState } from 'react';
import { CouponCode } from '../../types';
import { saveCouponAction, deleteCouponAction } from '../../lib/actions';
import { toEnglishDigits, parseNumericEnglish } from '../../lib/num-utils';
import { Tag, Plus, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface CouponsClientProps {
  initialCoupons: CouponCode[];
}

export function CouponsClient({ initialCoupons }: CouponsClientProps) {
  const [coupons, setCoupons] = useState<CouponCode[]>(initialCoupons);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValStr, setDiscountValStr] = useState('10');
  const [minOrderStr, setMinOrderStr] = useState('100');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [couponToDelete, setCouponToDelete] = useState<{ id: string; code: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValStr('10');
    setMinOrderStr('100');
    setFeedback(null);
    setIsModalOpen(true);
  };

  const handleCodeChange = (val: string) => {
    setCode(toEnglishDigits(val).toUpperCase());
  };

  const handleDiscountValChange = (val: string) => {
    setDiscountValStr(toEnglishDigits(val).replace(/[^0-9.]/g, ''));
  };

  const handleMinOrderChange = (val: string) => {
    setMinOrderStr(toEnglishDigits(val).replace(/[^0-9.]/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const val = parseNumericEnglish(discountValStr, 10);
    const minAmount = parseNumericEnglish(minOrderStr, 100);

    try {
      const res = await saveCouponAction({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: val,
        minOrderAmount: minAmount,
        isActive: true,
      });

      if (res.success) {
        setFeedback({ type: 'success', text: 'تم إنشاء كود الخصم بنجاح' });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setFeedback({ type: 'error', text: res.error || 'فشل حفظ الكوبون' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'حدث خطأ غير متوقع' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (couponId: string, couponCode: string) => {
    setCouponToDelete({ id: couponId, code: couponCode });
  };

  const confirmDeleteCoupon = async () => {
    if (!couponToDelete) return;
    const { id: couponId } = couponToDelete;
    setDeletingId(couponId);
    try {
      const res = await deleteCouponAction(couponId);
      if (res.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== couponId));
        setCouponToDelete(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E5E5] p-5 sm:p-6 rounded-3xl shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[#111111] flex items-center gap-2 font-display">
            <Tag className="w-5 h-5 text-[#111111]" />
            كوبونات وأكواد الخصم الترويجية ({coupons.length})
          </h2>
          <p className="text-xs text-[#757575] mt-1 font-medium">
            إنشاء وإدارة حملات التخفيضات والكوبونات المطبقة عند الدفع (بأرقام إنجليزية 0-9)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#111111] hover:bg-black text-white font-bold text-xs transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء كود خصم</span>
        </button>
      </div>

      {/* Coupons List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-white border border-[#E5E5E5] rounded-3xl p-5 hover:border-[#111111] transition-all flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="px-3.5 py-1.5 rounded-xl bg-[#F9FAFB] border border-[#E5E5E5] text-[#111111] font-mono font-black text-sm tracking-wider" dir="ltr">
                  {coupon.code}
                </span>

                <button
                  onClick={() => handleDelete(coupon.id, coupon.code)}
                  className="p-1.5 rounded-lg text-[#757575] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="حذف الكوبون"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-1">
                <p className="text-xl font-black text-[#111111] font-mono">
                  {coupon.discountType === 'percentage'
                    ? `${coupon.discountValue}% OFF`
                    : `${coupon.discountValue} SAR OFF`}
                </p>
                <p className="text-xs text-[#757575] font-medium font-mono">
                  الحد الأدنى للطلب: {coupon.minOrderAmount || 0} SAR
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
              <span className="text-[#757575] font-medium">مرات الاستخدام:</span>
              <span className="font-bold text-[#111111] font-mono">{coupon.usageCount || 0}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E5E5] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-[#111111]">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
              <h3 className="font-black text-[#111111] text-base font-display">إنشاء كود خصم جديد</h3>
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
                  كود الخصم (Coupon Code) *
                </label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="RAMADAN20"
                  className="w-full bg-[#F9FAFB] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1.5">نوع الخصم</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full bg-[#F9FAFB] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all shadow-xs font-medium"
                  >
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت (SAR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1.5">قيمة الخصم</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    dir="ltr"
                    required
                    value={discountValStr}
                    onChange={(e) => handleDiscountValChange(e.target.value)}
                    className="w-full bg-[#F9FAFB] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] font-mono font-bold focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all shadow-xs"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1.5">
                  الحد الأدنى للطلب (ر.س)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  dir="ltr"
                  value={minOrderStr}
                  onChange={(e) => handleMinOrderChange(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] font-mono font-bold focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all shadow-xs"
                  placeholder="100"
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
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ الكوبون'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {couponToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E5E5] shadow-2xl space-y-4 text-right">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[#111111]">تأكيد حذف كود الخصم</h3>
            </div>
            <p className="text-xs text-[#757575] leading-relaxed">
              هل أنت متأكد من حذف كود الخصم <span className="font-bold font-mono text-[#111111]">"{couponToDelete.code}"</span>؟
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCouponToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#111111] text-xs font-bold transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmDeleteCoupon}
                disabled={deletingId !== null}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {deletingId !== null ? 'جاري الحذف...' : 'نعم، احذف الكوبون'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
