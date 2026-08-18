"use client";

import React, { useState } from 'react';
import { X, CheckCircle2, CreditCard, Truck, ShieldCheck, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  finalTotal: number;
  appliedCoupon?: string | null;
  onOrderSuccess: () => void;
  lang?: 'ar' | 'en';
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  discountAmount,
  shippingFee,
  finalTotal,
  appliedCoupon,
  onOrderSuccess,
}) => {
  const [step, setStep] = useState<'details' | 'success'>('details');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('الرياض');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mada' | 'applepay' | 'tamara' | 'cod'>('mada');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [serverTotal, setServerTotal] = useState(finalTotal);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setErrorMessage('يرجى تعبئة كافة الحقول الإلزامية');
      return;
    }

    setIsProcessing(true);

    try {
      const payload = {
        customer: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          city: city.trim(),
          address: address.trim(),
        },
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedColorTemp: item.selectedColorTemp,
          selectedFinish: item.selectedFinish,
          selectedLength: item.selectedLength,
          selectedDimensions: item.selectedDimensions,
          sku: item.sku,
        })),
        paymentMethod,
        couponCode: appliedCoupon || undefined,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || 'تعذر إتمام الطلب، يرجى المحاولة لاحقاً');
        setIsProcessing(false);
        return;
      }

      const confirmedOrderNo = data.orderDetails?.orderNumber || data.orderNumber || `LL-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderNumber(confirmedOrderNo);
      if (data.orderDetails?.total !== undefined) {
        setServerTotal(data.orderDetails.total);
      }
      setStep('success');

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Safe fallback if canvas not available
      }
    } catch (error) {
      setErrorMessage('حدث خطأ في الاتصال بالخادم، يرجى المحاولة لاحقاً');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    onOrderSuccess();
    onClose();
    setStep('details');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-[#E5E5E5] my-6">
        {step === 'details' ? (
          <div>
            {/* Header */}
            <div className="bg-[#111111] text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black tracking-tight">
                  الدفع وإتمام الطلب الآمن
                </h3>
                <p className="text-xs text-[#E5E5E5] mt-0.5">
                  تأكيد العنوان وطريقة الدفع المعتمدة
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-6">
              {errorMessage && (
                <div className="bg-[#D33918]/10 border border-[#D33918]/30 rounded-2xl p-4 text-xs font-bold text-[#D33918] flex items-center justify-between">
                  <span>{errorMessage}</span>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="p-1 hover:bg-[#D33918]/20 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Shipping Address Inputs */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#757575] flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#111111]" />
                  <span>بيانات الشحن والتوصيل</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#111111]">الاسم الكامل *</label>
                    <input
                      required
                      type="text"
                      placeholder="مثال: محمد السعيد"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-xs text-[#111111] outline-none focus:border-[#111111]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#111111]">رقم الجوال *</label>
                    <input
                      required
                      type="tel"
                      placeholder="05XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-xs text-[#111111] outline-none focus:border-[#111111] font-mono text-right"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#111111]">المدينة</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-xs font-bold text-[#111111] outline-none focus:border-[#111111]"
                    >
                      <option value="الرياض">الرياض</option>
                      <option value="جدة">جدة</option>
                      <option value="الدمام والخبر">الدمام والخبر</option>
                      <option value="مكة المكرمة">مكة المكرمة</option>
                      <option value="المدينة المنورة">المدينة المنورة</option>
                      <option value="القصيم">القصيم / بريدة</option>
                      <option value="أبها وخميس مشيط">أبها وخميس مشيط</option>
                      <option value="مدينة أخرى">مدينة أخرى</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#111111]">الحي واسم الشارع *</label>
                    <input
                      required
                      type="text"
                      placeholder="حي النرجس، شارع أنس بن مالك"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-xs text-[#111111] outline-none focus:border-[#111111]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#757575] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#111111]" />
                  <span>طريقة الدفع</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'mada', name: 'مدى / فيزا', sub: 'دفع مباشر آمن' },
                    { id: 'applepay', name: 'Apple Pay', sub: 'بلمسة واحدة' },
                    { id: 'tamara', name: 'تمارا / تابي', sub: 'قسمها على 4 دفعات' },
                    { id: 'cod', name: 'الدفع عند الاستلام', sub: 'رسوم رمزية' }
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                        paymentMethod === method.id
                          ? 'border-[#111111] ring-2 ring-[#111111] bg-[#F5F5F5]'
                          : 'border-[#E5E5E5] bg-white hover:bg-[#F5F5F5]'
                      }`}
                    >
                      <span className="text-xs font-bold text-[#111111]">{method.name}</span>
                      <span className="text-[10px] text-[#757575]">{method.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Summary Line */}
              <div className="bg-[#F5F5F5] p-4 rounded-2xl border border-[#E5E5E5] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#757575]">إجمالي الطلب مع الضريبة والشحن:</span>
                  <p className="text-lg font-black text-[#111111] font-mono mt-0.5">
                    {finalTotal} ر.س
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[#12805C] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>دفع آمن ومشفر 256-bit</span>
                  </span>
                  <span className="text-[10px] text-[#757575] block mt-0.5 font-mono">
                    {cartItems.reduce((a, b) => a + b.quantity, 0)} منتجات في السلة
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-[#111111] hover:bg-[#2A2A2A] text-white rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xl disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>جاري معالجة الطلب بأمان...</span>
                ) : (
                  <>
                    <span>تأكيد ودفع {finalTotal} ر.س</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Success Screen */
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-[#12805C]/10 text-[#12805C] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#12805C] uppercase tracking-wider">
                تم استلام طلبك بنجاح!
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                شكراً لثقتكم في متجر LED LINE
              </h3>
              <p className="text-xs sm:text-sm text-[#757575] max-w-md mx-auto">
                تم إنشاء طلبكم برقم #{orderNumber}. سيتم تجهيز المنتجات وشحنها إلى {city} خلال 24-48 ساعة.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-[#F5F5F5] p-5 rounded-2xl border border-[#E5E5E5] text-right space-y-3 text-xs max-w-md mx-auto">
              <div className="flex justify-between border-b border-[#E5E5E5] pb-2 font-bold">
                <span>رقم الفاتورة الإلكترونية:</span>
                <span className="font-mono">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>العميل المستلم:</span>
                <span className="font-bold">{fullName} ({phone})</span>
              </div>
              <div className="flex justify-between">
                <span>عنوان التوصيل:</span>
                <span>{city} - {address}</span>
              </div>
              <div className="flex justify-between border-t border-[#E5E5E5] pt-2 font-black text-sm text-[#111111]">
                <span>المبلغ الإجمالي المدفوع:</span>
                <span className="font-mono">{serverTotal} ر.س</span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="bg-[#111111] hover:bg-[#2A2A2A] text-white px-8 py-3.5 rounded-full font-bold text-sm transition-all"
            >
              العودة للمتجر ومتابعة التسوق
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
