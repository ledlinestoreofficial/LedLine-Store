import { getSanityProducts, getSanityCategories } from '@/src/lib/sanity.server';
import { StoreClient } from '@/src/components/StoreClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getSanityProducts(),
    getSanityCategories(),
  ]);

  return <StoreClient initialProducts={products} categories={categories} />;
}
