export type CategoryId =
  | 'all'
  | 'led-cob'
  | 'aluminum-profiles'
  | 'wood-panels'
  | 'magnetic-track'
  | 'pendant-modern'
  | 'outdoor-linear'
  | 'power-smart';

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
  category: CategoryId | string;
  categoryName: string;
  categoryNameEn: string;
  badge?: string;
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

export interface CustomerInfo {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
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
export type PaymentMethodType = 'mada' | 'applepay' | 'tamara' | 'cod';

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: CalculatedOrderItem[];
  summary: OrderFinancialSummary;
  paymentMethod: PaymentMethodType;
  status: OrderStatus;
  createdAt: string;
  notes?: string;
}

export interface CategoryData {
  id: string;
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
  expiresAt?: string;
  isActive: boolean;
  usageCount: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  outOfStockProducts: number;
  recentOrders: OrderRecord[];
}
