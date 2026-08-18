import { Product, CategoryData, OrderRecord } from '../types';
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

// Clean Real Store State (Zero Dummy Data)
export const INITIAL_ORDERS: OrderRecord[] = [];
export const INITIAL_COUPONS: CouponCode[] = [];

// Global in-memory persistent cache for zero-downtime consistency
class StoreDataRepository {
  private products: Product[] = [...PRODUCTS];
  private categories: CategoryData[] = [...CATEGORIES];
  private orders: OrderRecord[] = [...INITIAL_ORDERS];
  private coupons: CouponCode[] = [...INITIAL_COUPONS];

  // Products
  getProducts(): Product[] {
    return this.products;
  }

  getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id || p.sku === id);
  }

  saveProduct(product: Partial<Product>): Product {
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
    const prevLen = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
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
    return this.categories;
  }

  saveCategory(category: Partial<CategoryData>): CategoryData {
    const id = category.id || `cat-${Date.now()}`;
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
    return this.coupons;
  }

  saveCoupon(coupon: Partial<CouponCode>): CouponCode {
    const id = coupon.id || `coup-${Date.now()}`;
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
    const prev = this.coupons.length;
    this.coupons = this.coupons.filter((c) => c.id !== id);
    return this.coupons.length < prev;
  }
}

// Singleton global instance
const globalForStore = globalThis as unknown as { __ledline_repo__?: StoreDataRepository };
export const storeRepo = globalForStore.__ledline_repo__ || new StoreDataRepository();
if (process.env.NODE_ENV !== 'production') globalForStore.__ledline_repo__ = storeRepo;
