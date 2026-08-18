import React from 'react';
import { adminGetProducts, adminGetOrders, adminGetCategories } from '../lib/sanity.server';
import { StatCard } from '../components/StatCard';
import { formatPriceEn } from '../lib/num-utils';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Layers,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Phone,
} from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0; // Dynamic server rendering for live Admin view

export default async function AdminDashboardPage() {
  const [products, orders, categories] = await Promise.all([
    adminGetProducts(),
    adminGetOrders(),
    adminGetCategories(),
  ]);

  // Financial Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.summary?.finalTotal || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const confirmedOrders = orders.filter((o) => o.status === 'confirmed' || o.status === 'processing');
  const outOfStockProducts = products.filter((p) => p.inStock === false || (p.stockCount !== undefined && p.stockCount <= 0));
  const recentOrders = orders.slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111111] text-white text-xs font-bold mb-3 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
            لوحة الإدارة المتصلة بـ Sanity • BFF Realtime
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight font-display">
            مرحباً بك في لوحة تحكم LED LINE™
          </h2>
          <p className="text-xs sm:text-sm text-[#757575] mt-2 leading-relaxed font-medium">
            متابعة فورية للمبيعات، كتالوج منتجات الإضاءة المعمارية وأخشاب الجدران، وتحديث حالات الطلبات والمخزون مباشرة وبأمان تام عبر Next.js Server Actions.
          </p>
        </div>

        <div className="absolute left-6 -bottom-10 w-48 h-48 bg-[#F59E0B]/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي المبيعات المحققة"
          value={`${formatPriceEn(totalRevenue)} SAR`}
          subtitle={`من واقع ${orders.length} طلب مسجل`}
          icon={DollarSign}
          color="amber"
          trend={orders.length > 0 ? { value: `${orders.length} طلب`, isPositive: true } : undefined}
        />
        <StatCard
          title="الطلبات المسجلة"
          value={orders.length}
          subtitle={`${pendingOrders.length} طلب بانتظار المراجعة`}
          icon={ShoppingBag}
          color="blue"
          trend={confirmedOrders.length > 0 ? { value: `${confirmedOrders.length} مؤكد وقيد التجهيز`, isPositive: true } : undefined}
        />
        <StatCard
          title="إجمالي المنتجات بالكتالوج"
          value={products.length}
          subtitle={`موزعة على ${categories.length} أقسام رئيسية`}
          icon={Package}
          color="emerald"
        />
        <StatCard
          title="تنبيهات المخزون"
          value={outOfStockProducts.length}
          subtitle={outOfStockProducts.length > 0 ? 'منتجات نفدت أو شرفت على النفاد' : 'المخزون مكتمل'}
          icon={AlertTriangle}
          color={outOfStockProducts.length > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 Columns) */}
        <div className="lg:col-span-2 bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
            <div>
              <h3 className="font-black text-[#111111] text-base sm:text-lg font-display">أحدث الطلبات المستلمة</h3>
              <p className="text-xs text-[#757575] font-medium">آخر المعاملات الواردة من متجر LED LINE</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#111111] hover:text-[#D97706] flex items-center gap-1 transition-colors"
            >
              عرض الكل <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-[#757575] text-xs font-medium">
              لا توجد طلبات مسجلة حالياً في قاعدة البيانات.
            </div>
          ) : (
            <div className="divide-y divide-[#E5E5E5] overflow-x-auto">
              {recentOrders.map((order) => (
                <div key={order.id} className="py-4 flex items-center justify-between gap-4 text-xs hover:bg-[#F9FAFB] rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F5F5F5] flex items-center justify-center font-mono font-bold text-[#111111] text-xs border border-[#E5E5E5]">
                      #
                    </div>
                    <div>
                      <p className="font-black text-[#111111] font-mono">{order.orderNumber}</p>
                      <p className="text-[#757575] text-[11px] font-medium">{order.customer?.fullName} • {order.customer?.city}</p>
                    </div>
                  </div>

                  <div className="text-left">
                    <p className="font-black text-[#111111] font-mono text-sm" dir="ltr">
                      {formatPriceEn(order.summary?.finalTotal)} SAR
                    </p>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-0.5 border ${
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Insights & Stock Warnings (1 Column) */}
        <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-3 border-b border-[#E5E5E5]">
              <h3 className="font-black text-[#111111] text-base sm:text-lg font-display">تنبيهات المخزون</h3>
              <p className="text-xs text-[#757575] font-medium">حالة المنتجات في الكتالوج</p>
            </div>

            {outOfStockProducts.length > 0 ? (
              <div className="space-y-2.5">
                {outOfStockProducts.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-rose-50/50 border border-rose-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#111111] truncate max-w-[170px]">{p.name}</p>
                      <p className="text-rose-600 text-[11px] font-bold">غير متوفر بالمخزون</p>
                    </div>
                    <Link
                      href="/admin/products"
                      className="px-3 py-1 rounded-xl bg-white border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                    >
                      تعديل
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>جميع المنتجات متوفرة بالمخزون بحالة ممتازة!</span>
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="pt-4 border-t border-[#E5E5E5] space-y-2">
            <Link
              href="/admin/products"
              prefetch={true}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB] hover:bg-[#F5F5F5] border border-[#E5E5E5] text-xs font-bold text-[#111111] transition-all group"
            >
              <span>إدارة قائمة المنتجات</span>
              <Package className="w-4 h-4 text-[#757575] group-hover:text-[#111111] transition-colors" />
            </Link>
            <Link
              href="/admin/coupons"
              prefetch={true}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB] hover:bg-[#F5F5F5] border border-[#E5E5E5] text-xs font-bold text-[#111111] transition-all group"
            >
              <span>إنشاء كوبون خصم جديد</span>
              <TrendingUp className="w-4 h-4 text-[#757575] group-hover:text-[#111111] transition-colors" />
            </Link>
            <Link
              href="/admin/inventory"
              prefetch={true}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB] hover:bg-[#F5F5F5] border border-[#E5E5E5] text-xs font-bold text-[#111111] transition-all group"
            >
              <span>مراجعة وتحديث المخزون</span>
              <Layers className="w-4 h-4 text-[#757575] group-hover:text-[#111111] transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
