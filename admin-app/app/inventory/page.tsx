import React from 'react';
import { adminGetProducts } from '../../lib/sanity.server';
import { InventoryClient } from './InventoryClient';

export const revalidate = 0;

export default async function AdminInventoryPage() {
  const products = await adminGetProducts();
  return <InventoryClient initialProducts={products} />;
}
