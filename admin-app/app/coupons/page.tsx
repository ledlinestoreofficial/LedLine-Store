import React from 'react';
import { adminGetCoupons } from '../../lib/sanity.server';
import { CouponsClient } from './CouponsClient';

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const coupons = await adminGetCoupons();
  return <CouponsClient initialCoupons={coupons} />;
}
