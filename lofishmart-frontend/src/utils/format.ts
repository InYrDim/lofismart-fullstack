/**
 * Format utilities for currency, numbers, and compact values.
 * Centralized to avoid duplication across components.
 */

/**
 * Format number as Indonesian Rupiah currency.
 * e.g. 150000 → "Rp150.000"
 */
export const formatCurrency = (value: number): string =>
	new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(value);

/**
 * Format currency in compact form for chart axes/labels.
 * e.g. 1500000 → "1.5jt", 50000 → "50rb", 500 → "500"
 */
export const formatCompactCurrency = (value: number): string => {
	if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`;
	if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
	return value.toString();
};

/**
 * Format number with Indonesian locale separators.
 * e.g. 12345 → "12.345"
 */
export const formatNumber = (value: number): string =>
	new Intl.NumberFormat("id-ID").format(value);

/** Global decimal precision for quantity display */
export const DECIMAL_PLACES = 2;

/**
 * Format quantity with consistent 2 decimal places.
 * Always returns 2 decimal places regardless of unit type.
 */
export const formatQty = (qty: number): string => qty.toFixed(DECIMAL_PLACES);
