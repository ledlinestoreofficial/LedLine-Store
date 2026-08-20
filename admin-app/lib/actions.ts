'use server';

import { revalidatePath } from 'next/cache';
import { mutateSanityPrivate, uploadSanityImageAsset, invalidateSanityCache, getSanityConnectionStatus } from './sanity.server';
import { Product, OrderStatus, CategoryData, CouponCode, BannerSlide } from '../types';
import { storeRepo } from '@/src/lib/store-data';
import { GoogleGenAI } from '@google/genai';

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
  transactionId?: string;
}

/**
 * Check live Sanity connection status for UI display
 */
export async function getSanityStatusAction(): Promise<{
  isConnected: boolean;
  projectId?: string;
  dataset: string;
  hasWriteToken: boolean;
}> {
  return getSanityConnectionStatus();
}

/**
 * Real translation of Arabic product title to English using Gemini API
 */
export async function translateArabicToEnglishAction(
  arabicText: string
): Promise<{ success: boolean; translation?: string; error?: string }> {
  if (!arabicText || !arabicText.trim()) {
    return { success: true, translation: '' };
  }

  const trimmed = arabicText.trim();

  // Try Gemini AI translation if API key is present
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `Translate the following Arabic product name into a professional, concise, commercial English product title suitable for an e-commerce catalog (architectural lighting, LED strips, aluminum profiles, modern wood wall panels). 
Rules:
1. Translate the EXACT meaning of the Arabic words directly. Do not substitute with unrelated generic names.
2. Keep technical terms, units, and codes intact (e.g. COB, LED, 24V, 48V, 3000K, IP65, 10W/m, 20x10mm).
3. Capitalize the first letter of major words (Title Case).
4. Output ONLY the translated English title text without any quotes, markdown formatting, or explanations.

Arabic title to translate: "${trimmed}"`,
      });

      const translated = response.text?.trim().replace(/^["']|["']$/g, '');
      if (translated) {
        return { success: true, translation: translated };
      }
    } catch (aiErr) {
      console.warn('Gemini translation fallback:', aiErr);
    }
  }

  // Graceful fallback to accurate lighting lexicon translator
  const { autoTranslateLightingName } = await import('./auto-translate');
  const fallbackTranslation = autoTranslateLightingName(trimmed);
  return { success: true, translation: fallbackTranslation };
}

/**
 * Create or Replace a Product in Sanity and local repository
 */
export async function saveProductAction(productData: Partial<Product>): Promise<ActionResult> {
  try {
    const isEdit = Boolean(productData.id);
    const docId = isEdit ? productData.id! : `product-${Date.now()}`;

    // Process and upload any local base64 images directly to Sanity Image Assets
    const inputImages = productData.images || [];
    const imageRefs: Array<{ _key: string; _type: 'image'; asset: { _type: 'reference'; _ref: string } }> = [];
    const finalImageUrls: string[] = [];

    for (let i = 0; i < inputImages.length; i++) {
      const img = inputImages[i];
      if (typeof img === 'string' && img.startsWith('data:image/')) {
        const uploaded = await uploadSanityImageAsset(
          img,
          `${productData.sku || 'product'}-img-${i + 1}.jpg`
        );
        if (uploaded) {
          imageRefs.push({
            _key: `img-${Date.now()}-${i}`,
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: uploaded.ref,
            },
          });
          finalImageUrls.push(uploaded.url);
        } else {
          finalImageUrls.push(img);
        }
      } else if (typeof img === 'string' && img.trim()) {
        finalImageUrls.push(img.trim());
      }
    }

    const resolvedImages = finalImageUrls.length > 0
      ? finalImageUrls
      : ['https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop'];

    const savedInRepo = storeRepo.saveProduct({
      ...productData,
      id: docId,
      images: resolvedImages,
    });

    const doc: Record<string, unknown> = {
      _type: 'product',
      _id: docId,
      name: savedInRepo.name,
      nameEn: savedInRepo.nameEn,
      sku: savedInRepo.sku,
      category: savedInRepo.category,
      categoryName: savedInRepo.categoryName,
      categoryNameEn: savedInRepo.categoryNameEn,
      badge: savedInRepo.badge || '',
      badgeEn: savedInRepo.badgeEn || '',
      price: savedInRepo.price,
      originalPrice: savedInRepo.originalPrice,
      rating: savedInRepo.rating || 5,
      reviewsCount: savedInRepo.reviewsCount || 1,
      shortDescription: savedInRepo.shortDescription || '',
      shortDescriptionEn: savedInRepo.shortDescriptionEn || '',
      description: savedInRepo.description || '',
      descriptionEn: savedInRepo.descriptionEn || '',
      features: savedInRepo.features || [],
      featuresEn: savedInRepo.featuresEn || [],
      specs: savedInRepo.specs || {},
      inStock: savedInRepo.inStock,
      featured: savedInRepo.featured,
      isSale: savedInRepo.isSale,
      stockCount: savedInRepo.stockCount,
      imageUrlStrings: resolvedImages,
      images: imageRefs.length > 0 ? imageRefs : undefined,
      updatedAt: new Date().toISOString(),
    };

    // Execute Sanity mutation
    const sanityResult = await mutateSanityPrivate([
      {
        createOrReplace: {
          ...doc,
          image: imageRefs.length > 0 ? imageRefs[0] : undefined,
          mainImage: imageRefs.length > 0 ? imageRefs[0] : undefined,
        },
      },
    ]);

    invalidateSanityCache();
    revalidatePath('/', 'layout');
    revalidatePath('/admin/products');
    revalidatePath('/admin/inventory');
    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath('/');

    const isConnected = Boolean(sanityResult?.transactionId);
    const msg = isEdit
      ? (isConnected ? `تم تحديث المنتج في قاعدة بيانات Sanity والمتجر بنجاح (معاملة: ${sanityResult?.transactionId})` : 'تم حفظ وتحديث المنتج بنجاح في المتجر')
      : (isConnected ? `تم رفع ونشر المنتج مباشرة في قاعدة بيانات Sanity السحابية بنجاح (معاملة: ${sanityResult?.transactionId})` : 'تم حفظ المنتج بنجاح في المتجر');

    return {
      success: true,
      message: msg,
      transactionId: sanityResult?.transactionId || `tx-${Date.now()}`,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'خطأ غير معروف';
    return { success: false, error: `استثناء: ${msg}` };
  }
}

/**
 * Delete a Product by ID
 */
export async function deleteProductAction(productId: string): Promise<ActionResult> {
  try {
    if (!productId) {
      return { success: false, error: 'معرف المنتج غير صالح' };
    }

    // 1. Remove from local repository permanently
    storeRepo.deleteProduct(productId);

    // 2. Delete from Sanity (both published document and any drafts)
    const baseId = productId.startsWith('drafts.') ? productId.replace('drafts.', '') : productId;
    const idsToDelete = [baseId, `drafts.${baseId}`];

    const sanityResult = await mutateSanityPrivate(
      idsToDelete.map((id) => ({
        delete: { id },
      }))
    );

    invalidateSanityCache();
    revalidatePath('/', 'layout');
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/inventory');
    revalidatePath('/admin');
    revalidatePath('/');

    return {
      success: true,
      message: 'تم حذف المنتج نهائياً من Sanity والمتجر',
      transactionId: sanityResult?.transactionId || `del-${Date.now()}`,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'خطأ غير متوقع';
    return { success: false, error: msg };
  }
}

/**
 * Update Product Stock Status
 */
export async function updateProductStockAction(
  productId: string,
  inStock: boolean,
  stockCount?: number
): Promise<ActionResult> {
  try {
    storeRepo.updateStock(productId, inStock, stockCount);

    const patchSet: Record<string, unknown> = { inStock };
    if (stockCount !== undefined) {
      patchSet.stockCount = Number(stockCount);
    }

    await mutateSanityPrivate([
      {
        patch: {
          id: productId,
          set: patchSet,
        },
      },
    ]);

    invalidateSanityCache();
    revalidatePath('/products');
    revalidatePath('/inventory');
    revalidatePath('/');

    return { success: true, message: 'تم تحديث حالة المخزون بنجاح' };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'خطأ غير معروف';
    return { success: false, error: msg };
  }
}

/**
 * Update Order Status
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus
): Promise<ActionResult> {
  try {
    if (!orderId) {
      return { success: false, error: 'معرف الطلب غير صالح' };
    }

    storeRepo.updateOrderStatus(orderId, newStatus);

    await mutateSanityPrivate([
      {
        patch: {
          id: orderId,
          set: {
            status: newStatus,
            updatedAt: new Date().toISOString(),
          },
        },
      },
    ]);

    invalidateSanityCache();
    revalidatePath('/orders');
    revalidatePath('/');

    return {
      success: true,
      message: `تم تحديث حالة الطلب إلى "${newStatus}" بنجاح`,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'خطأ في معالجة الطلب';
    return { success: false, error: msg };
  }
}

/**
 * Delete Order Record
 */
export async function deleteOrderAction(orderId: string): Promise<ActionResult> {
  try {
    storeRepo.deleteOrder(orderId);

    await mutateSanityPrivate([
      {
        delete: { id: orderId },
      },
    ]);

    invalidateSanityCache();
    revalidatePath('/orders');
    revalidatePath('/');

    return { success: true, message: 'تم حذف سجل الطلب بنجاح' };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'خطأ غير معروف';
    return { success: false, error: msg };
  }
}

/**
 * Save Category Action
 */
export async function saveCategoryAction(category: Partial<CategoryData>): Promise<ActionResult> {
  try {
    const docId = category.id || `cat-${Date.now()}`;
    let resolvedImage = category.image || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop';
    let imageRef: { _type: 'image'; asset: { _type: 'reference'; _ref: string } } | undefined = undefined;

    // Upload base64 image if present
    if (category.image && typeof category.image === 'string' && category.image.startsWith('data:image/')) {
      const uploaded = await uploadSanityImageAsset(
        category.image,
        `${category.id || 'cat'}-image.jpg`
      );
      if (uploaded) {
        resolvedImage = uploaded.url;
        imageRef = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: uploaded.ref,
          },
        };
      }
    }

    const saved = storeRepo.saveCategory({
      ...category,
      id: docId,
      image: resolvedImage,
    });

    const doc: Record<string, unknown> = {
      _type: 'category',
      _id: docId,
      name: saved.name,
      nameEn: saved.nameEn || saved.name,
      icon: saved.icon || 'Sparkles',
      description: saved.description || '',
      count: saved.count || 0,
      imageUrl: resolvedImage,
      image: imageRef || resolvedImage,
      updatedAt: new Date().toISOString(),
    };

    const sanityResult = await mutateSanityPrivate([
      {
        createOrReplace: doc,
      },
    ]);

    invalidateSanityCache();
    revalidatePath('/', 'layout');
    revalidatePath('/categories');
    revalidatePath('/admin/categories');
    revalidatePath('/admin');
    revalidatePath('/');

    return {
      success: true,
      message: 'تم حفظ القسم ورفع صورته بنجاح إلى Sanity',
      transactionId: sanityResult?.transactionId,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'خطأ غير معروف';
    return { success: false, error: msg };
  }
}

/**
 * Delete Category Action
 */
export async function deleteCategoryAction(categoryId: string): Promise<ActionResult> {
  try {
    storeRepo.deleteCategory(categoryId);

    await mutateSanityPrivate([
      {
        delete: { id: categoryId },
      },
    ]);

    invalidateSanityCache();
    revalidatePath('/', 'layout');
    revalidatePath('/categories');
    revalidatePath('/admin/categories');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, message: 'تم حذف القسم بنجاح' };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'خطأ غير معروف';
    return { success: false, error: msg };
  }
}

/**
 * Save Coupon Code Action
 */
export async function saveCouponAction(coupon: Partial<CouponCode>): Promise<ActionResult> {
  try {
    const saved = storeRepo.saveCoupon(coupon);

    const docId = saved.id;
    const doc = {
      _type: 'coupon',
      _id: docId,
      code: saved.code,
      discountType: saved.discountType,
      discountValue: saved.discountValue,
      minOrderAmount: saved.minOrderAmount,
      maxDiscount: saved.maxDiscount,
      expiresAt: saved.expiresAt,
      isActive: saved.isActive,
      usageCount: saved.usageCount,
      createdAt: new Date().toISOString(),
    };

    await mutateSanityPrivate([
      {
        createOrReplace: doc,
      },
    ]);

    invalidateSanityCache();
    revalidatePath('/coupons');
    return { success: true, message: 'تم حفظ كود الخصم بنجاح' };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'خطأ غير معروف';
    return { success: false, error: msg };
  }
}

/**
 * Delete Coupon Action
 */
export async function deleteCouponAction(couponId: string): Promise<ActionResult> {
  try {
    storeRepo.deleteCoupon(couponId);

    await mutateSanityPrivate([
      {
        delete: { id: couponId },
      },
    ]);

    invalidateSanityCache();
    revalidatePath('/coupons');
    return { success: true, message: 'تم حذف كود الخصم بنجاح' };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'خطأ غير معروف';
    return { success: false, error: msg };
  }
}

function extractSanityAssetRef(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/\/images\/[^\/]+\/[^\/]+\/([a-zA-Z0-9_-]+)\.([a-zA-Z0-9]+)/);
  if (match) {
    const filenameWithoutExt = match[1];
    const ext = match[2];
    return `image-${filenameWithoutExt}-${ext}`;
  }
  return null;
}

/**
 * Save or Update Banner in Sanity
 */
export async function saveBannerAction(bannerData: Partial<BannerSlide>): Promise<ActionResult> {
  try {
    const isEdit = Boolean(bannerData.id);
    const docId = isEdit ? bannerData.id! : `banner-${Date.now()}`;

    let imageUrl = bannerData.image || '';
    let imageAssetRef: string | null = null;

    // 1. Handle base64 or remote external URL image upload directly to Sanity Image Assets
    if (imageUrl.startsWith('data:image/') || (imageUrl.startsWith('http') && !imageUrl.includes('cdn.sanity.io'))) {
      const uploaded = await uploadSanityImageAsset(
        imageUrl,
        `banner-${docId}.jpg`
      );
      if (uploaded) {
        imageUrl = uploaded.url;
        imageAssetRef = uploaded.ref || uploaded.assetId;
      }
    } else if (imageUrl.includes('cdn.sanity.io')) {
      imageAssetRef = extractSanityAssetRef(imageUrl);
    }

    const headlineText = bannerData.headlineAr || 'إضاءة معمارية نقية بلا نقاط';
    const subheadlineText = bannerData.subheadlineAr || '';
    const ctaPrimaryText = bannerData.ctaPrimaryAr || 'تسوق الآن';
    const ctaPrimaryTarget = bannerData.ctaPrimaryLink || bannerData.category || 'led-cob';
    const ctaSecondaryText = bannerData.ctaSecondaryAr || '';
    const ctaSecondaryTarget = bannerData.ctaSecondaryLink || 'all';
    const cat = bannerData.category || 'led-cob';
    const tagText = bannerData.tagAr || '';
    const badgeText = bannerData.badgeAr || '';
    const sortOrder = bannerData.order !== undefined ? Number(bannerData.order) : 1;
    const isBannerActive = bannerData.active !== false;

    const bannerDoc: Record<string, unknown> = {
      _id: docId,
      _type: 'banner',
      title: headlineText,
      headline: headlineText,
      headlineAr: headlineText,
      subheadline: subheadlineText,
      subheadlineAr: subheadlineText,
      subtitle: subheadlineText,
      ctaPrimaryAr: ctaPrimaryText,
      ctaPrimary: ctaPrimaryText,
      ctaText: ctaPrimaryText,
      buttonText: ctaPrimaryText,
      ctaPrimaryLink: ctaPrimaryTarget,
      ctaLink: ctaPrimaryTarget,
      ctaSecondaryAr: ctaSecondaryText,
      ctaSecondary: ctaSecondaryText,
      ctaSecondaryLink: ctaSecondaryTarget,
      category: cat,
      tag: tagText,
      tagAr: tagText,
      badge: badgeText,
      badgeAr: badgeText,
      imageUrl: imageUrl,
      imageString: imageUrl,
      order: sortOrder,
      active: isBannerActive,
      isActive: isBannerActive,
      updatedAt: new Date().toISOString(),
    };

    if (imageAssetRef) {
      bannerDoc.image = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAssetRef,
        },
      };
    } else if (imageUrl) {
      bannerDoc.image = imageUrl;
    }

    // Save in local repository for instant UI sync
    storeRepo.saveBanner({
      id: docId,
      headlineAr: headlineText,
      subheadlineAr: subheadlineText,
      ctaPrimaryAr: ctaPrimaryText,
      ctaPrimaryLink: ctaPrimaryTarget,
      ctaSecondaryAr: ctaSecondaryText,
      ctaSecondaryLink: ctaSecondaryTarget,
      category: cat,
      tagAr: tagText,
      badgeAr: badgeText,
      image: imageUrl,
      order: sortOrder,
      active: isBannerActive,
    });

    const res = await mutateSanityPrivate([
      {
        createOrReplace: bannerDoc,
      },
    ]);

    invalidateSanityCache();
    revalidatePath('/admin/banners');
    revalidatePath('/admin');
    revalidatePath('/', 'layout');
    revalidatePath('/');

    return {
      success: true,
      message: 'تم حفظ وتحديث البنر الإعلاني بنجاح ومزامنته مع Sanity والمتجر',
      transactionId: res?.transactionId || `banner-tx-${Date.now()}`,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'خطأ غير معروف في حفظ البنر';
    return { success: false, error: msg };
  }
}

/**
 * Delete Banner Action
 */
export async function deleteBannerAction(bannerId: string): Promise<ActionResult> {
  try {
    // 1. Remove from local repository permanently
    storeRepo.deleteBanner(bannerId);

    // 2. Delete from Sanity (both published document and any drafts)
    const baseId = bannerId.startsWith('drafts.') ? bannerId.replace('drafts.', '') : bannerId;
    const idsToDelete = [baseId, `drafts.${baseId}`];

    const sanityResult = await mutateSanityPrivate(
      idsToDelete.map((id) => ({
        delete: { id },
      }))
    );

    invalidateSanityCache();
    revalidatePath('/admin/banners');
    revalidatePath('/admin');
    revalidatePath('/', 'layout');
    revalidatePath('/');

    return {
      success: true,
      message: 'تم حذف البنر الإعلاني نهائياً من Sanity والمتجر',
      transactionId: sanityResult?.transactionId || `del-${Date.now()}`,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'خطأ غير معروف في حذف البنر';
    return { success: false, error: msg };
  }
}

/**
 * Bulk Sync all products and categories from local catalog into Sanity Cloud
 */
export async function syncAllCatalogToSanityAction(): Promise<ActionResult & { syncedCount?: number }> {
  try {
    const products = storeRepo.getProducts();
    const categories = storeRepo.getCategories();

    const mutations: Array<{ createOrReplace: Record<string, unknown> }> = [];

    // Categories
    for (const cat of categories) {
      mutations.push({
        createOrReplace: {
          _id: `category-${cat.id}`,
          _type: 'category',
          name: cat.name,
          nameEn: cat.nameEn,
          icon: cat.icon,
          description: cat.description,
          count: cat.count,
        },
      });
    }

    // Products
    for (const p of products) {
      mutations.push({
        createOrReplace: {
          _id: p.id,
          _type: 'product',
          name: p.name,
          nameEn: p.nameEn,
          sku: p.sku,
          category: p.category,
          categoryName: p.categoryName,
          categoryNameEn: p.categoryNameEn,
          badge: p.badge || '',
          badgeEn: p.badgeEn || '',
          price: p.price,
          originalPrice: p.originalPrice,
          rating: p.rating || 5,
          reviewsCount: p.reviewsCount || 1,
          shortDescription: p.shortDescription || '',
          shortDescriptionEn: p.shortDescriptionEn || '',
          description: p.description || '',
          descriptionEn: p.descriptionEn || '',
          features: p.features || [],
          featuresEn: p.featuresEn || [],
          specs: p.specs || {},
          inStock: p.inStock,
          featured: p.featured,
          isSale: p.isSale,
          stockCount: p.stockCount,
          imageUrlStrings: p.images || [],
          updatedAt: new Date().toISOString(),
        },
      });
    }

    const res = await mutateSanityPrivate(mutations);

    invalidateSanityCache();
    revalidatePath('/admin/products');
    revalidatePath('/admin/categories');
    revalidatePath('/admin');
    revalidatePath('/');

    return {
      success: true,
      message: `تمت مزامنة ورفع ${products.length} منتج و ${categories.length} قسم إلى Sanity Cloud بنجاح`,
      transactionId: res?.transactionId,
      syncedCount: products.length,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'خطأ غير معروف أثناء المزامنة';
    return { success: false, error: msg };
  }
}

/**
 * Save Payment & Delivery General Settings
 */
export async function savePaymentSettingsAction(settings: {
  freeShippingThreshold?: number;
  defaultDeliveryFee?: number;
  codEnabled?: boolean;
  bankTransferEnabled?: boolean;
}): Promise<ActionResult> {
  try {
    const { adminSavePaymentSettings } = await import('./sanity.server');
    await adminSavePaymentSettings(settings);

    revalidatePath('/admin/payments-delivery');
    revalidatePath('/admin');
    revalidatePath('/');

    return {
      success: true,
      message: 'تم حفظ إعدادات الدفع والتوصيل بنجاح',
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'فشل حفظ إعدادات الدفع';
    return { success: false, error: msg };
  }
}

/**
 * Save / Update Bank Account or Digital Wallet
 */
export async function saveBankAccountAction(accountData: any): Promise<ActionResult> {
  try {
    const { adminSaveBankAccount } = await import('./sanity.server');
    await adminSaveBankAccount(accountData);

    revalidatePath('/admin/payments-delivery');
    revalidatePath('/admin');
    revalidatePath('/');

    return {
      success: true,
      message: 'تم حفظ الحساب البنكي / المحفظة بنجاح',
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'فشل حفظ الحساب البنكي';
    return { success: false, error: msg };
  }
}

/**
 * Delete Bank Account or Digital Wallet
 */
export async function deleteBankAccountAction(id: string): Promise<ActionResult> {
  try {
    const { adminDeleteBankAccount } = await import('./sanity.server');
    await adminDeleteBankAccount(id);

    revalidatePath('/admin/payments-delivery');
    revalidatePath('/admin');
    revalidatePath('/');

    return {
      success: true,
      message: 'تم حذف الحساب بنجاح',
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'فشل حذف الحساب';
    return { success: false, error: msg };
  }
}

/**
 * Save / Update City Delivery Rate
 */
export async function saveDeliveryRateAction(rateData: any): Promise<ActionResult> {
  try {
    const { adminSaveDeliveryRate } = await import('./sanity.server');
    await adminSaveDeliveryRate(rateData);

    revalidatePath('/admin/payments-delivery');
    revalidatePath('/admin');
    revalidatePath('/');

    return {
      success: true,
      message: 'تم حفظ تسعيرة التوصيل للمدينة بنجاح',
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'فشل حفظ تسعيرة التوصيل';
    return { success: false, error: msg };
  }
}

/**
 * Delete City Delivery Rate
 */
export async function deleteDeliveryRateAction(id: string): Promise<ActionResult> {
  try {
    const { adminDeleteDeliveryRate } = await import('./sanity.server');
    await adminDeleteDeliveryRate(id);

    revalidatePath('/admin/payments-delivery');
    revalidatePath('/admin');
    revalidatePath('/');

    return {
      success: true,
      message: 'تم حذف تسعيرة المدينة بنجاح',
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'فشل حذف تسعيرة المدينة';
    return { success: false, error: msg };
  }
}

