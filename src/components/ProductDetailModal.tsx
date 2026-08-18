"use client";

import React, { useState } from 'react';
import { X, Star, Check, ShieldCheck, Heart, ShoppingBag } from 'lucide-react';
import { Product, CartItem } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  lang?: 'ar' | 'en';
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-[#E5E5E5] my-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#111111] shadow-md flex items-center justify-center transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 bg-[#F5F5F5] p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-sm border border-[#E5E5E5]">
              <img
                src={product.images[selectedImageIdx] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />

              {product.badge && (
                <span className="absolute top-3 right-3 px-3 py-1 bg-[#111111] text-white text-xs font-bold rounded-full">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 justify-center">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIdx(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIdx === i ? 'border-[#111111] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Guarantees Pill */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#111111]">
                <ShieldCheck className="w-4 h-4 text-[#12805C]" />
                <span>ضمان استبدال ذهبي معتمد</span>
              </div>
              <p className="text-[11px] text-[#757575] leading-relaxed">
                مطابق للمواصفات والمقاييس والجودة مع شحن سريع وتغليف آمن ضد الكسر.
              </p>
            </div>
          </div>

          {/* Right Column: Product Configurator & Specs */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Rating */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#757575]">
                  {product.categoryName} | SKU: {product.sku}
                </span>
                {Boolean(product.reviewsCount && product.reviewsCount > 0) && (
                  <div className="flex items-center gap-1 text-sm font-bold text-[#111111] font-mono">
                    <Star className="w-4 h-4 fill-[#111111] text-[#111111]" />
                    <span>{product.rating}</span>
                    <span className="text-xs text-[#757575]">({product.reviewsCount} تقييم)</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight leading-tight">
                {product.name}
              </h2>

              {/* Price Block */}
              <div className="flex items-baseline gap-3 pb-3 border-b border-[#E5E5E5]">
                <span className="text-3xl font-black text-[#111111] font-mono">
                  {product.price * quantity} <span className="text-sm font-bold">ر.س</span>
                </span>
                {product.originalPrice && (
                  <span className="text-base text-[#757575] line-through font-mono">
                    {product.originalPrice * quantity} ر.س
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="px-2.5 py-0.5 bg-[#D33918] text-white text-xs font-black rounded-full font-mono">
                    خصم {discountPercent}%
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-[#757575] leading-relaxed">
                {product.description}
              </p>

              {/* Color Temperature Selector */}
              {product.colorOptions && product.colorOptions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#111111]">درجة لون الإضاءة:</span>
                    <span className="text-[#757575] font-mono">{selectedColorTemp}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {product.colorOptions.map((opt) => (
                      <button
                        key={opt.temp || opt.name}
                        onClick={() => setSelectedColorTemp(opt.temp || opt.name)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                          selectedColorTemp === (opt.temp || opt.name)
                            ? 'border-[#111111] bg-[#111111] text-white'
                            : 'border-[#E5E5E5] bg-white text-[#111111] hover:bg-[#F5F5F5]'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: opt.hex }} />
                        <span className="truncate">{opt.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Finish Options Selector (for Wood Panels) */}
              {product.finishOptions && product.finishOptions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#111111]">نوع التشطيب وقشرة الخشب:</span>
                    <span className="text-[#757575]">{selectedFinish}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {product.finishOptions.map((f) => (
                      <button
                        key={f.name}
                        onClick={() => setSelectedFinish(f.name)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                          selectedFinish === f.name
                            ? 'border-[#111111] bg-[#111111] text-white'
                            : 'border-[#E5E5E5] bg-white text-[#111111] hover:bg-[#F5F5F5]'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: f.hex }} />
                        <span className="truncate">{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Specs Table */}
              <div className="bg-[#F5F5F5] rounded-2xl p-4 space-y-2 text-xs">
                <p className="font-bold text-[#111111] uppercase tracking-wider text-[11px]">
                  المواصفات الهندسية
                </p>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  {product.specs.wattage && (
                    <div>
                      <span className="text-[#757575]">القدرة:</span>{' '}
                      <span className="font-bold text-[#111111] font-mono">{product.specs.wattage}</span>
                    </div>
                  )}
                  {product.specs.voltage && (
                    <div>
                      <span className="text-[#757575]">الجهد:</span>{' '}
                      <span className="font-bold text-[#111111] font-mono">{product.specs.voltage}</span>
                    </div>
                  )}
                  {product.specs.cri && (
                    <div>
                      <span className="text-[#757575]">نقاء اللون:</span>{' '}
                      <span className="font-bold text-[#111111]">{product.specs.cri}</span>
                    </div>
                  )}
                  {product.specs.ipRating && (
                    <div>
                      <span className="text-[#757575]">الحماية:</span>{' '}
                      <span className="font-bold text-[#111111]">{product.specs.ipRating}</span>
                    </div>
                  )}
                  {product.specs.warranty && (
                    <div>
                      <span className="text-[#757575]">الضمان:</span>{' '}
                      <span className="font-bold text-[#12805C]">{product.specs.warranty}</span>
                    </div>
                  )}
                  {product.specs.dimensions && (
                    <div className="col-span-2">
                      <span className="text-[#757575]">الأبعاد:</span>{' '}
                      <span className="font-bold text-[#111111]">{product.specs.dimensions}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions: Quantity + Add to Bag */}
            <div className="pt-4 border-t border-[#E5E5E5] space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity Pill */}
                <div className="flex items-center bg-[#F5F5F5] rounded-full border border-[#E5E5E5] px-3 py-1.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 flex items-center justify-center font-bold text-lg text-[#111111] hover:bg-[#E5E5E5] rounded-full transition-colors"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold font-mono text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center font-bold text-lg text-[#111111] hover:bg-[#E5E5E5] rounded-full transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAdded}
                  className={`flex-1 py-3.5 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
                    isAdded
                      ? 'bg-[#12805C] text-white'
                      : 'bg-[#111111] hover:bg-[#2A2A2A] text-white'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>تمت الإضافة للسلة!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>إضافة للسلة ({product.price * quantity} ر.س)</span>
                    </>
                  )}
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={() => onToggleWishlist(product)}
                  className="p-3.5 rounded-full border border-[#E5E5E5] hover:border-[#111111] bg-white transition-colors"
                  aria-label="المفضلة"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isWishlisted ? 'fill-[#D33918] text-[#D33918]' : 'text-[#111111]'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
