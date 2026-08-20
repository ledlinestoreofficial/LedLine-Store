import { Product, CategoryData, OrderRecord, BannerSlide, BankAccount, CityDeliveryRate, PaymentDeliverySettings } from '../types';
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

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank-kuraimi',
    name: 'بنك الكريمي للتمويل الأصغر الإسلامي',
    type: 'bank',
    accountName: 'متجر ليد لاين للإنارة المعمارية',
    accountNumber: '3012456789',
    instructions: 'يرجى كتابة رقم الطلب واسم العميل في خانة الغرض/الملاحظات، ورفع صورة الإشعار هنا.',
    isActive: true,
  },
  {
    id: 'wallet-qurooshi',
    name: 'محفظة قروشي (Qurooshi)',
    type: 'wallet',
    accountName: 'ليد لاين لايتنج',
    accountNumber: '771987654',
    instructions: 'تحويل فوري عبر تطبيق قروشي، ثم إرفاق صورة السند/الإشعار.',
    isActive: true,
  },
  {
    id: 'wallet-bcash',
    name: 'محفظة بي كاش (B-Cash)',
    type: 'wallet',
    accountName: 'LED LINE Store',
    accountNumber: '780554433',
    instructions: 'تحويل عبر تطبيق بي كاش مع إرفاق لقطة شاشة السند.',
    isActive: true,
  },
  {
    id: 'bank-bindowal',
    name: 'بن دول باي (Bin Dowal Pay)',
    type: 'wallet',
    accountName: 'مؤسسة ليد لاين التجارية',
    accountNumber: '770123456',
    instructions: 'إيداع أو تحويل عبر بن دول باي برقم الحساب أعلاه.',
    isActive: true,
  },
  {
    id: 'bank-busairi',
    name: 'شركة البسيري للصرافة والتحويلات',
    type: 'bank',
    accountName: 'متجر ليد لاين للإنارة',
    accountNumber: '2580123',
    instructions: 'إيداع نقدي عبر أي فرع للبسيري أو تحويل حساب لحساب.',
    isActive: true,
  },
  {
    id: 'bank-amjad',
    name: 'بنك أمجاد للتمويل الأصغر',
    type: 'bank',
    accountName: 'متجر ليد لاين للإنارة المعمارية',
    accountNumber: '4401298',
    instructions: 'تحويل بنكي أو إيداع مباشر في حساب متجر ليد لاين.',
    isActive: true,
  },
  {
    id: 'bank-qutaibi',
    name: 'بنك القطيبي الإسلامي',
    type: 'bank',
    accountName: 'ليد لاين لايتنج',
    accountNumber: '1204456',
    instructions: 'تحويل عبر تطبيق القطيبي لحظات أو إيداع شباك.',
    isActive: true,
  },
  {
    id: 'wallet-jeeb',
    name: 'محفظة جيب (Jeeb Wallet)',
    type: 'wallet',
    accountName: 'متجر ليد لاين',
    accountNumber: '774112233',
    instructions: 'تحويل عبر تطبيق جيب وإرفاق إشعار الدفع.',
    isActive: true,
  },
];

export const INITIAL_DELIVERY_RATES: CityDeliveryRate[] = [
  // حضرموت (الساحل والوادي) - الأسعار بالريال اليمني
  { id: 'rate-mukalla', governorate: 'حضرموت', city: 'المكلا', fee: 2000, estimatedDays: 'خلال 24 ساعة', isActive: true },
  { id: 'rate-shihr', governorate: 'حضرموت', city: 'الشحر', fee: 2500, estimatedDays: 'خلال 24-48 ساعة', isActive: true },
  { id: 'rate-ghayl', governorate: 'حضرموت', city: 'غيل باوزير', fee: 2500, estimatedDays: 'خلال 24-48 ساعة', isActive: true },
  { id: 'rate-seiyun', governorate: 'حضرموت', city: 'سيئون', fee: 3000, estimatedDays: 'خلال 1-2 يوم', isActive: true },
  { id: 'rate-tarim', governorate: 'حضرموت', city: 'تريم', fee: 3000, estimatedDays: 'خلال 1-2 يوم', isActive: true },
  { id: 'rate-shibam', governorate: 'حضرموت', city: 'شبام', fee: 3000, estimatedDays: 'خلال 1-2 يوم', isActive: true },
  { id: 'rate-dis', governorate: 'حضرموت', city: 'الديس الشرقية', fee: 3000, estimatedDays: 'خلال 1-2 يوم', isActive: true },
  { id: 'rate-qatn', governorate: 'حضرموت', city: 'القطن', fee: 3500, estimatedDays: 'خلال 2-3 أيام', isActive: true },
  { id: 'rate-dawen', governorate: 'حضرموت', city: 'دوعن', fee: 3500, estimatedDays: 'خلال 2-3 أيام', isActive: true },
  
  // عدن
  { id: 'rate-aden-mualla', governorate: 'عدن', city: 'المعلا', fee: 3500, estimatedDays: 'خلال 2-3 أيام', isActive: true },
  { id: 'rate-aden-crater', governorate: 'عدن', city: 'كريتر (صيرة)', fee: 3500, estimatedDays: 'خلال 2-3 أيام', isActive: true },
  { id: 'rate-aden-khormaksar', governorate: 'عدن', city: 'خور مكسر', fee: 3500, estimatedDays: 'خلال 2-3 أيام', isActive: true },
  { id: 'rate-aden-mansoura', governorate: 'عدن', city: 'المنصورة', fee: 3500, estimatedDays: 'خلال 2-3 أيام', isActive: true },
  { id: 'rate-aden-sheikh', governorate: 'عدن', city: 'الشيخ عثمان', fee: 3500, estimatedDays: 'خلال 2-3 أيام', isActive: true },
  { id: 'rate-aden-inma', governorate: 'عدن', city: 'مدينة إنماء', fee: 3500, estimatedDays: 'خلال 2-3 أيام', isActive: true },
  { id: 'rate-aden-buraiqeh', governorate: 'عدن', city: 'البريقة', fee: 4000, estimatedDays: 'خلال 2-3 أيام', isActive: true },

  // صنعاء
  { id: 'rate-sanaa-capital', governorate: 'صنعاء (الأمانة والمحافظة)', city: 'صنعاء (أمانة العاصمة)', fee: 3500, estimatedDays: 'خلال 2-3 أيام', isActive: true },
  { id: 'rate-sanaa-hadda', governorate: 'صنعاء (الأمانة والمحافظة)', city: 'حدة', fee: 3500, estimatedDays: 'خلال 2-3 أيام', isActive: true },
  { id: 'rate-sanaa-sabeen', governorate: 'صنعاء (الأمانة والمحافظة)', city: 'السبعين', fee: 3500, estimatedDays: 'خلال 2-3 أيام', isActive: true },
  { id: 'rate-sanaa-tahreer', governorate: 'صنعاء (الأمانة والمحافظة)', city: 'التحرير', fee: 3500, estimatedDays: 'خلال 2-3 أيام', isActive: true },
  { id: 'rate-sanaa-hasaba', governorate: 'صنعاء (الأمانة والمحافظة)', city: 'الحصبة', fee: 3500, estimatedDays: 'خلال 2-3 أيام', isActive: true },

  // تعز
  { id: 'rate-taiz-city', governorate: 'تعز', city: 'تعز (وسط المدينة)', fee: 4000, estimatedDays: 'خلال 2-4 أيام', isActive: true },
  { id: 'rate-taiz-hawban', governorate: 'تعز', city: 'الحوبان', fee: 4000, estimatedDays: 'خلال 2-4 أيام', isActive: true },
  { id: 'rate-taiz-turbah', governorate: 'تعز', city: 'التربة', fee: 4500, estimatedDays: 'خلال 3-5 أيام', isActive: true },

  // المهرة
  { id: 'rate-mahra-ghaydah', governorate: 'المهرة', city: 'الغيضة', fee: 4500, estimatedDays: 'خلال 2-4 أيام', isActive: true },
  { id: 'rate-mahra-shahanna', governorate: 'المهرة', city: 'شحن', fee: 5000, estimatedDays: 'خلال 3-5 أيام', isActive: true },

  // مأرب وشبوة
  { id: 'rate-marib-city', governorate: 'مأرب', city: 'مأرب (المدينة)', fee: 4000, estimatedDays: 'خلال 2-4 أيام', isActive: true },
  { id: 'rate-shabwa-ataq', governorate: 'شبوة', city: 'عتق', fee: 4000, estimatedDays: 'خلال 2-4 أيام', isActive: true },

  // الحديدة وإب
  { id: 'rate-hodeida-city', governorate: 'الحديدة', city: 'الحديدة (وسط المدينة)', fee: 4000, estimatedDays: 'خلال 3-5 أيام', isActive: true },
  { id: 'rate-ibb-city', governorate: 'إب', city: 'إب (المدينة)', fee: 4000, estimatedDays: 'خلال 3-5 أيام', isActive: true },
];

export const INITIAL_PAYMENT_SETTINGS: PaymentDeliverySettings = {
  exchangeRateYER: 535,
  freeShippingThreshold: 150000,
  defaultDeliveryFee: 3000,
  codEnabled: true,
  bankTransferEnabled: true,
  bankAccounts: [...INITIAL_BANK_ACCOUNTS],
  deliveryRates: [...INITIAL_DELIVERY_RATES],
};

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
  private bankAccounts: BankAccount[] = [...INITIAL_BANK_ACCOUNTS];
  private deliveryRates: CityDeliveryRate[] = [...INITIAL_DELIVERY_RATES];
  private freeShippingThreshold: number = 350;
  private defaultDeliveryFee: number = 25;
  private codEnabled: boolean = true;
  private bankTransferEnabled: boolean = true;

  private deletedProductIds: Set<string> = new Set();
  private deletedBannerIds: Set<string> = new Set();
  private deletedCategoryIds: Set<string> = new Set();
  private deletedCouponIds: Set<string> = new Set();
  private deletedBankIds: Set<string> = new Set();
  private deletedRateIds: Set<string> = new Set();

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

  isCategoryDeleted(id: string): boolean {
    return this.deletedCategoryIds.has(id);
  }

  isProductDeleted(id: string): boolean {
    return this.deletedProductIds.has(id);
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

  // Payment & Delivery Settings
  getPaymentSettings(): PaymentDeliverySettings {
    return {
      freeShippingThreshold: this.freeShippingThreshold,
      defaultDeliveryFee: this.defaultDeliveryFee,
      codEnabled: this.codEnabled,
      bankTransferEnabled: this.bankTransferEnabled,
      bankAccounts: this.getBankAccounts(),
      deliveryRates: this.getDeliveryRates(),
    };
  }

  updatePaymentSettings(settings: Partial<PaymentDeliverySettings>): PaymentDeliverySettings {
    if (settings.freeShippingThreshold !== undefined) {
      this.freeShippingThreshold = Number(settings.freeShippingThreshold);
    }
    if (settings.defaultDeliveryFee !== undefined) {
      this.defaultDeliveryFee = Number(settings.defaultDeliveryFee);
    }
    if (settings.codEnabled !== undefined) {
      this.codEnabled = Boolean(settings.codEnabled);
    }
    if (settings.bankTransferEnabled !== undefined) {
      this.bankTransferEnabled = Boolean(settings.bankTransferEnabled);
    }
    return this.getPaymentSettings();
  }

  // Bank Accounts
  getBankAccounts(): BankAccount[] {
    return this.bankAccounts.filter((b) => !this.deletedBankIds.has(b.id));
  }

  saveBankAccount(account: Partial<BankAccount>): BankAccount {
    const id = account.id || `bank-${Date.now()}`;
    this.deletedBankIds.delete(id);
    const idx = this.bankAccounts.findIndex((b) => b.id === id);
    const item: BankAccount = {
      id,
      name: account.name || 'حساب بنكي / محفظة جديدة',
      type: account.type || 'bank',
      accountName: account.accountName || 'متجر ليد لاين',
      accountNumber: account.accountNumber || '',
      iban: account.iban || '',
      instructions: account.instructions || '',
      logo: account.logo,
      isActive: account.isActive !== false,
    };

    if (idx >= 0) {
      this.bankAccounts[idx] = { ...this.bankAccounts[idx], ...item };
      return this.bankAccounts[idx];
    } else {
      this.bankAccounts.push(item);
      return item;
    }
  }

  deleteBankAccount(id: string): boolean {
    this.deletedBankIds.add(id);
    const prev = this.bankAccounts.length;
    this.bankAccounts = this.bankAccounts.filter((b) => b.id !== id);
    return this.bankAccounts.length < prev;
  }

  // Delivery Rates
  getDeliveryRates(): CityDeliveryRate[] {
    return this.deliveryRates.filter((r) => !this.deletedRateIds.has(r.id));
  }

  getDeliveryFee(governorate?: string, city?: string, subtotal?: number): number {
    if (subtotal !== undefined && this.freeShippingThreshold > 0 && subtotal >= this.freeShippingThreshold) {
      return 0;
    }

    if (!city) {
      return this.defaultDeliveryFee;
    }

    const rates = this.getDeliveryRates();
    // Try exact city match
    const matched = rates.find((r) => r.isActive && (
      r.city.trim().toLowerCase() === city.trim().toLowerCase() ||
      city.trim().toLowerCase().includes(r.city.trim().toLowerCase()) ||
      r.city.trim().toLowerCase().includes(city.trim().toLowerCase())
    ));

    if (matched) {
      return matched.fee;
    }

    // Try governorate match
    if (governorate) {
      const govMatched = rates.find((r) => r.isActive && r.governorate.trim().toLowerCase() === governorate.trim().toLowerCase());
      if (govMatched) return govMatched.fee;
    }

    return this.defaultDeliveryFee;
  }

  saveDeliveryRate(rate: Partial<CityDeliveryRate>): CityDeliveryRate {
    const id = rate.id || `rate-${Date.now()}`;
    this.deletedRateIds.delete(id);
    const idx = this.deliveryRates.findIndex((r) => r.id === id);
    const item: CityDeliveryRate = {
      id,
      governorate: rate.governorate || 'حضرموت',
      city: rate.city || 'المدينة',
      fee: Number(rate.fee) >= 0 ? Number(rate.fee) : 25,
      estimatedDays: rate.estimatedDays || 'خلال 24-48 ساعة',
      isActive: rate.isActive !== false,
    };

    if (idx >= 0) {
      this.deliveryRates[idx] = { ...this.deliveryRates[idx], ...item };
      return this.deliveryRates[idx];
    } else {
      this.deliveryRates.push(item);
      return item;
    }
  }

  deleteDeliveryRate(id: string): boolean {
    this.deletedRateIds.add(id);
    const prev = this.deliveryRates.length;
    this.deliveryRates = this.deliveryRates.filter((r) => r.id !== id);
    return this.deliveryRates.length < prev;
  }
}

// Singleton global instance
const globalForStore = globalThis as unknown as { __ledline_repo__?: StoreDataRepository };
export const storeRepo = globalForStore.__ledline_repo__ || new StoreDataRepository();
if (process.env.NODE_ENV !== 'production') globalForStore.__ledline_repo__ = storeRepo;
