"use client";

import React, { useState } from 'react';
import { X, Star, Check, ShieldCheck, Heart, ShoppingBag, ArrowRight, Truck, Award, Zap } from 'lucide-react';
import { Product, CartItem } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  lang?: 'ar' | 'en';
  backLabel?: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  backLabel,
}) => {
  if (!isOpen || !product) return null;

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColorTemp, setSelectedColorTemp] = useState(
    product.colorOptions?.[0]?.temp || '3000K'
  );
  const [selectedFinish, setSelectedFinish] = useState(
    product.finishOptions?.[0]?.name || ''
  );
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    onAddToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[selectedImageIdx] || product.images[0],
      quantity,
      selectedColorTemp: product.colorOptions ? selectedColorTemp : undefined,
      selectedFinish: product.finishOptions ? selectedFinish : undefined,
      sku: product.sku
    });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1200);
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col overflow-y-auto animate-fadeIn">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-20 w-full bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] px-4 sm:px-8 lg:px-12 py-4 sm:py-5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-[#F5F5F5] text-[#111111] transition-colors cursor-pointer flex items-center gap-1.5"
            aria-label={backLabel || "الرجوع للمتجر"}
          >
            <ArrowRight className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-bold">{backLabel || "الرجوع للمتجر"}</span>
          </button>

          <div className="h-5 w-px bg-[#E5E5E5] hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#757575]">
            <span>{product.categoryName}</span>
            <span>/</span>
            <span className="text-[#111111] truncate max-w-xs">{product.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wishlist Button */}
          <button
            onClick={() => onToggleWishlist(product)}
            className="p-2.5 sm:p-3 rounded-full border border-[#E5E5E5] hover:border-[#111111] bg-white transition-colors cursor-pointer"
            aria-label="المفضلة"
            title="حفظ في المفضلة"
          >
            <Heart
              className={`w-5 h-5 ${
                isWishlisted ? 'fill-[#D33918] text-[#D33918]' : 'text-[#111111]'
              }`}
            />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-[#F5F5F5] text-[#111111] transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Full Screen Product Content */}
      <div className="flex-1 bg-[#F9FAFB] py-8 sm:py-12 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Gallery Column (6 Cols) */}
            <div className="lg:col-span-6 space-y-5 lg:sticky lg:top-28">
              {/* Primary Image Viewport */}
              <div className="relative aspect-4/3 sm:aspect-square w-full rounded-3xl overflow-hidden bg-white shadow-sm border border-[#E5E5E5] group">
                <img
                  src={product.images[selectedImageIdx] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />

                {product.badge && (
                  <span className="absolute top-4 right-4 px-3.5 py-1.5 bg-[#111111] text-white text-xs font-bold rounded-full shadow-md">
                    {product.badge}
                  </span>
                )}

                {discountPercent > 0 && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-[#D33918] text-white text-xs font-bold rounded-full shadow-md font-mono">
                    خصم {discountPercent}%
                  </span>
                )}
              </div>

              {/* Thumbnails Gallery */}
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIdx(i)}
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white cursor-pointer ${
                        selectedImageIdx === i ? 'border-[#111111] shadow-md scale-102' : 'border-[#E5E5E5] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}

              {/* Value Guarantees Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-[#12805C] flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-[#111111] block">ضمان معتمد</span>
                    <span className="text-[11px] text-[#757575]">{product.specs.warranty || 'ضمان ذهبي سنتين'}</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] flex items-center gap-3">
                  <Truck className="w-6 h-6 text-[#111111] flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-[#111111] block">شحن سريع</span>
                    <span className="text-[11px] text-[#757575]">تغليف آمن ضد الكسر</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] flex items-center gap-3">
                  <Award className="w-6 h-6 text-[#111111] flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-[#111111] block">مطابق للمواصفات</span>
                    <span className="text-[11px] text-[#757575]">معايير الجودة SASO</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Configurator & Specs Column (6 Cols) */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E5E5] shadow-xs space-y-6">
              
              {/* Category, SKU & Ratings */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#757575]">
                  {product.categoryName} | SKU: <span className="font-mono text-[#111111]">{product.sku}</span>
                </span>
                {Boolean(product.reviewsCount && product.reviewsCount > 0) ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#111111] bg-[#F5F5F5] px-3 py-1 rounded-full">
                    <Star className="w-3.5 h-3.5 fill-[#111111] text-[#111111]" />
                    <span>{product.rating}</span>
                    <span className="text-[#757575]">({product.reviewsCount} تقييم)</span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-[#12805C] bg-[#F0FDF4] px-3 py-1 rounded-full">
                    متوفر في المخزون
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111111] tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Price Display */}
              <div className="flex items-baseline gap-4 py-3 border-y border-[#E5E5E5]">
                <span className="text-3xl sm:text-4xl font-black text-[#111111]">
                  {product.price * quantity} <span className="text-base font-bold">ر.س</span>
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-[#757575] line-through">
                    {product.originalPrice * quantity} ر.س
                  </span>
                )}
                <span className="text-xs text-[#757575] font-semibold mr-auto">
                  السعر شامل ضريبة القيمة المضافة 15%
                </span>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#757575]">
                  تفاصيل ووصف المنتج
                </h3>
                <p className="text-sm sm:text-base text-[#444444] leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Color Temperature Selector */}
              {product.colorOptions && product.colorOptions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-xs sm:text-sm font-bold">
                    <span className="text-[#111111]">درجة حرارة لون الإضاءة (CCT):</span>
                    <span className="text-[#757575] font-mono">{selectedColorTemp}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {product.colorOptions.map((opt) => (
                      <button
                        key={opt.temp || opt.name}
                        onClick={() => setSelectedColorTemp(opt.temp || opt.name)}
                        className={`p-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                          selectedColorTemp === (opt.temp || opt.name)
                            ? 'border-[#111111] bg-[#111111] text-white shadow-xs'
                            : 'border-[#E5E5E5] bg-white text-[#111111] hover:bg-[#F5F5F5]'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full border border-black/20 flex-shrink-0" style={{ backgroundColor: opt.hex }} />
                        <span className="truncate">{opt.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Finish Options Selector */}
              {product.finishOptions && product.finishOptions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-xs sm:text-sm font-bold">
                    <span className="text-[#111111]">نوع التشطيب والقشرة الخشبية:</span>
                    <span className="text-[#757575]">{selectedFinish}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {product.finishOptions.map((f) => (
                      <button
                        key={f.name}
                        onClick={() => setSelectedFinish(f.name)}
                        className={`p-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                          selectedFinish === f.name
                            ? 'border-[#111111] bg-[#111111] text-white shadow-xs'
                            : 'border-[#E5E5E5] bg-white text-[#111111] hover:bg-[#F5F5F5]'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full border border-black/20 flex-shrink-0" style={{ backgroundColor: f.hex }} />
                        <span className="truncate">{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Engineering Specs Matrix */}
              <div className="bg-[#F5F5F5] rounded-3xl p-5 sm:p-6 space-y-3">
                <div className="flex items-center gap-2 font-bold text-[#111111] text-xs uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-[#111111]" />
                  <span>المواصفات الفنية والهندسية</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs sm:text-sm">
                  {product.specs.wattage && (
                    <div>
                      <span className="text-[#757575] block text-[11px]">القدرة الكهربائية</span>
                      <span className="font-bold text-[#111111]">{product.specs.wattage}</span>
                    </div>
                  )}
                  {product.specs.voltage && (
                    <div>
                      <span className="text-[#757575] block text-[11px]">الجهد التشغيلي</span>
                      <span className="font-bold text-[#111111]">{product.specs.voltage}</span>
                    </div>
                  )}
                  {product.specs.cri && (
                    <div>
                      <span className="text-[#757575] block text-[11px]">مؤشر وضوح اللون (CRI)</span>
                      <span className="font-bold text-[#111111]">{product.specs.cri}</span>
                    </div>
                  )}
                  {product.specs.ipRating && (
                    <div>
                      <span className="text-[#757575] block text-[11px]">معيار الحماية</span>
                      <span className="font-bold text-[#111111]">{product.specs.ipRating}</span>
                    </div>
                  )}
                  {product.specs.warranty && (
                    <div>
                      <span className="text-[#757575] block text-[11px]">فترة الضمان</span>
                      <span className="font-bold text-[#12805C]">{product.specs.warranty}</span>
                    </div>
                  )}
                  {product.specs.dimensions && (
                    <div>
                      <span className="text-[#757575] block text-[11px]">الأبعاد والمقاسات</span>
                      <span className="font-bold text-[#111111]">{product.specs.dimensions}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Add to Cart Actions Bar */}
              <div className="pt-4 border-t border-[#E5E5E5] space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  
                  {/* Quantity Counter */}
                  <div className="flex items-center justify-between sm:justify-center bg-[#F5F5F5] rounded-full border border-[#E5E5E5] px-4 py-2.5">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center font-bold text-lg text-[#111111] hover:bg-white rounded-full transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-black text-base">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center font-bold text-lg text-[#111111] hover:bg-white rounded-full transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Bag Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdded}
                    className={`flex-1 py-4 px-8 rounded-full font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-98 cursor-pointer ${
                      isAdded
                        ? 'bg-[#12805C] text-white'
                        : 'bg-[#111111] hover:bg-[#2A2A2A] text-white'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>تمت الإضافة إلى السلة بنجاح!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        <span>إضافة للسلة ({product.price * quantity} ر.س)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
