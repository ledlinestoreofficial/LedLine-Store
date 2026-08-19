import 'server-only';
import { Product, OrderRecord, CategoryData, CouponCode } from '../types';
import { storeRepo } from './store-data';
import fs from 'fs';
import path from 'path';

export interface SanityConfig {
  projectId?: string;
  dataset: string;
  apiVersion: string;
  readToken?: string;
  writeToken?: string;
}

// In-Memory Fast Cache for Instant Navigation
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const queryCache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 2 * 1000; // 2s fast render deduplication

/**
 * Invalidate server cache when changes/mutations occur
 */
export function invalidateSanityCache(): void {
  queryCache.clear();
}

function cleanToken(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  let token = raw.trim();
  // Remove enclosing quotes
  token = token.replace(/^["']|["']$/g, '').trim();
  // Remove duplicated "Bearer " if user accidentally pasted it
  token = token.replace(/^Bearer\s+/i, '').trim();
  // Ignore obvious placeholders
  if (token.startsWith('MY_') || token.startsWith('YOUR_') || token.length < 10) {
    return undefined;
  }
  return token || undefined;
}

function cleanProjectId(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  let id = raw.trim().replace(/^["']|["']$/g, '').trim();
  if (id.startsWith('MY_') || id.startsWith('YOUR_') || id.length < 3) {
    return undefined;
  }
  return id || undefined;
}

function readEnvFileSafely(): Record<string, string> {
  const result: Record<string, string> = {};
  try {
    const candidates = [
      path.join(process.cwd(), '.env.local'),
      path.join(process.cwd(), '.env'),
    ];
    for (const file of candidates) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
            if (val && !result[key]) {
              result[key] = val;
            }
          }
        }
      }
    }
  } catch {
    // Non-fatal if fs is restricted
  }
  return result;
}

/**
 * Auto-detect and resolve Sanity configuration from environment variables
 */
export function getSanityServerConfig(): SanityConfig {
  const fileEnv = readEnvFileSafely();

  const rawProjectId = (
    process.env.SANITY_PROJECT_ID ||
    fileEnv.SANITY_PROJECT_ID ||
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    fileEnv.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    process.env.SANITY_STUDIO_PROJECT_ID ||
    fileEnv.SANITY_STUDIO_PROJECT_ID ||
    ''
  );

  const rawDataset = (
    process.env.SANITY_DATASET ||
    fileEnv.SANITY_DATASET ||
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    fileEnv.NEXT_PUBLIC_SANITY_DATASET ||
    process.env.SANITY_STUDIO_DATASET ||
    fileEnv.SANITY_STUDIO_DATASET ||
    'production'
  ).trim().replace(/^["']|["']$/g, '');

  const rawApiVersion = (
    process.env.SANITY_API_VERSION ||
    fileEnv.SANITY_API_VERSION ||
    process.env.NEXT_PUBLIC_SANITY_API_VERSION ||
    fileEnv.NEXT_PUBLIC_SANITY_API_VERSION ||
    '2024-03-01'
  ).trim().replace(/^["']|["']$/g, '');

  const rawWriteToken = (
    process.env.SANITY_WRITE_TOKEN ||
    fileEnv.SANITY_WRITE_TOKEN ||
    process.env.SANITY_TOKEN ||
    fileEnv.SANITY_TOKEN ||
    process.env.SANITY_API_TOKEN ||
    fileEnv.SANITY_API_TOKEN ||
    process.env.SANITY_AUTH_TOKEN ||
    fileEnv.SANITY_AUTH_TOKEN ||
    process.env.SANITY_API_WRITE_TOKEN ||
    fileEnv.SANITY_API_WRITE_TOKEN ||
    ''
  );

  const rawReadToken = (
    process.env.SANITY_READ_TOKEN ||
    fileEnv.SANITY_READ_TOKEN ||
    rawWriteToken ||
    process.env.SANITY_API_READ_TOKEN ||
    fileEnv.SANITY_API_READ_TOKEN ||
    ''
  );

  const projectId = cleanProjectId(rawProjectId);
  const writeToken = cleanToken(rawWriteToken);
  const readToken = cleanToken(rawReadToken);

  return {
    projectId,
    dataset: rawDataset || 'production',
    apiVersion: rawApiVersion || '2024-03-01',
    readToken,
    writeToken,
  };
}

/**
 * Check if Sanity is properly configured with live credentials
 */
export function getSanityConnectionStatus(): {
  isConnected: boolean;
  projectId?: string;
  dataset: string;
  hasWriteToken: boolean;
  hasReadToken: boolean;
} {
  const config = getSanityServerConfig();
  const isConnected = Boolean(config.projectId && config.writeToken);

  return {
    isConnected,
    projectId: config.projectId,
    dataset: config.dataset,
    hasWriteToken: Boolean(config.writeToken),
    hasReadToken: Boolean(config.readToken),
  };
}

/**
 * Robust Server-side Sanity GROQ Query with caching and resilient fallback
 */
export async function querySanityPrivate<T>(
  query: string,
  params: Record<string, unknown> = {}
): Promise<T | null> {
  const config = getSanityServerConfig();

  if (!config.projectId) {
    return null;
  }

  const cacheKey = `${config.projectId}-${query}-${JSON.stringify(params)}`;
  const cached = queryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS && cached.data !== null) {
    return cached.data as T;
  }

  const runFetch = async (authToken?: string) => {
    const url = new URL(
      `https://${config.projectId}.api.sanity.io/v${config.apiVersion}/data/query/${config.dataset}`
    );
    url.searchParams.set('query', query);
    Object.entries(params).forEach(([key, val]) => {
      url.searchParams.set(`$${key}`, JSON.stringify(val));
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s reliable network timeout

    try {
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers,
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return { ok: false, status: res.status, data: null };
      }

      const json = await res.json();
      return { ok: true, status: res.status, data: json.result as T };
    } catch {
      clearTimeout(timeoutId);
      return { ok: false, status: 500, data: null };
    }
  };

  try {
    const authToken = config.writeToken || config.readToken;
    if (authToken) {
      const authedRes = await runFetch(authToken);
      if (authedRes.ok && authedRes.data !== null) {
        queryCache.set(cacheKey, { data: authedRes.data, timestamp: Date.now() });
        return authedRes.data;
      }
    }

    // Try unauthenticated public GROQ query
    const publicRes = await runFetch();
    if (publicRes.ok && publicRes.data !== null) {
      queryCache.set(cacheKey, { data: publicRes.data, timestamp: Date.now() });
      return publicRes.data;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Server-only Sanity Mutation Helper using SANITY_WRITE_TOKEN
 */
export async function mutateSanityPrivate(
  mutations: Array<{
    create?: Record<string, unknown>;
    createOrReplace?: Record<string, unknown>;
    patch?: {
      id?: string;
      query?: string;
      set?: Record<string, unknown>;
      unset?: string[];
      inc?: Record<string, number>;
      dec?: Record<string, number>;
    };
    delete?: { id?: string; query?: string };
  }>
): Promise<{ transactionId: string } | null> {
  const config = getSanityServerConfig();

  if (!config.projectId || !config.writeToken) {
    console.warn('[Sanity Mutate] SANITY_PROJECT_ID or SANITY_WRITE_TOKEN missing.');
    return null;
  }

  try {
    const endpoint = `https://${config.projectId}.api.sanity.io/v${config.apiVersion}/data/mutate/${config.dataset}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.writeToken}`,
      },
      body: JSON.stringify({ mutations }),
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('[Sanity Notice] 401 Unauthorized - SANITY_WRITE_TOKEN is invalid or expired. Data has been safely stored in active store repository.');
      } else {
        const errText = await response.text();
        console.warn(`[Sanity Mutation Notice ${response.status}]:`, errText);
      }
      return null;
    }

    const result = await response.json();
    if (result && result.transactionId) {
      invalidateSanityCache();
      return result as { transactionId: string };
    }

    return null;
  } catch (error) {
    console.warn('[Sanity Mutation Notice]:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Upload an image asset directly to Sanity Image Assets API
 */
export async function uploadSanityImageAsset(
  imageSource: string | Buffer,
  filename: string = 'image.jpg',
  explicitMimeType?: string
): Promise<{ assetId: string; url: string; ref: string } | null> {
  const config = getSanityServerConfig();

  if (!config.projectId || !config.writeToken) {
    console.warn('[Sanity Upload Notice] Missing Project ID or Write Token');
    return null;
  }

  try {
    let mimeType = explicitMimeType || 'image/jpeg';
    let buffer: Buffer;

    if (Buffer.isBuffer(imageSource)) {
      buffer = imageSource;
    } else if (typeof imageSource === 'string' && imageSource.startsWith('data:')) {
      const matches = imageSource.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(imageSource.replace(/^data:[^;]+;base64,/, ''), 'base64');
      }
    } else if (typeof imageSource === 'string' && (imageSource.startsWith('http://') || imageSource.startsWith('https://'))) {
      // Remote URL - fetch it and upload to Sanity asset
      const remoteRes = await fetch(imageSource);
      if (!remoteRes.ok) return null;
      const remoteArrayBuffer = await remoteRes.arrayBuffer();
      buffer = Buffer.from(remoteArrayBuffer);
      const ct = remoteRes.headers.get('content-type');
      if (ct) mimeType = ct;
    } else if (typeof imageSource === 'string') {
      buffer = Buffer.from(imageSource, 'base64');
    } else {
      return null;
    }

    // Determine clean filename extension
    let cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    if (!cleanFilename.includes('.')) {
      const ext = mimeType.includes('png') ? '.png' : mimeType.includes('webp') ? '.webp' : '.jpg';
      cleanFilename += ext;
    }

    const uploadUrl = new URL(
      `https://${config.projectId}.api.sanity.io/v${config.apiVersion}/assets/images/${config.dataset}`
    );
    uploadUrl.searchParams.set('filename', cleanFilename);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s upload timeout

    const response = await fetch(uploadUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': mimeType,
        Authorization: `Bearer ${config.writeToken}`,
      },
      body: buffer,
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Sanity Image Upload Status ${response.status}]:`, errText);
      return null;
    }

    const result = await response.json();
    if (result && result.document) {
      return {
        assetId: result.document.assetId || result.document._id,
        url: result.document.url,
        ref: result.document._id,
      };
    }

    return null;
  } catch (err) {
    console.warn('[Sanity Image Upload Exception]:', err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Helper to map Sanity product document to client Product
 */
function mapSanityProduct(p: any): Product {
  let imgs: string[] = [];
  if (Array.isArray(p.images)) {
    imgs = p.images.filter((x: any) => typeof x === 'string' && x.trim() && !x.startsWith('[object'));
  }
  if (imgs.length === 0 && Array.isArray(p.imageUrlStrings)) {
    imgs = p.imageUrlStrings.filter((x: any) => typeof x === 'string' && x.trim() && !x.startsWith('[object'));
  }
  if (imgs.length === 0) {
    imgs = ['https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop'];
  }

  return {
    id: p.id || p._id,
    name: p.name || 'منتج إنارة',
    nameEn: p.nameEn || 'Lighting Product',
    sku: p.sku || 'LL-000',
    category: p.category || 'led-cob',
    categoryName: p.categoryName || 'أشرطة ليد COB',
    categoryNameEn: p.categoryNameEn || 'COB LED Strips',
    badge: p.badge,
    badgeEn: p.badgeEn,
    price: Number(p.price) || 0,
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
    rating: p.rating || 5,
    reviewsCount: p.reviewsCount || 1,
    shortDescription: p.shortDescription || '',
    shortDescriptionEn: p.shortDescriptionEn || '',
    description: p.description || '',
    descriptionEn: p.descriptionEn || '',
    images: imgs,
    features: p.features || [],
    featuresEn: p.featuresEn || [],
    specs: p.specs || {},
    variants: p.variants || [],
    colorOptions: p.colorOptions || [],
    finishOptions: p.finishOptions || [],
    inStock: p.inStock !== false,
    featured: Boolean(p.featured),
    isSale: Boolean(p.isSale),
    stockCount: p.stockCount !== undefined ? Number(p.stockCount) : 50,
  };
}

const PRODUCT_GROQ_FIELDS = `
  "id": _id,
  name,
  nameEn,
  sku,
  category,
  categoryName,
  categoryNameEn,
  badge,
  badgeEn,
  price,
  originalPrice,
  rating,
  reviewsCount,
  shortDescription,
  shortDescriptionEn,
  description,
  descriptionEn,
  "images": coalesce(images[].asset->url, imageUrlStrings, []),
  imageUrlStrings,
  features,
  featuresEn,
  specs,
  variants,
  colorOptions,
  finishOptions,
  inStock,
  featured,
  isSale,
  stockCount,
  "_createdAt": _createdAt
`;

/**
 * Fetch products from Sanity (with fallback to repository)
 */
export async function getSanityProducts(category?: string, search?: string): Promise<Product[]> {
  const query = `*[_type == "product"] | order(_createdAt desc) { ${PRODUCT_GROQ_FIELDS} }`;
  const sanityProducts = await querySanityPrivate<any[]>(query);

  let rawList: Product[] = [];
  if (sanityProducts && sanityProducts.length > 0) {
    const mapped = sanityProducts.map(mapSanityProduct);
    const repoItems = storeRepo.getProducts();
    const sanitySkus = new Set(mapped.map((m) => m.sku));
    const sanityIds = new Set(mapped.map((m) => m.id));
    const extraRepo = repoItems.filter((r) => !sanitySkus.has(r.sku) && !sanityIds.has(r.id));
    rawList = [...mapped, ...extraRepo];
  } else {
    rawList = storeRepo.getProducts();
  }

  let products = rawList;
  if (category && category !== 'all') {
    products = products.filter((p) => p.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }

  return products;
}

/**
 * Admin Product Fetcher (alias)
 */
export async function adminGetProducts(): Promise<Product[]> {
  return getSanityProducts();
}

/**
 * Fetch single product by ID or SKU
 */
export async function getSanityProductById(productId: string): Promise<Product | null> {
  const query = `*[_type == "product" && (_id == $id || sku == $id)][0] { ${PRODUCT_GROQ_FIELDS} }`;
  const sanityProduct = await querySanityPrivate<any>(query, { id: productId });

  if (sanityProduct) {
    return mapSanityProduct(sanityProduct);
  }

  return storeRepo.getProductById(productId) || null;
}

/**
 * Admin Orders Fetcher
 */
export async function adminGetOrders(): Promise<OrderRecord[]> {
  const query = `*[_type == "order"] | order(createdAt desc, _createdAt desc) {
    "id": _id,
    orderNumber,
    customer,
    items,
    summary,
    paymentMethod,
    status,
    createdAt
  }`;

  const orders = await querySanityPrivate<OrderRecord[]>(query);
  if (orders && orders.length > 0) {
    const repoOrders = storeRepo.getOrders();
    const sanityIds = new Set(orders.map((o) => o.orderNumber));
    const extraRepo = repoOrders.filter((r) => !sanityIds.has(r.orderNumber));
    return [...orders, ...extraRepo];
  }

  return storeRepo.getOrders();
}

/**
 * Categories Fetcher
 */
export async function getSanityCategories(): Promise<CategoryData[]> {
  const [products, rawCategories] = await Promise.all([
    getSanityProducts(),
    querySanityPrivate<CategoryData[]>(`*[_type == "category"] | order(_createdAt asc) {
      "id": _id,
      name,
      nameEn,
      icon,
      count,
      "image": coalesce(image.asset->url, imageUrl, image, ""),
      description
    }`),
  ]);

  const defaultCategories = storeRepo.getCategories();
  let baseCategories: CategoryData[] = [];

  if (rawCategories && rawCategories.length > 0) {
    // Map fetched categories
    const sanityMap = new Map(rawCategories.map((c) => [c.id, c]));
    // Merge defaults so standard category ids maintain icons/images if not set
    const merged = rawCategories.map((c) => {
      const def = defaultCategories.find((d) => d.id === c.id);
      return {
        ...c,
        image: c.image || def?.image || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
        icon: c.icon || def?.icon || 'Sparkles',
        nameEn: c.nameEn || def?.nameEn || c.name,
      };
    });

    // Also include any default categories not in Sanity yet
    const missingDefaults = defaultCategories.filter((d) => !sanityMap.has(d.id));
    baseCategories = [...merged, ...missingDefaults];
  } else {
    baseCategories = defaultCategories;
  }

  // Compute real actual count for each category based on live products
  return baseCategories.map((cat) => {
    const realCount = cat.id === 'all'
      ? products.length
      : products.filter((p) => p.category === cat.id).length;
    return {
      ...cat,
      count: realCount,
    };
  });
}

export async function adminGetCategories(): Promise<CategoryData[]> {
  return getSanityCategories();
}

/**
 * Coupons Fetcher
 */
export async function adminGetCoupons(): Promise<CouponCode[]> {
  const query = `*[_type == "coupon"] | order(_createdAt desc) {
    "id": _id,
    code,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    expiresAt,
    isActive,
    usageCount
  }`;

  const coupons = await querySanityPrivate<CouponCode[]>(query);
  if (coupons && coupons.length > 0) {
    return coupons;
  }
  return storeRepo.getCoupons();
}

/**
 * Create Order in Sanity
 */
export async function createSanityOrder(order: OrderRecord): Promise<{ success: boolean; transactionId?: string }> {
  storeRepo.addOrder(order);

  const orderDoc = {
    _type: 'order',
    _id: `order-${order.orderNumber.toLowerCase()}`,
    orderNumber: order.orderNumber,
    customer: {
      fullName: order.customer.fullName,
      phone: order.customer.phone,
      city: order.customer.city,
      address: order.customer.address,
      notes: order.customer.notes || '',
    },
    items: order.items.map((item) => ({
      _key: `${item.productId}-${Date.now()}`,
      productId: item.productId,
      name: item.name,
      nameEn: item.nameEn,
      sku: item.sku,
      price: item.price,
      quantity: item.quantity,
      itemTotal: item.itemTotal,
      selectedColorTemp: item.selectedColorTemp || null,
      selectedFinish: item.selectedFinish || null,
    })),
    summary: {
      subtotal: order.summary.subtotal,
      discountAmount: order.summary.discountAmount,
      appliedCoupon: order.summary.appliedCoupon || null,
      shippingFee: order.summary.shippingFee,
      finalTotal: order.summary.finalTotal,
    },
    paymentMethod: order.paymentMethod,
    status: order.status,
    createdAt: order.createdAt,
  };

  const mutationResult = await mutateSanityPrivate([
    {
      createOrReplace: orderDoc,
    },
  ]);

  return {
    success: true,
    transactionId: mutationResult?.transactionId || `local-${Date.now()}`,
  };
}
