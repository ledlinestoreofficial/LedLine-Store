"use client";

import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Tag } from 'lucide-react';
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
  onOpenProduct?: (productId: string) => void;
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
  onOpenProduct,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const finalTotal = Math.max(0, subtotal - discountAmount);

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
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden animate-fadeIn">
      {/* Top Header Bar */}
      <div className="w-full bg-white border-b border-[#E5E5E5] px-4 sm:px-8 lg:px-12 py-4 sm:py-5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-[#F5F5F5] text-[#111111] transition-colors cursor-pointer flex items-center gap-1.5"
            aria-label="متابعة التسوق"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-bold">متابعة التسوق</span>
          </button>
          
          <div className="h-5 w-px bg-[#E5E5E5] hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight">
              السلة
            </h1>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-full hover:bg-[#F5F5F5] text-[#111111] transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Full-Screen Content Area */}
      <div className="flex-1 overflow-y-auto bg-[#F9FAFB] p-4 sm:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {cartItems.length === 0 ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4 py-12 sm:py-16">
              <div className="w-20 h-20 rounded-full bg-[#EAEAEA] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-10 h-10 text-[#A3A3A3]" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="font-black text-xl sm:text-2xl text-[#111111]">
                  حقيبة التسوق فارغة حالياً
                </h3>
                <p className="text-sm text-[#757575] leading-relaxed">
                  تصفح تشكيلاتنا واضف ما تريده إلى السلة لتجهيز طلبك
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-4 bg-[#111111] text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-[#2A2A2A] transition-all shadow-md active:scale-95 cursor-pointer"
              >
                تصفح المنتجات الآن
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Right Column: Items List (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E5E5E5] hover:border-[#111111] transition-all shadow-2xs flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-start sm:items-center group"
                  >
                    {/* Clickable Product Info & Thumbnail */}
                    <div
                      onClick={() => onOpenProduct && onOpenProduct(item.productId)}
                      className={`flex items-center gap-4 flex-1 ${onOpenProduct ? 'cursor-pointer' : ''}`}
                      title={onOpenProduct ? 'عرض تفاصيل المنتج' : undefined}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-[#F5F5F5] shrink-0 group-hover:opacity-90 transition-opacity"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm sm:text-base text-[#111111] leading-snug group-hover:text-black transition-colors underline-offset-2 group-hover:underline">
                          {item.name}
                        </h3>
                        {item.sku && (
                          <span className="text-[11px] text-[#757575] block">
                            SKU: {item.sku}
                          </span>
                        )}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.selectedColorTemp && (
                            <span className="bg-[#F5F5F5] text-[#111111] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#E5E5E5]">
                              {item.selectedColorTemp}
                            </span>
                          )}
                          {item.selectedFinish && (
                            <span className="bg-[#F5F5F5] text-[#111111] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#E5E5E5]">
                              {item.selectedFinish}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Price & Delete */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E5E5E5]">
                      {/* Quantity Counter */}
                      <div className="flex items-center bg-[#F5F5F5] rounded-full border border-[#E5E5E5] px-3 py-1">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center font-bold text-sm text-[#111111] hover:bg-white rounded-full transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-xs sm:text-sm">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center font-bold text-sm text-[#111111] hover:bg-white rounded-full transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-left">
                        <span className="text-base sm:text-lg font-black text-[#111111] block">
                          {item.price * item.quantity} <span className="text-xs font-normal">ر.س</span>
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-2 text-[#757575] hover:text-[#D33918] hover:bg-[#FFF2F0] rounded-full transition-colors cursor-pointer"
                        title="حذف من السلة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Left Column: Order Summary (5 Cols) */}
              <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-5">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E5E5] shadow-xs space-y-6">
                  <h2 className="text-lg font-black text-[#111111] tracking-tight pb-3 border-b border-[#E5E5E5]">
                    ملخص الطلب والفاتورة
                  </h2>

                  {/* Coupon Form */}
                  <div>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-[#F0FDF4] p-3 rounded-2xl border border-[#12805C] text-xs">
                        <div className="flex items-center gap-2 text-[#12805C] font-bold">
                          <Tag className="w-4 h-4" />
                          <span>تم تطبيق الكوبون بنجاح ({appliedCoupon})</span>
                        </div>
                        <button
                          onClick={onRemoveCoupon}
                          className="text-xs text-[#757575] hover:text-[#D33918] font-bold cursor-pointer underline"
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
                          className="flex-1 bg-[#F5F5F5] border border-[#E5E5E5] rounded-full px-4 py-2.5 text-xs font-bold text-[#111111] outline-none focus:border-[#111111] focus:bg-white transition-colors"
                        />
                        <button
                          type="submit"
                          className="bg-[#111111] hover:bg-[#2A2A2A] text-white px-5 py-2.5 rounded-full font-bold text-xs transition-colors cursor-pointer"
                        >
                          تطبيق
                        </button>
                      </form>
                    )}
                    {couponError && <p className="text-[11px] text-[#D33918] mt-1.5 font-semibold">{couponError}</p>}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="space-y-3 text-xs sm:text-sm text-[#757575]">
                    <div className="flex justify-between">
                      <span>المجموع الفرعي للمنتجات</span>
                      <span className="text-[#111111] font-bold">{subtotal} ر.س</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-[#12805C] font-bold">
                        <span>خصم الكوبون</span>
                        <span>-{discountAmount} ر.س</span>
                      </div>
                    )}

                    <div className="flex justify-between text-base sm:text-lg font-black text-[#111111] pt-3 border-t border-[#E5E5E5]">
                      <span>الإجمالي المبدئي</span>
                      <span>{finalTotal} ر.س</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={onProceedToCheckout}
                    className="w-full py-4 bg-[#111111] hover:bg-[#2A2A2A] text-white rounded-full font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all active:scale-98 shadow-md cursor-pointer"
                  >
                    <span>متابعة إتمام الطلب والشحن</span>
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
