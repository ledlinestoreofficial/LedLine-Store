import React from 'react';
import { adminGetOrders } from '../../lib/sanity.server';
import { OrdersClient } from './OrdersClient';

export const revalidate = 0; // Dynamic server actions data

export default async function AdminOrdersPage() {
  const orders = await adminGetOrders();
  return <OrdersClient initialOrders={orders} />;
}
