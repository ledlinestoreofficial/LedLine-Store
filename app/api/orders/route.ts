import { NextResponse } from 'next/server';
import { OrderCreationRequest, OrderApiResponse, CalculatedOrderItem, OrderRecord } from '@/src/types';
import { getSanityProductById, createSanityOrder } from '@/src/lib/sanity.server';

export async function POST(request: Request): Promise<NextResponse<OrderApiResponse>> {
  try {
    const body: OrderCreationRequest = await request.json();

    const { items, customer, paymentMethod, couponCode } = body;

    // 1. Validate Customer Information
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'بيانات العميل مطلوبة لإتمام الطلب' },
        { status: 400 }
      );
    }

    const fullName = customer.fullName?.trim();
    const phone = customer.phone?.trim();
    const city = customer.city?.trim();
    const address = customer.address?.trim();

    if (!fullName || fullName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال اسم كامل صحيح (حرفين على الأقل)' },
        { status: 400 }
      );
    }

    if (!phone || phone.length < 8) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال رقم هاتف صحيح للتواصل والتوصيل' },
        { status: 400 }
      );
    }

    if (!city) {
      return NextResponse.json(
        { success: false, error: 'يرجى تحديد المدينة للتوصيل' },
        { status: 400 }
      );
    }

    if (!address || address.length < 3) {
      return NextResponse.json(
        { success: false, error: 'يرجى كتابة عنوان التوصيل بالتفصيل (الحي واسم الشارع)' },
        { status: 400 }
      );
    }

    // 2. Validate Payment Method
    const validPaymentMethods = ['mada', 'applepay', 'tamara', 'cod'];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, error: 'طريقة الدفع المحددة غير مدعومة' },
        { status: 400 }
      );
    }

    // 3. Validate Cart Items Array
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'السلة فارغة، يرجى إضافة منتجات قبل إتمام الطلب' },
        { status: 400 }
      );
    }

    // 4. Server-Side Price Resolution and Stock Validation
    const calculatedItems: CalculatedOrderItem[] = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      if (!item.productId) {
        return NextResponse.json(
          { success: false, error: 'معرّف المنتج مفقود في أحد عناصر السلة' },
          { status: 400 }
        );
      }

      const quantity = Math.floor(Number(item.quantity));
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return NextResponse.json(
          { success: false, error: 'الكمية المطلوبة للمنتج يجب أن تكون رقماً موجباً' },
          { status: 400 }
        );
      }

      // Fetch authentic product data from Sanity (Server-authoritative, no local fallback)
      const authenticProduct = await getSanityProductById(item.productId);

      if (!authenticProduct) {
        return NextResponse.json(
          { success: false, error: `المنتج ذو المعرف "${item.productId}" غير موجود أو غير متاح حالياً` },
          { status: 400 }
        );
      }

      if (!authenticProduct.inStock) {
        return NextResponse.json(
          { success: false, error: `المنتج "${authenticProduct.name}" غير متوفر في المخزون حالياً` },
          { status: 400 }
        );
      }

      // Resolve authentic price from server product definition
      let resolvedPrice = authenticProduct.price;
      if (item.selectedLength && authenticProduct.category === 'led-cob' && item.selectedLength > 1) {
        resolvedPrice = authenticProduct.price * item.selectedLength;
      }

      const itemTotal = resolvedPrice * quantity;
      calculatedSubtotal += itemTotal;

      calculatedItems.push({
        productId: authenticProduct.id,
        name: authenticProduct.name,
        nameEn: authenticProduct.nameEn,
        sku: authenticProduct.sku,
        price: resolvedPrice,
        quantity,
        itemTotal,
        image: authenticProduct.images[0] || '',
        selectedColorTemp: item.selectedColorTemp,
        selectedFinish: item.selectedFinish,
      });
    }

    // 5. Server-side Coupon & Discount Calculation
    let discountAmount = 0;
    let appliedCouponName: string | undefined = undefined;

    if (couponCode) {
      const cleanCoupon = couponCode.trim().toUpperCase();
      if (cleanCoupon === 'WELCOME' || cleanCoupon === 'PROMO15') {
        discountAmount = Math.round(calculatedSubtotal * 0.15);
        appliedCouponName = cleanCoupon;
      } else if (cleanCoupon === 'LED10') {
        discountAmount = Math.round(calculatedSubtotal * 0.10);
        appliedCouponName = cleanCoupon;
      }
    }

    // 6. Server-side Shipping Fee Calculation
    const shippingFee = calculatedSubtotal >= 350 || calculatedItems.length === 0 ? 0 : 35;
    const finalTotal = Math.max(0, calculatedSubtotal - discountAmount + shippingFee);

    // 7. Generate Unique Order Number
    const orderNumber = `LL-${Date.now().toString().slice(-6)}`;
    const createdAt = new Date().toISOString();

    const orderRecord: OrderRecord = {
      id: `order-${orderNumber.toLowerCase()}`,
      orderNumber,
      customer: {
        fullName,
        phone,
        city,
        address,
        notes: customer.notes?.trim() || '',
      },
      items: calculatedItems,
      summary: {
        subtotal: calculatedSubtotal,
        discountAmount,
        appliedCoupon: appliedCouponName,
        shippingFee,
        finalTotal,
      },
      paymentMethod,
      status: 'pending',
      createdAt,
    };

    // 8. Persist Order to Private Sanity Backend via Server-only Mutation
    const orderResult = await createSanityOrder(orderRecord);

    // Strictly verify mutation success
    if (!orderResult.success || !orderResult.transactionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'تعذر حفظ وتأكيد الطلب في خادم المتجر حالياً. يرجى إعادة المحاولة لاحقاً أو التواصل مع خدمة العملاء.',
        },
        { status: 500 }
      );
    }

    // 9. Return Safe Response to Browser
    return NextResponse.json({
      success: true,
      orderId: orderRecord.id,
      orderNumber,
      message: 'تم استلام وتأكيد الطلب بنجاح',
      orderDetails: {
        orderNumber,
        itemsCount: calculatedItems.reduce((acc, i) => acc + i.quantity, 0),
        subtotal: calculatedSubtotal,
        discountAmount,
        shippingFee,
        total: finalTotal,
        paymentMethod,
        customerName: fullName,
        city,
        createdAt,
      },
    });
  } catch (error) {
    console.error('[Orders API] Server-side order processing exception.');
    return NextResponse.json(
      { success: false, error: 'حدث خطأ غير متوقع أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    );
  }
}
