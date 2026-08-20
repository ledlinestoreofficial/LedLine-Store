'use client';

import React, { useState } from 'react';
import { OrderRecord, OrderStatus } from '../types';
import { updateOrderStatusAction, deleteOrderAction } from '../lib/actions';
import { formatPriceEn } from '../lib/num-utils';
import {
  X,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Package,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Clock,
  Truck,
  CheckCheck,
  XCircle,
} from 'lucide-react';

interface OrderDetailsModalProps {
  order: OrderRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChanged: () => void;
}

export function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onStatusChanged,
}: OrderDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  if (!isOpen || !order) return null;

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    setFeedback(null);
    try {
      const res = await updateOrderStatusAction(order.id, newStatus);
      if (res.success) {
        setFeedback({ type: 'success', text: res.message || 'تم تحديث حالة الطلب' });
        onStatusChanged();
      } else {
        setFeedback({ type: 'error', text: res.error || 'فشل تحديث الحالة' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'حدث خطأ أثناء التحديث' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsUpdating(true);
    try {
      const res = await deleteOrderAction(order.id);
      if (res.success) {
        onStatusChanged();
        onClose();
      } else {
        setFeedback({ type: 'error', text: res.error || 'فشل حذف الطلب' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'حدث خطأ أثناء الحذف' });
    } finally {
      setIsUpdating(false);
      setShowDeleteConfirm(false);
    }
  };

  const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('966') || cleanPhone.startsWith('967') ? cleanPhone : `966${cleanPhone}`}?text=${encodeURIComponent(
    `مرحباً ${order.customer.fullName}، نحن فريق خدمة عملاء LED LINE™ بشأن طلبكم رقم ${order.orderNumber}.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-[#E5E5E5] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-[#111111]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E5E5] bg-[#F9FAFB]">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-black text-[#111111] font-mono">
                {order.orderNumber}
              </h2>
              <span
                className={`px-3 py-0.5 rounded-full text-[11px] font-bold border ${
                  order.status === 'confirmed' || order.status === 'delivered'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : order.status === 'shipped' || order.status === 'processing'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : order.status === 'cancelled'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {order.status === 'pending' && 'قيد المراجعة'}
                {order.status === 'confirmed' && 'مؤكد'}
                {order.status === 'processing' && 'جاري التجهيز'}
                {order.status === 'shipped' && 'تم الشحن'}
                {order.status === 'delivered' && 'تم التوصيل'}
                {order.status === 'cancelled' && 'ملغي'}
              </span>
            </div>
            <p className="text-xs text-[#757575] mt-1 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <span>{new Date(order.createdAt).toLocaleString('ar-SA')}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#757575] hover:text-[#111111] hover:bg-[#EAEAEA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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

          {/* Quick Status Bar */}
          <div className="bg-[#F9FAFB] border border-[#E5E5E5] rounded-2xl p-4">
            <p className="text-xs font-bold text-[#111111] mb-2.5">تحديث حالة الطلب السريع:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                disabled={isUpdating}
                onClick={() => handleStatusChange('confirmed')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                  order.status === 'confirmed'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white hover:bg-emerald-50 text-emerald-700 border-[#E5E5E5] hover:border-emerald-200'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" /> تأكيد الطلب
              </button>

              <button
                disabled={isUpdating}
                onClick={() => handleStatusChange('processing')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                  order.status === 'processing'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white hover:bg-blue-50 text-blue-700 border-[#E5E5E5] hover:border-blue-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> قيد التجهيز
              </button>

              <button
                disabled={isUpdating}
                onClick={() => handleStatusChange('shipped')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                  order.status === 'shipped'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-white hover:bg-purple-50 text-purple-700 border-[#E5E5E5] hover:border-purple-200'
                }`}
              >
                <Truck className="w-3.5 h-3.5" /> تم الشحن
              </button>

              <button
                disabled={isUpdating}
                onClick={() => handleStatusChange('cancelled')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                  order.status === 'cancelled'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white hover:bg-rose-50 text-rose-700 border-[#E5E5E5] hover:border-rose-200'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" /> إلغاء الطلب
              </button>
            </div>
          </div>

          {/* Customer Info Card */}
          <div className="bg-[#F9FAFB] border border-[#E5E5E5] rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#111111]">بيانات العميل والشحن</h3>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-colors shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> مراسلة واتساب
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[#757575] font-medium">اسم العميل:</span>
                <p className="font-bold text-[#111111]">{order.customer.fullName}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[#757575] font-medium">رقم الهاتف:</span>
                <p className="font-mono font-bold text-[#111111] flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#757575]" />
                  {order.customer.phone}
                </p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-[#757575] font-medium">العنوان والمدينة:</span>
                <p className="text-[#111111] font-medium flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                  <span>
                    {order.customer.city} - {order.customer.address}
                  </span>
                </p>
              </div>

              {order.customer.notes && (
                <div className="space-y-1 sm:col-span-2 bg-white p-3 rounded-xl border border-[#E5E5E5]">
                  <span className="text-[#757575] text-[11px] font-bold">ملاحظات العميل:</span>
                  <p className="text-[#111111] text-xs font-medium mt-0.5">{order.customer.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Ordered Products Items List */}
          <div className="bg-[#F9FAFB] border border-[#E5E5E5] rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
              <Package className="w-4 h-4 text-[#111111]" />
              المنتجات المطلوبة ({order.items.length})
            </h3>

            <div className="divide-y divide-[#E5E5E5]">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-[#111111]">{item.name}</p>
                    <p className="text-[11px] text-[#757575] font-mono">SKU: {item.sku}</p>
                    {(item.selectedColorTemp || item.selectedFinish) && (
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#757575] font-medium">
                        {item.selectedColorTemp && <span>حرارة الضوء: {item.selectedColorTemp}</span>}
                        {item.selectedFinish && <span>اللون/التشطيب: {item.selectedFinish}</span>}
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <span className="text-[#757575] font-mono" dir="ltr">
                      {item.quantity} × {formatPriceEn(item.price)} SAR
                    </span>
                    <p className="font-black text-[#111111] font-mono text-sm" dir="ltr">
                      {formatPriceEn(item.itemTotal)} SAR
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-[#F9FAFB] border border-[#E5E5E5] rounded-2xl p-5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-[#757575] font-medium">
              <span>المجموع الفرعي:</span>
              <span className="font-mono text-[#111111] font-bold" dir="ltr">
                {formatPriceEn(order.summary.subtotal)} SAR
              </span>
            </div>
            {order.summary.discountAmount > 0 && (
              <div className="flex items-center justify-between text-emerald-700 font-medium">
                <span>خصم الكوبون ({order.summary.appliedCoupon || 'عرض'}):</span>
                <span className="font-mono font-bold" dir="ltr">
                  - {formatPriceEn(order.summary.discountAmount)} SAR
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-[#757575] font-medium">
              <span>رسوم الشحن والتوصيل:</span>
              <span className="font-mono text-[#111111] font-bold" dir="ltr">
                {order.summary.shippingFee === 0
                  ? 'مجاني'
                  : `${formatPriceEn(order.summary.shippingFee)} SAR`}
              </span>
            </div>
            <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between font-bold text-sm">
              <span className="text-[#111111] font-black">الإجمالي النهائي:</span>
              <span className="font-mono font-black text-base text-[#111111]" dir="ltr">
                {formatPriceEn(order.summary.finalTotal)} SAR
              </span>
            </div>

            <div className="pt-2 flex flex-col gap-2 text-[#757575] text-[11px]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-[#9CA3AF]" />
                <span>طريقة الدفع: </span>
                <span className="font-bold text-[#111111]">
                  {order.paymentMethod === 'mada' && 'مدى (Mada)'}
                  {order.paymentMethod === 'applepay' && 'Apple Pay'}
                  {order.paymentMethod === 'tamara' && 'تمارا (تقسيط على 4 دفعات)'}
                  {order.paymentMethod === 'cod' && 'الدفع عند الاستلام'}
                  {order.paymentMethod === 'bank_transfer' && `تحويل بنكي / محفظة ${order.selectedBankName ? `(${order.selectedBankName})` : ''}`}
                </span>
              </div>

              {/* Deposit Receipt Image Preview (سند الإيداع) */}
              {order.depositReceiptUrl && (
                <div className="mt-2 p-3 bg-white border border-[#E5E5E5] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#111111] text-xs">سند / إشعار الإيداع المرفق:</span>
                    <a
                      href={order.depositReceiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#D97706] hover:underline font-bold"
                    >
                      فتح الصورة بالحجم الكامل ↗
                    </a>
                  </div>
                  <div className="w-full max-h-56 rounded-lg overflow-hidden bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center">
                    <img
                      src={order.depositReceiptUrl}
                      alt="سند الإيداع"
                      className="max-h-56 w-auto object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Delete action */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E5E5] bg-[#F9FAFB]">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-600 font-bold">تأكيد حذف الطلب؟</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isUpdating}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'جاري الحذف...' : 'نعم، احذف'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-xl bg-[#E5E5E5] hover:bg-[#D5D5D5] text-[#111111] text-xs font-bold transition-colors"
              >
                إلغاء
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isUpdating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف الطلب نهائياً</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#111111] hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
