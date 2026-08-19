import { Product, CategoryData, OrderRecord, BannerSlide } from '../types';
import { PRODUCTS, CATEGORIES } from '../data/products';

export interface CouponCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  expiresAt: string;
  isActive: boolean;
  usageCount: number;
}

export const INITIAL_BANNERS: BannerSlide[] = [
  {
    id: 'hero-1',
    tagAr: 'تشكيلة معمارية 2026',
    headlineAr: 'إضاءة معمارية نقية بلا نقاط.',
    subheadlineAr: 'تقنية COB فائقة الكثافة مع بروفايلات ألمنيوم مخفية تندمج بسلاسة في الأسقف والجدران الديكورية.',
    ctaPrimaryAr: 'تسوق أشرطة COB',
    ctaPrimaryLink: 'led-cob',
    ctaSecondaryAr: 'استكشف كافة المقاسات',
    ctaSecondaryLink: 'aluminum-profiles',
    category: 'led-cob',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop',
    badgeAr: 'ضمان ذهبي 5 سنوات',
    order: 1,
    active: true,
  },
  {
    id: 'hero-2',
    tagAr: 'تصاميم ديكورية متميزة',
    headlineAr: 'ألواح بديل الخشب والسلات الصوتية.',
    subheadlineAr: 'قشرة خشب البلوط والجوز الطبيعي المدمجة مع لباد عازل للصدى وتجاويف مخصصة للإنارة المخفية.',
    ctaPrimaryAr: 'استكشف ألواح الخشب',
    ctaPrimaryLink: 'wood-panels',
    ctaSecondaryAr: 'إلهام المساحات والتركيب',
    ctaSecondaryLink: 'wood-panels',
    category: 'wood-panels',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600&auto=format&fit=crop',
    badgeAr: 'عازل للصوت ومقاوم للرطوبة',
    order: 2,
    active: true,
  },
  {
    id: 'hero-3',
    tagAr: 'أنظمة الإنارة الحديثة',
    headlineAr: 'الإنارة المغناطيسية الذكية.',
    subheadlineAr: 'نظام الجهد المنخفض الآمن، ركّب وحرّك وحدات السبوت لايت والإنارة الخطية بلمسة يد.',
    ctaPrimaryAr: 'اكتشف الأنظمة المغناطيسية',
    ctaPrimaryLink: 'magnetic-track',
    ctaSecondaryAr: 'استكشف التشكيلة',
    ctaSecondaryLink: 'magnetic-track',
    category: 'magnetic-track',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1600&auto=format&fit=crop',
    badgeAr: 'جهد منخفض آمن 48V',
    order: 3,
    active: true,
  },
];

// Clean Real Store State (Zero Dummy Data)
export const INITIAL_ORDERS: OrderRecord[] = [];
export const INITIAL_COUPONS: CouponCode[] = [];

// Global in-memory persistent cache for zero-downtime consistency
class StoreDataRepository {
  private products: Product[] = [...PRODUCTS];
  private categories: CategoryData[] = [...CATEGORIES];
  private orders: OrderRecord[] = [...INITIAL_ORDERS];
  private coupons: CouponCode[] = [...INITIAL_COUPONS];
  private banners: BannerSlide[] = [...INITIAL_BANNERS];
  private deletedProductIds: Set<string> = new Set();
  private deletedBannerIds: Set<string> = new Set();
  private deletedCategoryIds: Set<string> = new Set();
  private deletedCouponIds: Set<string> = new Set();

  // Products
  getProducts(): Product[] {
    return this.products.filter((p) => !this.deletedProductIds.has(p.id) && !this.deletedProductIds.has(p.sku));
  }

  getProductById(id: string): Product | undefined {
    if (this.deletedProductIds.has(id)) return undefined;
    return this.products.find((p) => (p.id === id || p.sku === id) && !this.deletedProductIds.has(p.id) && !this.deletedProductIds.has(p.sku));
  }

  saveProduct(product: Partial<Product>): Product {
    if (product.id) {
      this.deletedProductIds.delete(product.id);
    }
    if (product.sku) {
      this.deletedProductIds.delete(product.sku);
    }
    const isEdit = Boolean(product.id);
    const existingIndex = isEdit ? this.products.findIndex((p) => p.id === product.id) : -1;

    if (existingIndex >= 0) {
      this.products[existingIndex] = {
        ...this.products[existingIndex],
        ...product,
      } as Product;
      return this.products[existingIndex];
    } else {
      const newProd: Product = {
        id: product.id || `prod-${Date.now()}`,
        name: product.name || 'منتج إنارة جديد',
        nameEn: product.nameEn || 'New Product',
        sku: product.sku || `LL-GEN-${Math.floor(1000 + Math.random() * 9000)}`,
        category: (product.category as any) || 'led-cob',
        categoryName: product.categoryName || 'أشرطة ليد COB',
        categoryNameEn: product.categoryNameEn || 'COB LED Strips',
        badge: product.badge,
        badgeEn: product.badgeEn,
        price: Number(product.price) || 0,
        originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        rating: product.rating || 0,
        reviewsCount: product.reviewsCount || 0,
        shortDescription: product.shortDescription || '',
        shortDescriptionEn: product.shortDescriptionEn || '',
        description: product.description || '',
        descriptionEn: product.descriptionEn || '',
        images: product.images && product.images.length > 0 ? product.images : [
          'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop'
        ],
        features: product.features || ['جودة تصنيع فائقة وضمان معتمد'],
        featuresEn: product.featuresEn || ['High quality architectural grade'],
        specs: product.specs || { wattage: '12W', voltage: '24V DC' },
        inStock: product.inStock !== false,
        featured: Boolean(product.featured),
        isSale: Boolean(product.isSale),
        stockCount: product.stockCount !== undefined ? Number(product.stockCount) : 50,
      };
      this.products.unshift(newProd);
      return newProd;
    }
  }

  deleteProduct(id: string): boolean {
    this.deletedProductIds.add(id);
    const prevLen = this.products.length;
    this.products = this.products.filter((p) => p.id !== id && p.sku !== id);
    return this.products.length < prevLen;
  }

  updateStock(id: string, inStock: boolean, count?: number): boolean {
    const prod = this.products.find((p) => p.id === id);
    if (!prod) return false;
    prod.inStock = inStock;
    if (count !== undefined) prod.stockCount = count;
    return true;
  }

  // Categories
  getCategories(): CategoryData[] {
    return this.categories.filter((c) => !this.deletedCategoryIds.has(c.id));
  }

  saveCategory(category: Partial<CategoryData>): CategoryData {
    const id = category.id || `cat-${Date.now()}`;
    this.deletedCategoryIds.delete(id);
    const idx = this.categories.findIndex((c) => c.id === id);
    const catItem: CategoryData = {
      id: (category.id as any) || id,
      name: category.name || 'قسم جديد',
      nameEn: category.nameEn || 'New Category',
      icon: category.icon || 'Sparkles',
      count: category.count || 0,
      image: category.image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
      description: category.description || '',
    };
    if (idx >= 0) {
      this.categories[idx] = { ...this.categories[idx], ...catItem };
      return this.categories[idx];
    } else {
      this.categories.push(catItem);
      return catItem;
    }
  }

  deleteCategory(id: string): boolean {
    this.deletedCategoryIds.add(id);
    const prev = this.categories.length;
    this.categories = this.categories.filter((c) => c.id !== id);
    return this.categories.length < prev;
  }

  // Orders
  getOrders(): OrderRecord[] {
    return this.orders;
  }

  addOrder(order: OrderRecord): OrderRecord {
    this.orders.unshift(order);
    return order;
  }

  updateOrderStatus(orderId: string, status: OrderRecord['status']): boolean {
    const ord = this.orders.find((o) => o.id === orderId);
    if (!ord) return false;
    ord.status = status;
    return true;
  }

  deleteOrder(orderId: string): boolean {
    const prev = this.orders.length;
    this.orders = this.orders.filter((o) => o.id !== orderId);
    return this.orders.length < prev;
  }

  // Coupons
  getCoupons(): CouponCode[] {
    return this.coupons.filter((c) => !this.deletedCouponIds.has(c.id));
  }

  saveCoupon(coupon: Partial<CouponCode>): CouponCode {
    const id = coupon.id || `coup-${Date.now()}`;
    this.deletedCouponIds.delete(id);
    const idx = this.coupons.findIndex((c) => c.id === id || c.code.toUpperCase() === coupon.code?.toUpperCase());
    const item: CouponCode = {
      id,
      code: coupon.code?.toUpperCase() || `SAVE${Math.floor(Math.random() * 90 + 10)}`,
      discountType: coupon.discountType || 'percentage',
      discountValue: Number(coupon.discountValue) || 10,
      minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : undefined,
      maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : undefined,
      expiresAt: coupon.expiresAt || new Date(Date.now() + 30 * 86400000).toISOString(),
      isActive: coupon.isActive !== false,
      usageCount: coupon.usageCount || 0,
    };
    if (idx >= 0) {
      this.coupons[idx] = { ...this.coupons[idx], ...item };
      return this.coupons[idx];
    } else {
      this.coupons.push(item);
      return item;
    }
  }

  deleteCoupon(id: string): boolean {
    this.deletedCouponIds.add(id);
    const prev = this.coupons.length;
    this.coupons = this.coupons.filter((c) => c.id !== id);
    return this.coupons.length < prev;
  }

  // Banners
  getBanners(): BannerSlide[] {
    return this.banners.filter((b) => !this.deletedBannerIds.has(b.id));
  }

  saveBanner(banner: Partial<BannerSlide>): BannerSlide {
    const id = banner.id || `banner-${Date.now()}`;
    this.deletedBannerIds.delete(id);
    const idx = this.banners.findIndex((b) => b.id === id);
    const item: BannerSlide = {
      id,
      headlineAr: banner.headlineAr || 'عنوان البنر الإعلاني',
      subheadlineAr: banner.subheadlineAr || '',
      ctaPrimaryAr: banner.ctaPrimaryAr || 'تسوق الآن',
      ctaPrimaryLink: banner.ctaPrimaryLink || 'led-cob',
      ctaSecondaryAr: banner.ctaSecondaryAr || 'استكشف التشكيلة',
      ctaSecondaryLink: banner.ctaSecondaryLink || 'all',
      category: banner.category || 'led-cob',
      tagAr: banner.tagAr || '',
      badgeAr: banner.badgeAr || '',
      image: banner.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop',
      order: banner.order !== undefined ? Number(banner.order) : (idx >= 0 ? this.banners[idx].order : this.banners.length + 1),
      active: banner.active !== false,
    };

    if (idx >= 0) {
      this.banners[idx] = { ...this.banners[idx], ...item };
      return this.banners[idx];
    } else {
      this.banners.push(item);
      return item;
    }
  }

  deleteBanner(id: string): boolean {
    this.deletedBannerIds.add(id);
    const prev = this.banners.length;
    this.banners = this.banners.filter((b) => b.id !== id);
    return this.banners.length < prev;
  }
}

// Singleton global instance
const globalForStore = globalThis as unknown as { __ledline_repo__?: StoreDataRepository };
export const storeRepo = globalForStore.__ledline_repo__ || new StoreDataRepository();
if (process.env.NODE_ENV !== 'production') globalForStore.__ledline_repo__ = storeRepo;
