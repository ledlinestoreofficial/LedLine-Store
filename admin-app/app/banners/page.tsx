import React from 'react';
import { adminGetBanners, adminGetCategories } from '../../lib/sanity.server';
import { BannersClient } from './BannersClient';

export const revalidate = 0;

export default async function AdminBannersPage() {
  const [banners, categories] = await Promise.all([
    adminGetBanners(),
    adminGetCategories(),
  ]);

  return <BannersClient initialBanners={banners} categories={categories} />;
}
