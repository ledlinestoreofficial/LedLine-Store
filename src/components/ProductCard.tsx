"use client";

import React from 'react';
import { Heart, Star, Plus, Check, Eye } from 'lucide-react';
import { Product, CartItem } from '../types';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  lang?: 'ar' | 'en';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [justAdded, setJustAdded] = React.useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
      selectedColorTemp: product.colorOptions?.[0]?.temp || undefined,
      selectedFinish: product.finishOptions?.[0]?.name || undefined,
      sku: product.sku
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      onClick={() => onQuickView(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-2xl overflow-hidden border border-[#E5E5E5] hover:border-[#111111] transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
    >
      {/* Top Image Container */}
      <div className="aspect-square w-full bg-[#F5F5F5] relative overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {product.badge && (
            <span className="px-2.5 py-1 bg-[#111111] text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-sm">
              {product.badge}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 bg-[#D33918] text-white text-[11px] font-black rounded-full shadow-sm font-mono">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#111111] backdrop-blur-sm flex items-center justify-center transition-all shadow-sm active:scale-90"
          aria-label="إضافة للمفضلة"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-[#D33918] text-[#D33918]' : 'text-[#111111]'
            }`}
          />
        </button>

        {/* Floating Quick View & Add on Hover (Desktop) */}
        <div className="absolute bottom-3 inset-x-3 hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 bg-white/95 hover:bg-white text-[#111111] text-xs font-bold py-2.5 px-3 rounded-full backdrop-blur-md shadow-md flex items-center justify-center gap-1.5 transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>نظرة سريعة</span>
          </button>

          <button
            onClick={handleQuickAdd}
            disabled={justAdded}
            className={`p-2.5 rounded-full shadow-md transition-all active:scale-90 flex items-center justify-center ${
              justAdded
                ? 'bg-[#12805C] text-white'
                : 'bg-[#111111] hover:bg-[#2A2A2A] text-white'
            }`}
            aria-label="إضافة سريعة للسلة"
          >
            {justAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#757575]">
            <span className="font-semibold">{product.categoryName}</span>
            {Boolean(product.reviewsCount && product.reviewsCount > 0) && (
              <div className="flex items-center gap-1 text-[#111111] font-bold font-mono">
                <Star className="w-3.5 h-3.5 fill-[#111111] text-[#111111]" />
                <span>{product.rating}</span>
                <span className="text-[#757575] font-normal">({product.reviewsCount})</span>
              </div>
            )}
          </div>

          <h3 className="font-bold text-sm sm:text-base text-[#111111] leading-snug line-clamp-2 group-hover:text-black">
            {product.name}
          </h3>

          <p className="text-xs text-[#757575] line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* Color / Finish Chips Preview */}
        {product.colorOptions && (
          <div className="flex items-center gap-1.5 pt-1">
            {product.colorOptions.slice(0, 4).map((c, i) => (
              <span
                key={i}
                title={c.name}
                className="w-3.5 h-3.5 rounded-full border border-black/20"
                style={{ backgroundColor: c.hex }}
              />
            ))}
            <span className="text-[10px] text-[#757575] font-mono mr-1">
              {product.colorOptions.length} خيارات
            </span>
          </div>
        )}

        {product.finishOptions && (
          <div className="flex items-center gap-1.5 pt-1">
            {product.finishOptions.slice(0, 4).map((f, i) => (
              <span
                key={i}
                title={f.name}
                className="w-3.5 h-3.5 rounded-full border border-black/20"
                style={{ backgroundColor: f.hex }}
              />
            ))}
            <span className="text-[10px] text-[#757575] font-mono mr-1">
              {product.finishOptions.length} تشطيبات
            </span>
          </div>
        )}

        {/* Price & Mobile Add Button */}
        <div className="pt-2 border-t border-[#F5F5F5] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-black text-[#111111] font-mono">
                {product.price} <span className="text-xs font-bold">ر.س</span>
              </span>
              {product.originalPrice && (
                <span className="text-xs text-[#757575] line-through font-mono">
                  {product.originalPrice}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#12805C] font-semibold block">
              شامل ضريبة القيمة المضافة 15%
            </span>
          </div>

          {/* Mobile Direct Add button */}
          <button
            onClick={handleQuickAdd}
            disabled={justAdded}
            className={`sm:hidden p-2 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
              justAdded
                ? 'bg-[#12805C] text-white'
                : 'bg-[#111111] text-white active:scale-90'
            }`}
          >
            {justAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
