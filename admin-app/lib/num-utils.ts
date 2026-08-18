/**
 * Numbers & Digits Normalizer for English Display
 * Converts Eastern Arabic numerals (٠-٩) and Persian numerals (۰-۹) to standard English (0-9).
 */

export function toEnglishDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return '';
  const str = String(input);
  
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  return str
    .replace(/[٠-٩]/g, (char) => String(arabicDigits.indexOf(char)))
    .replace(/[۰-۹]/g, (char) => String(persianDigits.indexOf(char)))
    .replace(/[٫،]/g, '.') // Convert Arabic comma / decimal separator to dot
    .trim();
}

/**
 * Parses numeric input safely even when typed with Arabic numbers or symbols
 */
export function parseNumericEnglish(input: string | number | null | undefined, defaultValue = 0): number {
  if (input === null || input === undefined || input === '') return defaultValue;
  if (typeof input === 'number') return isNaN(input) ? defaultValue : input;

  const normalized = toEnglishDigits(input);
  // Keep only digits, negative sign, and decimal point
  const sanitized = normalized.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(sanitized);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Format currency strictly in English numerals
 */
export function formatPriceEn(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '0';
  const num = typeof amount === 'number' ? amount : parseNumericEnglish(amount);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: num % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 2,
  });
}
