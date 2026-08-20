'use client';

import React, { useState } from 'react';
import { OrderRecord, OrderStatus } from '../../types';
import { OrderDetailsModal } from '../../components/OrderDetailsModal';
import { updateOrderStatusAction } from '../../lib/actions';
import { formatPriceEn } from '../../lib/num-utils';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  CheckCheck,
  Clock,
  Truck,
  XCircle,
  MessageCircle,
} from 'lucide-react';

interface OrdersClientProps {
  initialOrders: OrderRecord[];
}

export function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.phone?.includes(searchQuery) ||
      order.customer?.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenDetails = (order: OrderRecord) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleQuickStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    setErrorMessage(null);
    try {
      const res = await updateOrderStatusAction(orderId, newStatus);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        setErrorMessage(res.error || 'تعذر تحديث الحالة');
      }
    } catch {
      setErrorMessage('تعذر تحديث الحالة');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E5E5] p-5 sm:p-6 rounded-3xl shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[#111111] flex items-center gap-2 font-display">
            <ShoppingBag className="w-5 h-5 text-[#111111]" />
            سجل الطلبات والمبيعات ({filteredOrders.length})
          </h2>
          <p className="text-xs text-[#757575] mt-1 font-medium">
            متابعة فورية ومباشرة لمعاملات الشراء والتوصيل عبر Sanity
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-between">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-800">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-[#757575]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برقم الطلب، اسم العميل، الهاتف، أو المدينة..."
            className="w-full bg-white border border-[#E5E5E5] rounded-xl pr-10 pl-4 py-2.5 text-xs text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all shadow-xs"
          />
        </div>

        <div className="relative">
          <Filter className="w-4 h-4 absolute right-3.5 top-3.5 text-[#757575]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white border border-[#E5E5E5] rounded-xl pr-10 pl-4 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all shadow-xs font-medium"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">قيد المراجعة (Pending)</option>
            <option value="confirmed">مؤكد (Confirmed)</option>
            <option value="processing">جاري التجهيز (Processing)</option>
            <option value="shipped">تم الشحن (Shipped)</option>
            <option value="delivered">تم التوصيل (Delivered)</option>
            <option value="cancelled">ملغي (Cancelled)</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-xs">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-[#757575] text-xs space-y-2">
            <ShoppingBag className="w-8 h-8 text-[#D1D5DB] mx-auto" />
            <p className="font-medium">لا توجد طلبات مطابقة للمعايير المحددة.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#F9FAFB] text-[#757575] uppercase tracking-wider font-bold border-b border-[#E5E5E5]">
                <tr>
                  <th className="px-5 py-4">رقم الطلب</th>
                  <th className="px-5 py-4">العميل والموقع</th>
                  <th className="px-5 py-4">المنتجات</th>
                  <th className="px-5 py-4">الإجمالي والدفع</th>
                  <th className="px-5 py-4">حالة الطلب</th>
                  <th className="px-5 py-4">التاريخ</th>
                  <th className="px-5 py-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-[#111111]">
                {filteredOrders.map((order) => {
                  const cleanPhone = order.customer?.phone?.replace(/[^0-9]/g, '') || '';
                  const whatsappUrl = `https://wa.me/${
                    cleanPhone.startsWith('966') || cleanPhone.startsWith('967')
                      ? cleanPhone
                      : `966${cleanPhone}`
                  }?text=${encodeURIComponent(
                    `مرحباً ${order.customer?.fullName}، نتواصل معكم بخصوص طلبكم رقم ${order.orderNumber} من LED LINE™.`
                  )}`;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#F9FAFB] transition-colors duration-150"
                    >
                      {/* Order Number */}
                      <td className="px-5 py-4 font-mono font-black text-[#111111]">
                        <button
                          onClick={() => handleOpenDetails(order)}
                          className="hover:text-[#D97706] transition-colors"
                        >
                          {order.orderNumber}
                        </button>
                      </td>

                      {/* Customer Info */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-bold text-[#111111]">{order.customer?.fullName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[#757575] text-[11px] font-mono">
                              {order.customer?.phone}
                            </span>
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 p-0.5"
                              title="مراسلة واتساب"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <p className="text-[10px] text-[#9CA3AF]">{order.customer?.city}</p>
                        </div>
                      </td>

                      {/* Items Count */}
                      <td className="px-5 py-4">
                        <span className="font-bold text-[#4B5563]">
                          {order.items?.length || 0} عناصر
                        </span>
                      </td>

                      {/* Financial Total */}
                      <td className="px-5 py-4">
                        <p className="font-black text-[#111111] font-mono text-sm" dir="ltr">
                          {formatPriceEn(order.summary?.finalTotal)} SAR
                        </p>
                        <div className="flex flex-col gap-1 mt-0.5">
                          <span className="text-[10px] text-[#757575] font-bold">
                            {order.paymentMethod === 'cod'
                              ? 'الدفع عند الاستلام'
                              : (order.paymentMethod as string) === 'bank_transfer'
                              ? `تحويل بنكي ${order.selectedBankName ? `(${order.selectedBankName})` : ''}`
                              : order.paymentMethod}
                          </span>
                          {order.depositReceiptUrl && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-bold border border-amber-200/70 w-fit">
                              <span>سند مرفق 📎</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <select
                          disabled={updatingId === order.id}
                          value={order.status}
                          onChange={(e) =>
                            handleQuickStatus(order.id, e.target.value as OrderStatus)
                          }
                          className={`px-3 py-1 rounded-full text-xs font-bold border focus:outline-none transition-all shadow-xs ${
                            order.status === 'confirmed' || order.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : order.status === 'shipped' || order.status === 'processing'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : order.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <option value="pending">قيد المراجعة</option>
                          <option value="confirmed">مؤكد</option>
                          <option value="processing">جاري التجهيز</option>
                          <option value="shipped">تم الشحن</option>
                          <option value="delivered">تم التوصيل</option>
                          <option value="cancelled">ملغي</option>
                        </select>
                      </td>

                      {/* Created At Date */}
                      <td className="px-5 py-4 text-[#757575] text-[11px] font-medium">
                        {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleOpenDetails(order)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F5F5F5] hover:bg-[#EAEAEA] border border-[#E5E5E5] text-[#111111] text-xs font-bold transition-all shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {isModalOpen && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStatusChanged={() => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
