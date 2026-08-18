import React from 'react';
import { adminGetProducts, adminGetCategories } from '../../lib/sanity.server';
import { ProductsClient } from './ProductsClient';

export const revalidate = 0; // Fresh dynamic data

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    adminGetProducts(),
    adminGetCategories(),
  ]);

  return <ProductsClient initialProducts={products} categories={categories} />;
}
