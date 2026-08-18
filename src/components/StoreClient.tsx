"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Product, CartItem, CategoryId, FilterState, CategoryData } from '../types';
import { Header } from './Header';
import { HeroCampaign } from './HeroCampaign';
import { CategoryRail } from './CategoryRail';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { WoodAndLedCalculator } from './WoodAndLedCalculator';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import { WishlistModal } from './WishlistModal';
import { FilterSidebar } from './FilterSidebar';
import { Footer } from './Footer';
import Link from 'next/link';
import { Sparkles, Grid3X3, Grid2X2, ArrowUpDown, LayoutDashboard, ArrowLeft } from 'lucide-react';

interface StoreClientProps {
  initialProducts: Product[];
  categories?: CategoryData[];
}

export function StoreClient({ initialProducts = [], categories = [] }: StoreClientProps) {
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

  // Layout View Mode (standard grid or dense 4-col grid)
  const [isCompactGrid, setIsCompactGrid] = useState(false);

  // Cart & Wishlist State (Clean initial states without demo data)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Coupons State (Clean initial state without pre-applied coupon)
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

  // Update filter category when selected from Header or CategoryRail
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
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        }
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveCartItem(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Wishlist Handlers
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isWishlisted = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  // Coupon Engine
  const handleApplyCoupon = (code: string) => {
    const upper = code.trim().toUpperCase();
    if (upper === 'LED10' || upper === 'WELCOME' || upper === 'PROMO15') {
      setAppliedCoupon(upper);
      return true;
    }
    return false;
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon
    ? appliedCoupon === 'WELCOME' || appliedCoupon === 'PROMO15'
      ? Math.round(subtotal * 0.15)
      : Math.round(subtotal * 0.1)
    : 0;
  const shippingFee = subtotal >= 350 || cartItems.length === 0 ? 0 : 35;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Filter & Sort Logic (Using Server-supplied initial products)
  const filteredProducts = useMemo(() => {
    const sourceProducts = initialProducts;

    return sourceProducts.filter((p) => {
      // Category filter
      if (filters.category !== 'all' && p.category !== filters.category) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(q) || p.nameEn?.toLowerCase().includes(q);
        const matchesDesc = p.description?.toLowerCase().includes(q) || p.shortDescription?.toLowerCase().includes(q);
        const matchesSku = p.sku?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesSku) return false;
      }

      // Price filter
      if (p.price > filters.priceRange[1]) {
        return false;
      }

      // In stock
      if (filters.onlyInStock && !p.inStock) {
        return false;
      }

      // On sale
      if (filters.onlySale && !p.isSale) {
        return false;
      }

      // Color temperature
      if (filters.colorTemp.length > 0) {
        const hasMatchingTemp = p.colorOptions?.some((c) =>
          filters.colorTemp.includes(c.temp || '')
        );
        if (!hasMatchingTemp) return false;
      }

      // Wood finishes
      if (filters.woodFinishes.length > 0) {
        const hasMatchingFinish = p.finishOptions?.some((f) =>
          filters.woodFinishes.some((wf) => f.name.includes(wf))
        );
        if (!hasMatchingFinish) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'newest') return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [filters, searchQuery, initialProducts]);

  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col selection:bg-[#111111] selection:text-white">
      {/* 1. Retail Header */}
      <Header
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
        {/* 2. Hero Editorial Slider */}
        <HeroCampaign
          onSelectCategory={handleSelectCategory}
        />

        {/* 3. Horizontal Category Rail */}
        <CategoryRail
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* 4. Main Catalog & Store Products Grid */}
        <section id="product-catalog" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Catalog Top Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
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

            {/* Sorting & Grid View Switchers */}
            <div className="flex items-center gap-3">
              {/* Sort Selector */}
              <div className="flex items-center bg-[#F5F5F5] rounded-full px-3 py-1.5 border border-[#E5E5E5] text-xs font-bold">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#757575] ml-1.5" />
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
                  className="bg-transparent outline-none text-[#111111] cursor-pointer"
                >
                  <option value="featured">المميزة والأكثر طلباً</option>
                  <option value="newest">الأحدث تقييماً</option>
                  <option value="price-asc">السعر: من الأقل للأعلى</option>
                  <option value="price-desc">السعر: من الأعلى للأقل</option>
                  <option value="rating">الأعلى تقييماً ★</option>
                </select>
              </div>

              {/* Grid density toggle */}
              <div className="hidden sm:flex items-center bg-[#F5F5F5] rounded-full p-1 border border-[#E5E5E5]">
                <button
                  onClick={() => setIsCompactGrid(false)}
                  className={`p-1.5 rounded-full transition-colors ${
                    !isCompactGrid ? 'bg-white shadow-xs text-[#111111]' : 'text-[#757575]'
                  }`}
                  aria-label="عرض قياسي"
                >
                  <Grid2X2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsCompactGrid(true)}
                  className={`p-1.5 rounded-full transition-colors ${
                    isCompactGrid ? 'bg-white shadow-xs text-[#111111]' : 'text-[#757575]'
                  }`}
                  aria-label="عرض مدمج"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Grid Layout with Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
            {/* Filter Sidebar (Desktop) */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-28">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
                  onResetFilters={() =>
                    setFilters({
                      category: 'all',
                      searchQuery: '',
                      priceRange: [0, 600],
                      colorTemp: [],
                      woodFinishes: [],
                      onlyInStock: false,
                      onlySale: false,
                      sortBy: 'featured'
                    })
                  }
                  totalMatches={filteredProducts.length}
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-9">
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
                    onClick={() => {
                      setSearchQuery('');
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
                    }}
                    className="bg-[#111111] text-white px-6 py-2.5 rounded-full font-bold text-xs hover:bg-[#2A2A2A] transition-colors"
                  >
                    إعادة ضبط كافة الفلاتر
                  </button>
                </div>
              ) : (
                <div
                  className={`grid gap-4 sm:gap-6 ${
                    isCompactGrid
                      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
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

      {/* Floating Temporary Admin Dashboard Test Button */}
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
              إدارة المنتجات والطلبات
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
