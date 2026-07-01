// src/lib/currency.js
// Currency formatting utility
// Provides formatUSD and generic formatCurrency

/**
 * Formats a number as USD currency string, e.g. $12.34
 */
export function formatUSD(amount) {
  if (typeof amount !== 'number') return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a numeric amount according to the given currency.
 *
 * @param {number|string} amount - The monetary amount to format. Strings are parsed as float.
 * @param {string} [currency='USD'] - ISO 4217 currency code (default: 'USD').
 * @param {string} [locale='en-US'] - Locale for number formatting.
 * @returns {string} Formatted currency string, e.g., "$12.34".
 */
export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (Number.isNaN(numeric)) {
    console.warn('formatCurrency received a non-numeric amount:', amount);
    return '';
  }
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch (e) {
    console.error('Invalid currency code passed to formatCurrency:', currency);
    // Fallback: simple number with two decimals
    return numeric.toFixed(2);
  }
}
