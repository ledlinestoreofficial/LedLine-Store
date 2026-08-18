import { NextResponse } from 'next/server';
import { getSanityProducts, getSanityCategories } from '@/src/lib/sanity.server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('q')?.toLowerCase() || undefined;

    const [products, categories] = await Promise.all([
      getSanityProducts(category, search),
      getSanityCategories(),
    ]);

    return NextResponse.json({
      total: products.length,
      products,
      categories,
    });
  } catch (error) {
    console.error('[Products API] Error querying products from server.');
    return NextResponse.json(
      { error: 'Failed to retrieve products' },
      { status: 500 }
    );
  }
}
