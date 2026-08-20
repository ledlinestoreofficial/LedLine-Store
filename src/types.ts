export interface BannerSlide {
  id: string;
  headlineAr: string;
  subheadlineAr?: string;
  ctaPrimaryAr: string;
  ctaPrimaryLink?: string;
  ctaSecondaryAr?: string;
  ctaSecondaryLink?: string;
  category?: CategoryId;
  tagAr?: string;
  badgeAr?: string;
  image: string;
  order?: number;
  active?: boolean;
}

export type CategoryId = 
  | 'all'
  | 'led-cob'
  | 'aluminum-profiles'
  | 'wood-panels'
  | 'magnetic-track'
  | 'pendant-modern'
  | 'outdoor-linear'
  | 'power-smart'
  | string;

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  originalPrice?: number;
  colorTemp?: '3000K' | '4000K' | '6500K' | 'RGBIC' | 'CCT Dimmable';
  finish?: string;
  lengthMeters?: number;
  dimensions?: string;
  inStock: boolean;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  nameEn: string;
  sku: string;
  category: CategoryId;
  categoryName: string;
  categoryNameEn: string;
  badge?: string; // e.g. "الأكثر مبيعاً", "جديد 2026", "عرض خاص"
  badgeEn?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  shortDescription: string;
  shortDescriptionEn: string;
  description: string;
  descriptionEn: string;
  images: string[];
  features: string[];
  featuresEn: string[];
  specs: {
    wattage?: string;
    voltage?: string;
    lumens?: string;
    cri?: string;
    ipRating?: string;
    warranty?: string;
    material?: string;
    dimensions?: string;
    colorTemp?: string;
  };
  variants?: ProductVariant[];
  colorOptions?: { name: string; hex: string; temp?: string }[];
  finishOptions?: { name: string; hex: string; textureUrl?: string }[];
  inStock: boolean;
  featured?: boolean;
  isSale?: boolean;
  stockCount?: number;
  createdAt?: string;
}

export interface CartItem {
  id: string; // unique item entry id
  productId: string;
  name: string;
  nameEn?: string;
  price: number;
  image: string;
  quantity: number;
  selectedColorTemp?: string;
  selectedFinish?: string;
  selectedLength?: number;
  selectedDimensions?: string;
  sku: string;
}

export interface FilterState {
  category: CategoryId;
  searchQuery: string;
  priceRange: [number, number];
  colorTemp: string[];
  woodFinishes: string[];
  onlyInStock: boolean;
  onlySale: boolean;
  sortBy: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating';
}

export interface LookbookHotspot {
  x: number; // percentage
  y: number; // percentage
  productId: string;
  title: string;
  titleEn: string;
  price: number;
}

export interface LookbookItem {
  id: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  image: string;
  hotspots: LookbookHotspot[];
}

export type PaymentMethodType = 'cod' | 'bank_transfer' | 'mada' | 'applepay' | 'tamara';

export interface BankAccount {
  id: string;
  name: string; // e.g. "بنك الكريمي", "بن دول باي", "محفظة قروشي", "البسيري", "بي كاش", "بنك أمجاد"
  type: 'bank' | 'wallet';
  accountName: string; // اسم صاحب الحساب / المستفيد
  accountNumber: string; // رقم الحساب أو رقم المحفظة
  iban?: string;
  instructions?: string; // تعليمات أو ملاحظات الإيداع
  logo?: string;
  isActive: boolean;
}

export interface CityDeliveryRate {
  id: string;
  governorate: string; // المحافظة
  city: string; // المدينة / المديرية
  fee: number; // رسوم التوصيل بالريال اليمني (YER)
  estimatedDays?: string; // مدة التوصيل التقريبية
  isActive: boolean;
}

export interface PaymentDeliverySettings {
  exchangeRateYER?: number; // سعر صرف الريال اليمني مقابل السعودي (مثال: 535)
  freeShippingThreshold?: number; // الحد الأدنى للشحن المجاني بالريال اليمني (0 يعني غير مفعل)
  defaultDeliveryFee: number; // رسوم التوصيل الافتراضية بالريال اليمني
  codEnabled: boolean;
  bankTransferEnabled: boolean;
  bankAccounts: BankAccount[];
  deliveryRates: CityDeliveryRate[];
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  governorate?: string;
  city: string;
  address: string;
  notes?: string;
}

export interface OrderItemRequest {
  productId: string;
  quantity: number;
  selectedColorTemp?: string;
  selectedFinish?: string;
  selectedLength?: number;
  selectedDimensions?: string;
  sku?: string;
}

export interface OrderCreationRequest {
  items: OrderItemRequest[];
  customer: CustomerInfo;
  paymentMethod: PaymentMethodType;
  couponCode?: string;
  depositReceiptUrl?: string;
  selectedBankId?: string;
  selectedBankName?: string;
}

export interface CalculatedOrderItem {
  productId: string;
  name: string;
  nameEn: string;
  sku: string;
  price: number;
  quantity: number;
  itemTotal: number;
  image: string;
  selectedColorTemp?: string;
  selectedFinish?: string;
}

export interface OrderFinancialSummary {
  subtotal: number;
  discountAmount: number;
  appliedCoupon?: string;
  shippingFee: number;
  finalTotal: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: CalculatedOrderItem[];
  summary: OrderFinancialSummary;
  paymentMethod: PaymentMethodType;
  depositReceiptUrl?: string;
  selectedBankId?: string;
  selectedBankName?: string;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderApiResponse {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  message?: string;
  orderDetails?: {
    orderNumber: string;
    itemsCount: number;
    subtotal: number;
    discountAmount: number;
    shippingFee: number;
    total: number;
    paymentMethod: PaymentMethodType;
    customerName: string;
    city: string;
    createdAt: string;
  };
  error?: string;
}

export interface CategoryData {
  id: CategoryId;
  name: string;
  nameEn: string;
  icon: string;
  count: number;
  image: string;
  description: string;
}

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
