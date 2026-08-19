"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Product, CartItem, CategoryId, FilterState, CategoryData, BannerSlide } from '../types';
import { Header } from './Header';
import { HeroCampaign } from './HeroCampaign';
import { CategoryRail } from './CategoryRail';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { WoodAndLedCalculator } from './WoodAndLedCalculator';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import { WishlistModal } from './WishlistModal';
import { Footer } from './Footer';
import Link from 'next/link';
import {
  Sparkles,
  Grid3X3,
  Grid2X2,
  ArrowUpDown,
  LayoutDashboard,
  ArrowLeft,
  Layers,
  Tag,
  RotateCcw,
} from 'lucide-react';

interface StoreClientProps {
  initialProducts: Product[];
  categories?: CategoryData[];
  banners?: BannerSlide[];
}

export function StoreClient({ initialProducts = [], categories = [], banners = [] }: StoreClientProps) {
  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    searchQuery: '',
    priceRange: [0, 600],
    colorTemp: [],
    woodFinishes: [],
    onlyInStock: false,
    onlySale: false,
    sortBy: 'featured'
  });

  // UI Modals State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);

  // Layout View Mode (standard 3/4 col grid or dense grid)
  const [isCompactGrid, setIsCompactGrid] = useState(false);

  // Cart & Wishlist State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Coupons State
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Load user saved session from localStorage on client mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('ledline_cart');
      if (savedCart) setCartItems(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem('ledline_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch (e) {
      console.error(e);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('ledline_cart', JSON.stringify(cartItems));
      } catch (e) {
        console.error(e);
      }
    }
  }, [cartItems, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('ledline_wishlist', JSON.stringify(wishlist));
      } catch (e) {
        console.error(e);
      }
    }
  }, [wishlist, isHydrated]);

  // Update filter category when selected from Header, CategoryRail, or Filter Bar
  const handleSelectCategory = (catId: CategoryId) => {
    setSelectedCategory(catId);
    setFilters((prev) => ({ ...prev, category: catId }));
    
    // Smooth scroll down to catalog if clicked from rail
    const catalogElem = document.getElementById('product-catalog');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Cart Handlers
  const handleAddToCart = (itemData: Omit<CartItem, 'id'>) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.productId === itemData.productId &&
          i.selectedColorTemp === itemData.selectedColorTemp &&
          i.selectedFinish === itemData.selectedFinish
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += itemData.quantity;
        return updated;
      }
      return [
        ...prev,
        {
          ...itemData,
          id: `${itemData.productId}-${Date.now()}`
        }
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  // Wishlist Handlers
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isWishlisted = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  // Coupon Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon === 'LED10') return subtotal * 0.1;
    if (appliedCoupon === 'ARCH20') return subtotal * 0.2;
    return 0;
  }, [appliedCoupon, subtotal]);

  const shippingFee = subtotal > 300 || subtotal === 0 ? 0 : 35;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === 'LED10' || clean === 'ARCH20') {
      setAppliedCoupon(clean);
      return true;
    }
    return false;
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  // Synchronize searchQuery with filters
  useEffect(() => {
    setFilters((prev) => ({ ...prev, searchQuery }));
  }, [searchQuery]);

  // Main Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // 1. Category Filter
    if (filters.category && filters.category !== 'all') {
      result = result.filter((p) => p.category === filters.category);
    }

    // 2. Search Query Filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nameEn.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      );
    }

    // 3. Price Range Filter
    result = result.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // 4. Color Temperature Filter
    if (filters.colorTemp.length > 0) {
      result = result.filter((p) => {
        if (!p.colorOptions) return false;
        return p.colorOptions.some((opt) => filters.colorTemp.includes(opt.name));
      });
    }

    // 5. In Stock Filter
    if (filters.onlyInStock) {
      result = result.filter((p) => p.inStock === true);
    }

    // 6. On Sale Filter
    if (filters.onlySale) {
      result = result.filter((p) => p.isSale === true || (p.originalPrice && p.originalPrice > p.price));
    }

    // 7. Sorting
    switch (filters.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'featured':
      default:
        // Default curated sort
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return result;
  }, [initialProducts, filters]);

  const hasAnyFilterActive = useMemo(() => {
    return (
      filters.category !== 'all' ||
      filters.onlySale ||
      Boolean(searchQuery.trim())
    );
  }, [filters.category, filters.onlySale, searchQuery]);

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setFilters({
      category: 'all',
      searchQuery: '',
      priceRange: [0, 600],
      colorTemp: [],
      woodFinishes: [],
      onlyInStock: false,
      onlySale: false,
      sortBy: 'featured'
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col selection:bg-[#111111] selection:text-white">
      {/* 1. Retail Header (Dynamic categories from Sanity) */}
      <Header
        categories={categories}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      <main className="flex-1">
        {/* 2. Hero Editorial Slider (Controlled via Sanity / Dashboard with balanced dimensions) */}
        <HeroCampaign
          banners={banners}
          onSelectCategory={handleSelectCategory}
        />

        {/* 3. Horizontal Category Rail (Synced with Sanity Categories) */}
        <CategoryRail
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* 4. Main Catalog & Store Products */}
        <section id="product-catalog" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Catalog Top Controls Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
            {/* Title & Count */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight font-display flex items-center gap-2">
                <span>
                  {selectedCategory === 'all'
                    ? 'كافة المنتجات والأنظمة المعمارية'
                    : categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}
                </span>
                <span className="text-xs font-mono font-bold bg-[#F5F5F5] text-[#757575] px-2.5 py-1 rounded-full">
                  {filteredProducts.length} منتج
                </span>
              </h2>
              {searchQuery && (
                <p className="text-xs text-[#757575] mt-1">
                  نتائج البحث عن: "{searchQuery}"
                </p>
              )}
            </div>

            {/* 
              Side-by-side matching filter & sort controls
              (تصفية المنتجات بجانب فلتر المميزة والأكثر طلباً وبنفس تصميمه)
            */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* 1. Category Filter Pill Dropdown */}
              <div className="flex items-center bg-[#F5F5F5] hover:bg-[#EAEAEA] rounded-full px-3.5 py-2 border border-[#E5E5E5] text-xs font-bold transition-all focus-within:border-[#111111]">
                <Layers className="w-3.5 h-3.5 text-[#757575] ml-1.5 shrink-0" />
                <select
                  value={filters.category}
                  onChange={(e) => handleSelectCategory(e.target.value as any)}
                  className="bg-transparent outline-none text-[#111111] cursor-pointer"
                  aria-label="تصفية حسب القسم"
                >
                  <option value="all">كافة الأقسام المعمارية</option>
                  {categories
                    .filter((c) => c.id !== 'all')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* 2. Sort Selector Pill */}
              <div className="flex items-center bg-[#F5F5F5] hover:bg-[#EAEAEA] rounded-full px-3.5 py-2 border border-[#E5E5E5] text-xs font-bold transition-all focus-within:border-[#111111]">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#757575] ml-1.5 shrink-0" />
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
                  className="bg-transparent outline-none text-[#111111] cursor-pointer"
                  aria-label="ترتيب المنتجات"
                >
                  <option value="featured">المميزة والأكثر طلباً</option>
                  <option value="newest">الأحدث تقييماً</option>
                  <option value="price-asc">السعر: من الأقل للأعلى</option>
                  <option value="price-desc">السعر: من الأعلى للأقل</option>
                  <option value="rating">الأعلى تقييماً ★</option>
                </select>
              </div>

              {/* 3. Sale Filter Pill (العروض والخصومات) */}
              <button
                onClick={() => setFilters((prev) => ({ ...prev, onlySale: !prev.onlySale }))}
                className={`flex items-center rounded-full px-3.5 py-2 border text-xs font-bold transition-all cursor-pointer ${
                  filters.onlySale
                    ? 'bg-[#D33918] text-white border-[#D33918] shadow-xs'
                    : 'bg-[#F5F5F5] text-[#111111] border-[#E5E5E5] hover:bg-[#EAEAEA] hover:border-[#111111]'
                }`}
                title="تصفية العروض والتخفيضات"
              >
                <Tag
                  className={`w-3.5 h-3.5 ml-1.5 shrink-0 ${
                    filters.onlySale ? 'text-white' : 'text-[#757575]'
                  }`}
                />
                <span>العروض والتخفيضات</span>
              </button>

              {/* 4. Reset Filters button */}
              {hasAnyFilterActive && (
                <button
                  onClick={handleResetAllFilters}
                  className="text-xs font-bold text-[#757575] hover:text-[#D33918] flex items-center gap-1 transition-colors px-2 py-1 cursor-pointer"
                  title="إعادة ضبط كافة الفلاتر"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>مسح الفلاتر</span>
                </button>
              )}

              {/* Grid density switcher */}
              <div className="hidden xl:flex items-center bg-[#F5F5F5] rounded-full p-1 border border-[#E5E5E5] mr-auto">
                <button
                  onClick={() => setIsCompactGrid(false)}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    !isCompactGrid ? 'bg-white shadow-xs text-[#111111]' : 'text-[#757575]'
                  }`}
                  aria-label="عرض قياسي"
                  title="عرض 4 أعمدة"
                >
                  <Grid2X2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsCompactGrid(true)}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    isCompactGrid ? 'bg-white shadow-xs text-[#111111]' : 'text-[#757575]'
                  }`}
                  aria-label="عرض مدمج"
                  title="عرض مدمج"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Full Width Products Grid */}
          <div className="pt-8">
            {filteredProducts.length === 0 ? (
              <div className="bg-[#F5F5F5] rounded-3xl p-12 text-center space-y-4 border border-[#E5E5E5]">
                <Sparkles className="w-12 h-12 stroke-1 text-[#757575] mx-auto" />
                <h3 className="text-xl font-bold text-[#111111]">
                  لم نتمكن من العثور على منتجات مطابقة
                </h3>
                <p className="text-xs text-[#757575] max-w-sm mx-auto">
                  جرب تعديل خيارات التصفية أو تغيير نطاق السعر للوصول إلى خيارات أكثر.
                </p>
                <button
                  onClick={handleResetAllFilters}
                  className="bg-[#111111] text-white px-6 py-2.5 rounded-full font-bold text-xs hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                >
                  إعادة ضبط كافة الفلاتر
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-5 sm:gap-6 ${
                  isCompactGrid
                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                }`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWishlisted={isWishlisted(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                    onQuickView={(p) => setActiveProductModal(p)}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={handleSelectCategory}
      />

      {/* Interactive Modals & Drawers */}
      <ProductDetailModal
        product={activeProductModal}
        isOpen={!!activeProductModal}
        onClose={() => setActiveProductModal(null)}
        onAddToCart={handleAddToCart}
        isWishlisted={activeProductModal ? isWishlisted(activeProductModal.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      <WoodAndLedCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        discountAmount={discountAmount}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        subtotal={subtotal}
        discountAmount={discountAmount}
        shippingFee={shippingFee}
        finalTotal={finalTotal}
        appliedCoupon={appliedCoupon}
        onOrderSuccess={() => setCartItems([])}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
      />

      {/* Floating Temporary Admin Dashboard Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <Link
          href="/admin"
          className="group flex items-center gap-3 px-4 py-3 bg-[#111111] hover:bg-black text-white border border-[#333333] rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-white/10 border border-white/20 text-white transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#111111] animate-pulse"></span>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                لوحة التحكم (BFF)
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/20 text-white font-mono">
                Admin
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono">
              إدارة المنتجات والبنرات
            </p>
          </div>

          <div className="pr-1 text-gray-400 group-hover:text-white group-hover:translate-x-[-3px] transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}
