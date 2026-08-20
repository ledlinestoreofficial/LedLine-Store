"use client";

import React from 'react';
import { X, Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
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

  const handleAddAllToCart = () => {
    wishlist.forEach((item) => {
      onAddToCart({
        productId: item.id,
        name: item.name,
        price: item.price,
        image: item.images[0],
        quantity: 1,
        sku: item.sku,
      });
      onRemoveWishlist(item);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden animate-fadeIn">
      {/* Top Header Bar */}
      <div className="w-full bg-white border-b border-[#E5E5E5] px-4 sm:px-8 lg:px-12 py-4 sm:py-5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-[#F5F5F5] text-[#111111] transition-colors cursor-pointer flex items-center gap-1.5"
            aria-label="الرجوع للمتجر"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-bold">الرجوع للمتجر</span>
          </button>
          
          <div className="h-5 w-px bg-[#E5E5E5] hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight">
              المفضلة
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {wishlist.length > 0 && (
            <button
              onClick={handleAddAllToCart}
              className="bg-[#111111] hover:bg-[#2A2A2A] text-white px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>نقل الكل إلى السلة</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-[#F5F5F5] text-[#111111] transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Full-Screen Content Area */}
      <div className="flex-1 overflow-y-auto bg-[#F9FAFB] p-4 sm:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {wishlist.length === 0 ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4 py-12 sm:py-16">
              <div className="w-20 h-20 rounded-full bg-[#EAEAEA] flex items-center justify-center mx-auto">
                <Heart className="w-10 h-10 text-[#A3A3A3]" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="font-black text-xl sm:text-2xl text-[#111111]">
                  قائمة المفضلة فارغة
                </h3>
                <p className="text-sm text-[#757575] leading-relaxed">
                  احفظ المنتجات المفضلة لديك لتصل إليها وتطلبها بضغطة زر في أي وقت.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-4 bg-[#111111] text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-[#2A2A2A] transition-all shadow-md active:scale-95 cursor-pointer"
              >
                تصفح المنتجات الآن
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E5E5E5] hover:border-[#111111] hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Product Image */}
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F5F5F5] mb-4">
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={() => onRemoveWishlist(item)}
                        className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#D33918] shadow-xs flex items-center justify-center transition-colors cursor-pointer"
                        title="حذف من المفضلة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {item.badge && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 bg-[#111111] text-white text-[10px] font-bold rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {/* Meta & Title */}
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#757575] block mb-1">
                      {item.categoryName}
                    </span>
                    <h3 className="font-bold text-sm text-[#111111] leading-snug line-clamp-2 mb-2">
                      {item.name}
                    </h3>
                  </div>

                  {/* Price and Cart Action */}
                  <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between gap-3 mt-3">
                    <div>
                      <span className="text-xs text-[#757575] block">السعر</span>
                      <span className="text-base sm:text-lg font-black text-[#111111]">
                        {item.price} <span className="text-xs font-normal">ر.س</span>
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onAddToCart({
                          productId: item.id,
                          name: item.name,
                          price: item.price,
                          image: item.images[0],
                          quantity: 1,
                          sku: item.sku,
                        });
                        onRemoveWishlist(item);
                      }}
                      className="bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>نقل للسلة</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
