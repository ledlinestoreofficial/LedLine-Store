'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, CategoryData } from '../../types';
import { ProductFormModal } from '../../components/ProductFormModal';
import { deleteProductAction, updateProductStockAction } from '../../lib/actions';
import { formatPriceEn } from '../../lib/num-utils';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  ExternalLink,
  Package,
  Layers,
  Star,
  DollarSign,
} from 'lucide-react';
import Image from 'next/image';

interface ProductsClientProps {
  initialProducts: Product[];
  categories: CategoryData[];
}

export function ProductsClient({ initialProducts, categories }: ProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const router = useRouter();

  const fetchLatestProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      }
    } catch {
      // Ignore
    }
  };
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenAddModal = () => {
    setSelectedProductForEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setSelectedProductForEdit(p);
    setIsModalOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    const { id: productId } = productToDelete;
    setDeletingId(productId);
    setErrorMessage(null);
    try {
      const res = await deleteProductAction(productId);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        setProductToDelete(null);
      } else {
        setErrorMessage(res.error || 'فشل حذف المنتج');
      }
    } catch {
      setErrorMessage('حدث خطأ أثناء الحذف');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDelete = (productId: string, name: string) => {
    setProductToDelete({ id: productId, name });
  };

  const handleToggleStock = async (productId: string, currentInStock: boolean) => {
    const newStock = !currentInStock;
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, inStock: newStock } : p))
    );

    try {
      await updateProductStockAction(productId, newStock);
    } catch {
      // Revert on error
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, inStock: currentInStock } : p))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E5E5] p-5 sm:p-6 rounded-3xl shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[#111111] flex items-center gap-2 font-display">
            <Package className="w-5 h-5 text-[#111111]" />
            كتالوج المنتجات المعمارية ({filteredProducts.length})
          </h2>
          <p className="text-xs text-[#757575] mt-1 font-medium">
            إدارة متكاملة لجميع أصناف الليد لاين، البروفايلات وأخشاب الجدران مع المزامنة التلقائية
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#111111] hover:bg-black text-white font-bold text-xs transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-[#757575]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، رمز SKU، أو الوصف..."
            className="w-full bg-white border border-[#E5E5E5] rounded-xl pr-10 pl-4 py-2.5 text-xs text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all shadow-xs"
          />
        </div>

        <div className="relative">
          <Filter className="w-4 h-4 absolute right-3.5 top-3.5 text-[#757575]" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white border border-[#E5E5E5] rounded-xl pr-10 pl-4 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all shadow-xs font-medium"
          >
            <option value="all">جميع الأقسام والتصنيفات</option>
            <option value="led-cob">شريط ليد وسيليكون (COB)</option>
            <option value="aluminum-profiles">بروفايلات الألمنيوم</option>
            <option value="wood-panels">أخشاب الجدران المودرن</option>
            <option value="magnetic-track">المسارات المغناطيسية</option>
            <option value="pendant-modern">الإنارة المعلقة الحديثة</option>
            <option value="outdoor-linear">الإنارة الخارجية</option>
            <option value="power-smart">المحولات والتحكم الذكي</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-xs">
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-[#757575] text-xs space-y-2">
            <Package className="w-8 h-8 text-[#D1D5DB] mx-auto" />
            <p className="font-medium">لا توجد منتجات مطابقة لخيارات البحث المحددة.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#F9FAFB] text-[#757575] uppercase tracking-wider font-bold border-b border-[#E5E5E5]">
                <tr>
                  <th className="px-5 py-4">المنتج</th>
                  <th className="px-5 py-4">القسم</th>
                  <th className="px-5 py-4">السعر</th>
                  <th className="px-5 py-4">المخزون والتوافر</th>
                  <th className="px-5 py-4">التقييم</th>
                  <th className="px-5 py-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-[#111111]">
                {filteredProducts.map((product) => {
                  const hasImage = product.images && product.images.length > 0;
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-[#F9FAFB] transition-colors duration-150"
                    >
                      {/* Name & Image */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#F5F5F5] border border-[#E5E5E5] overflow-hidden flex items-center justify-center shrink-0 relative">
                            {hasImage ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-[#9CA3AF]" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-[#111111] text-xs">
                              {product.name}
                            </p>
                            <p className="text-[11px] text-[#757575] font-mono mt-0.5">
                              SKU: {product.sku}
                            </p>
                            {product.badge && (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] text-[10px] font-bold">
                                {product.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] text-[11px] font-bold text-[#4B5563]">
                          {product.categoryName || product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4">
                        <span className="font-black text-[#111111] font-mono text-sm" dir="ltr">
                          {formatPriceEn(product.price)} SAR
                        </span>
                        {product.originalPrice && (
                          <span className="block text-[11px] text-[#9CA3AF] line-through font-mono" dir="ltr">
                            {formatPriceEn(product.originalPrice)} SAR
                          </span>
                        )}
                      </td>

                      {/* Stock Toggle */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggleStock(product.id, product.inStock)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                            product.inStock
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {product.inStock ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>متوفر ({product.stockCount || 50})</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>غير متوفر</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Rating */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 text-[#D97706] font-bold font-mono">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{product.rating || 5}</span>
                          <span className="text-[#9CA3AF] text-[10px] font-normal">({product.reviewsCount || 1})</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-2 rounded-xl bg-[#F5F5F5] hover:bg-[#EAEAEA] border border-[#E5E5E5] text-[#111111] transition-colors shadow-xs"
                            title="تعديل المنتج"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            disabled={deletingId === product.id}
                            className="p-2 rounded-xl bg-white hover:bg-rose-50 border border-[#E5E5E5] hover:border-rose-200 text-rose-600 transition-colors disabled:opacity-50 shadow-xs"
                            title="حذف المنتج"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <ProductFormModal
          product={selectedProductForEdit}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            fetchLatestProducts();
            router.refresh();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E5E5] shadow-2xl space-y-4 text-right">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[#111111]">تأكيد حذف المنتج</h3>
            </div>
            <p className="text-xs text-[#757575] leading-relaxed">
              هل أنت متأكد من رغبتك في حذف المنتج <span className="font-bold text-[#111111]">"{productToDelete.name}"</span> نهائياً من Sanity والمتجر؟
            </p>
            {errorMessage && (
              <p className="text-xs text-rose-600 font-bold">{errorMessage}</p>
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setProductToDelete(null);
                  setErrorMessage(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#111111] text-xs font-bold transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                disabled={deletingId !== null}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {deletingId !== null ? 'جاري الحذف...' : 'نعم، احذف المنتج'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
