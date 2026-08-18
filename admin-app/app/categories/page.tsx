import React from 'react';
import { adminGetCategories, adminGetProducts } from '../../lib/sanity.server';
import { CategoriesClient } from './CategoriesClient';

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([
    adminGetCategories(),
    adminGetProducts(),
  ]);

  return <CategoriesClient initialCategories={categories} products={products} />;
}
