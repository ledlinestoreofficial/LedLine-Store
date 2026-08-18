'use client';

import React, { useState } from 'react';
import { Product } from '../../types';
import { updateProductStockAction } from '../../lib/actions';
import { toEnglishDigits, parseNumericEnglish } from '../../lib/num-utils';
import { Warehouse, Search, AlertTriangle, CheckCircle2, Save, XCircle } from 'lucide-react';

interface InventoryClientProps {
  initialProducts: Product[];
}

export function InventoryClient({ initialProducts }: InventoryClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [stockChanges, setStockChanges] = useState<Record<string, { inStock: boolean; count: number }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleStockCountChange = (productId: string, rawVal: string) => {
    const englishVal = toEnglishDigits(rawVal).replace(/[^0-9]/g, '');
    const numVal = parseNumericEnglish(englishVal, 0);

    const current = products.find((p) => p.id === productId);
    const existing = stockChanges[productId] || {
      inStock: current?.inStock ?? true,
      count: current?.stockCount ?? 50,
    };
    setStockChanges({
      ...stockChanges,
      [productId]: { ...existing, count: numVal, inStock: numVal > 0 },
    });
  };

  const handleToggleInStock = (productId: string) => {
    const current = products.find((p) => p.id === productId);
    const existing = stockChanges[productId] || {
      inStock: current?.inStock ?? true,
      count: current?.stockCount ?? 50,
    };
    setStockChanges({
      ...stockChanges,
      [productId]: { ...existing, inStock: !existing.inStock },
    });
  };

  const handleSaveRow = async (productId: string) => {
    const change = stockChanges[productId];
    if (!change) return;

    setSavingId(productId);
    setErrorMessage(null);
    try {
      const res = await updateProductStockAction(productId, change.inStock, change.count);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? { ...p, inStock: change.inStock, stockCount: change.count }
              : p
          )
        );
        const next = { ...stockChanges };
        delete next[productId];
        setStockChanges(next);
      } else {
        setErrorMessage(res.error || 'تعذر حفظ المخزون');
      }
    } catch {
      setErrorMessage('تعذر حفظ المخزون');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E5E5] p-5 sm:p-6 rounded-3xl shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[#111111] flex items-center gap-2 font-display">
            <Warehouse className="w-5 h-5 text-[#111111]" />
            إدارة المخزون والتوافر الفوري ({products.length} صنف)
          </h2>
          <p className="text-xs text-[#757575] mt-1 font-medium">
            تحديث كميات الأمتار والقطع المتوفرة وتنبيهات نفاد المخزون (بالأرقام الإنجليزية)
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

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute right-4 top-3.5 text-[#757575]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث عن منتج لتعديل مخزونه..."
          className="w-full bg-white border border-[#E5E5E5] rounded-2xl pr-11 pl-4 py-3 text-xs text-[#111111] placeholder:text-[#757575] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all shadow-xs"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#F9FAFB] text-[#757575] font-bold border-b border-[#E5E5E5]">
              <tr>
                <th className="px-5 py-4">المنتج والـ SKU</th>
                <th className="px-5 py-4">القسم</th>
                <th className="px-5 py-4">حالة التوافر</th>
                <th className="px-5 py-4 text-center">الكمية المسجلة</th>
                <th className="px-5 py-4 text-center">حفظ التغيير</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] text-[#111111]">
              {filtered.map((product) => {
                const change = stockChanges[product.id];
                const isModified = Boolean(change);
                const currentInStock = change ? change.inStock : product.inStock;
                const currentCount = change ? change.count : product.stockCount || 50;

                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-[#F9FAFB] transition-colors ${
                      isModified ? 'bg-amber-50/50' : ''
                    }`}
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#111111]">{product.name}</p>
                      <p className="text-[11px] text-[#757575] font-mono mt-0.5" dir="ltr">SKU: {product.sku}</p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-[#4B5563] font-medium">{product.categoryName}</span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleInStock(product.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                          currentInStock
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {currentInStock ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>متوفر</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>غير متوفر</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <input
                        type="text"
                        inputMode="numeric"
                        dir="ltr"
                        value={String(currentCount)}
                        onChange={(e) => handleStockCountChange(product.id, e.target.value)}
                        className="w-24 bg-white border border-[#E5E5E5] rounded-xl px-2.5 py-1.5 text-xs text-[#111111] font-mono font-black text-center focus:outline-none focus:border-[#111111] shadow-2xs"
                      />
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        disabled={!isModified || savingId === product.id}
                        onClick={() => handleSaveRow(product.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111111] hover:bg-black text-white text-xs font-bold transition-all shadow-xs disabled:opacity-20 disabled:pointer-events-none"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{savingId === product.id ? 'حفظ...' : 'حفظ'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
