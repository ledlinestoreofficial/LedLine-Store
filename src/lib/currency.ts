export const DEFAULT_EXCHANGE_RATE_YER = 535; // 1 SAR = 535 YER default

export function convertSarToYer(sarPrice: number, rate: number = DEFAULT_EXCHANGE_RATE_YER): number {
  if (isNaN(sarPrice) || sarPrice === null || sarPrice === undefined) return 0;
  const numRate = Number(rate) > 0 ? Number(rate) : DEFAULT_EXCHANGE_RATE_YER;
  return Math.round(Number(sarPrice) * numRate);
}

export function formatYER(amount: number): string {
  const clean = Math.round(Number(amount) || 0);
  return `${clean.toLocaleString('en-US')} ر.ي`;
}

export function formatSAR(amount: number): string {
  const clean = Number(amount) || 0;
  return `${clean.toLocaleString('en-US')} ر.س`;
}
