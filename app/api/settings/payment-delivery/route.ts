import { NextResponse } from 'next/server';
import { storeRepo } from '@/src/lib/store-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const settings = storeRepo.getPaymentSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: 'تعذر جلب إعدادات الدفع ورسوم التوصيل' },
      { status: 500 }
    );
  }
}
