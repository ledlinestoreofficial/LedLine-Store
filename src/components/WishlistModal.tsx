"use client";

import React from 'react';
import { X, Heart, Trash2, ShoppingBag } from 'lucide-react';
import { Product, CartItem } from '../types';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Product[];
  onRemoveWishlist: (p: Product) => void;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  lang?: 'ar' | 'en';
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlist,
  onRemoveWishlist,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-[#E5E5E5] my-6">
        {/* Header */}
        <div className="p-6 border-b border-[#E5E5E5] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-[#D33918] text-[#D33918]" />
            <h3 className="text-lg font-black tracking-tight text-[#111111]">
              قائمة المفضلة والمشاريع المحفوظة
            </h3>
            <span className="text-xs font-mono font-bold bg-[#F5F5F5] px-2 py-0.5 rounded-full text-[#757575]">
              {wishlist.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F5F5F5] text-[#111111] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-3">
          {wishlist.length === 0 ? (
            <div className="py-12 text-center space-y-3 text-[#757575]">
              <Heart className="w-12 h-12 stroke-1 text-[#D1D1D1] mx-auto" />
              <p className="font-bold text-sm text-[#111111]">
                لا توجد منتجات محفوظة في المفضلة
              </p>
              <p className="text-xs text-[#757575]">
                انقر على أيقونة القلب على أي منتج لحفظه والرجوع إليه لاحقاً.
              </p>
            </div>
          ) : (
            wishlist.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 p-3 bg-[#F5F5F5] rounded-2xl border border-[#E5E5E5]"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-white"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-[#111111] line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-[#757575] mt-0.5 font-mono">
                      {item.price} ر.س
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onAddToCart({
                        productId: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.images[0],
                        quantity: 1,
                        sku: item.sku
                      });
                      onRemoveWishlist(item);
                    }}
                    className="bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-bold px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>نقل للسلة</span>
                  </button>

                  <button
                    onClick={() => onRemoveWishlist(item)}
                    className="p-2 text-[#757575] hover:text-[#D33918] transition-colors"
                    aria-label="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
