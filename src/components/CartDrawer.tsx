"use client";

import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowLeft, Tag, Truck } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
  appliedCoupon: string | null;
  onApplyCoupon: (code: string) => boolean;
  onRemoveCoupon: () => void;
  discountAmount: number;
  lang?: 'ar' | 'en';
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  discountAmount,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const freeShippingThreshold = 350;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const shippingFee = subtotal >= freeShippingThreshold || cartItems.length === 0 ? 0 : 35;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const success = onApplyCoupon(couponInput.trim());
    if (!success) {
      setCouponError('كوبون الخصم غير صالح أو منتهي الصلاحية');
    } else {
      setCouponError('');
      setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-[#E5E5E5] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#111111]" />
              <h2 className="text-lg font-black tracking-tight text-[#111111]">
                حقيبة التسوق
              </h2>
              <span className="text-xs font-mono font-bold bg-[#F5F5F5] px-2 py-0.5 rounded-full text-[#757575]">
                {cartItems.reduce((a, b) => a + b.quantity, 0)}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#F5F5F5] text-[#111111] transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-[#F5F5F5] px-6 py-3 border-b border-[#E5E5E5] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#111111]">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#111111]" />
                <span>
                  {subtotal >= freeShippingThreshold
                    ? 'تهانينا! حصلت على شحن مجاني لكافة مدن المملكة'
                    : `أضف ${freeShippingThreshold - subtotal} ر.س إضافية للحصول على شحن مجاني`}
                </span>
              </div>
              <span className="font-mono text-[11px]">{Math.round(progressToFreeShipping)}%</span>
            </div>

            <div className="w-full h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#111111] transition-all duration-500 rounded-full"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-6 text-[#757575]">
                <ShoppingBag className="w-16 h-16 stroke-1 text-[#D1D1D1]" />
                <p className="font-bold text-base text-[#111111]">
                  حقيبة التسوق فارغة حالياً
                </p>
                <p className="text-xs text-[#757575]">
                  تصفح أحدث أشرطة الـ LED وألواح الخشب المعمارية وأضفها لطلبك.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 bg-[#111111] text-white px-6 py-2.5 rounded-full font-bold text-xs hover:bg-[#2A2A2A] transition-colors"
                >
                  ابدأ التسوق الآن
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3.5 bg-[#F5F5F5] rounded-2xl border border-[#E5E5E5] relative"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover bg-white flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-xs text-[#111111] leading-snug line-clamp-2">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-[#757575] hover:text-[#D33918] transition-colors p-1"
                          aria-label="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Item Specifications */}
                      <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-[#757575] font-semibold">
                        {item.selectedColorTemp && (
                          <span className="bg-white px-2 py-0.5 rounded border border-[#E5E5E5]">
                            {item.selectedColorTemp}
                          </span>
                        )}
                        {item.selectedFinish && (
                          <span className="bg-white px-2 py-0.5 rounded border border-[#E5E5E5]">
                            {item.selectedFinish}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E5E5E5]">
                      {/* Quantity Selector */}
                      <div className="flex items-center bg-white rounded-full border border-[#E5E5E5] px-2 py-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center font-bold text-xs text-[#111111]"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold font-mono text-xs">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center font-bold text-xs text-[#111111]"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-black text-xs sm:text-sm font-mono text-[#111111]">
                        {item.price * item.quantity} ر.س
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Area: Coupon + Totals + Checkout Button */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-[#F5F5F5] border-t border-[#E5E5E5] space-y-4">
              {/* Promo Code Input */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-[#12805C] text-xs">
                    <div className="flex items-center gap-1.5 text-[#12805C] font-bold">
                      <Tag className="w-4 h-4" />
                      <span>تم تطبيق الكوبون ({appliedCoupon})</span>
                    </div>
                    <button
                      onClick={onRemoveCoupon}
                      className="text-xs text-[#757575] hover:text-[#D33918] font-bold"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="كود الخصم (جرب LED10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 bg-white border border-[#E5E5E5] rounded-full px-4 py-2 text-xs uppercase font-mono font-bold text-[#111111] outline-none focus:border-[#111111]"
                    />
                    <button
                      type="submit"
                      className="bg-[#111111] hover:bg-[#2A2A2A] text-white px-4 py-2 rounded-full font-bold text-xs transition-colors"
                    >
                      تطبيق
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-[#D33918] mt-1 font-semibold">{couponError}</p>}
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-1.5 text-xs text-[#757575]">
                <div className="flex justify-between">
                  <span>المجموع الفرعي</span>
                  <span className="font-mono text-[#111111] font-bold">{subtotal} ر.س</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#12805C] font-bold">
                    <span>خصم الكوبون</span>
                    <span className="font-mono">-{discountAmount} ر.س</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>رسوم الشحن</span>
                  <span className="font-mono text-[#111111]">
                    {shippingFee === 0 ? (
                      <span className="text-[#12805C] font-bold">مجاني</span>
                    ) : (
                      `${shippingFee} ر.س`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#111111] pt-2 border-t border-[#E5E5E5]">
                  <span>الإجمالي النهائي (شامل الضريبة)</span>
                  <span className="font-mono text-base">{finalTotal} ر.س</span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                onClick={onProceedToCheckout}
                className="w-full py-4 bg-[#111111] hover:bg-[#2A2A2A] text-white rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-98 shadow-lg"
              >
                <span>إتمام الطلب والشراء</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
