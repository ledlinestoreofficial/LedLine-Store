import React from 'react';
import { adminGetPaymentSettings } from '../../lib/sanity.server';
import { PaymentsDeliveryClient } from './PaymentsDeliveryClient';

export const revalidate = 0;

export default async function AdminPaymentsDeliveryPage() {
  const settings = await adminGetPaymentSettings();
  return <PaymentsDeliveryClient initialSettings={settings} />;
}
