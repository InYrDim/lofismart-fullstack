import type {
	InvoiceType,
	InvoiceStatus,
	InvoiceConfig,
	SalesInvoice,
	PurchaseInvoice,
	InvoiceItem,
	InvoiceCompanyInfo,
} from "@/types/invoice";
import { DEFAULT_INVOICE_CONFIG } from "@/types/invoice";
import { format } from "date-fns";

/**
 * Generate a unique invoice number based on config.
 * Format: {PREFIX}{SEPARATOR}{YYYY}{SEPARATOR}{MM}{SEPARATOR}{DD}{SEPARATOR}{SEQUENCE}
 * e.g. INV/2026/05/10/0001
 */
export function generateInvoiceNumber(
	type: InvoiceType,
	date: Date,
	sequence: number,
	config: InvoiceConfig = DEFAULT_INVOICE_CONFIG,
): string {
	const prefix = type === "SALES" ? config.salesPrefix : config.purchasePrefix;
	const parts: string[] = [prefix];

	if (config.includeYear) parts.push(format(date, "yyyy"));
	if (config.includeMonth) parts.push(format(date, "MM"));
	if (config.includeDay) parts.push(format(date, "dd"));

	const seq = String(sequence).padStart(config.digitLength, "0");
	parts.push(seq);

	return parts.join(config.separator);
}

/**
 * Derive a sequence number from a transaction ID for deterministic invoice numbers.
 * Uses a simple hash of the ID string.
 */
export function deriveSequenceFromId(id: string, max = 9999): number {
	let hash = 0;
	for (let i = 0; i < id.length; i++) {
		const char = id.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash |= 0;
	}
	return Math.abs(hash % max) + 1;
}

/**
 * Compute invoice status from is_paid value.
 * Backend values: "1" = lunas, "2" = hutang, "3" = DP/partial
 */
export function computeInvoiceStatus(isPaid: string): InvoiceStatus {
	switch (isPaid) {
		case "1":
			return "PAID";
		case "2":
			return "UNPAID";
		case "3":
			return "PARTIAL";
		default:
			return "UNPAID";
	}
}

/**
 * Format currency for invoice display (IDR).
 */
export function formatInvoiceCurrency(value: number): string {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(value);
}

/**
 * Format date for invoice display.
 */
export function formatInvoiceDate(date: string): string {
	return format(new Date(date), "dd MMM yyyy");
}

/**
 * Format date with time for invoice.
 */
export function formatInvoiceDateTime(date: string): string {
	return format(new Date(date), "dd MMM yyyy HH:mm");
}

/**
 * Build company info from available data.
 */
export function buildCompanyInfo(
	name?: string,
	address?: string,
	phone?: string,
	logo?: string,
): InvoiceCompanyInfo {
	return {
		name: name || DEFAULT_INVOICE_CONFIG.companyName,
		address: address || DEFAULT_INVOICE_CONFIG.companyAddress,
		phone: phone || DEFAULT_INVOICE_CONFIG.companyPhone,
		logo,
	};
}

interface RawUser {
	name?: string;
	username?: string;
}

interface RawMember {
	name?: string;
}

interface RawPayment {
	name?: string;
}

interface RawMarket {
	name?: string;
}

/**
 * Transform raw selling transaction data into a SalesInvoice.
 */
function resolveCashierName(tx: {
	cashier_name?: string;
	user?: RawUser | null;
}): string {
	console.log(tx);
	if (tx.cashier_name) return tx.cashier_name;
	if (tx.user) return tx.user.name || tx.user.username || "-";
	return "-";
}

function resolveCustomerName(tx: {
	customer_name?: string | null;
	member?: RawMember | null;
}): string {
	if (tx.customer_name) return tx.customer_name;
	return tx.member?.name || "-";
}

function resolvePaymentMethod(tx: {
	payment_method?: string;
	payment?: RawPayment | null;
}): string {
	if (tx.payment_method) return tx.payment_method;
	return tx.payment?.name || "-";
}

function resolveMarketName(tx: {
	market_name?: string;
	market?: RawMarket | null;
}): string {
	if (tx.market_name) return tx.market_name;
	return tx.market?.name || "-";
}

export function transformSellingToInvoice(
	transaction: Record<string, unknown>,
	items: InvoiceItem[],
	company: InvoiceCompanyInfo,
	config: InvoiceConfig = DEFAULT_INVOICE_CONFIG,
): SalesInvoice {
	const dateStr =
		(transaction.transaction_date as string) ||
		(transaction.created_at as string) ||
		new Date().toISOString();
	const date = new Date(dateStr);
	const sequence = deriveSequenceFromId(transaction.id as string);

	return {
		id: `inv_${transaction.id}`,
		invoiceNumber: generateInvoiceNumber("SALES", date, sequence, config),
		type: "SALES",
		transactionId: transaction.id as string,
		date: dateStr,
		marketName: resolveMarketName(transaction),
		cashierName: resolveCashierName(transaction),
		customerName: resolveCustomerName(transaction),
		paymentMethod: resolvePaymentMethod(transaction),
		isPaid: (transaction.is_paid as string) || "0",
		status: computeInvoiceStatus((transaction.is_paid as string) || "0"),
		items,
		subtotal: (transaction.price as number) || 0,
		itemDiscount: (transaction.per_item_disc as number) || 0,
		voucherDiscount: (transaction.voucher_disc as number) || 0,
		totalDiscount: (transaction.total_disc as number) || 0,
		tax: (transaction.tax_price as number) || 0,
		total: (transaction.total_price as number) || 0,
		payedMoney: (transaction.payed_money as number) || 0,
		changeMoney: (transaction.change_money as number) || 0,
		note: (transaction.note as string) || null,
		company,
		createdAt: new Date().toISOString(),
	};
}

/**
 * Transform purchase data into a PurchaseInvoice.
 */
export function transformPurchaseToInvoice(
	purchase: {
		id: string;
		batch: string | null;
		qty: number;
		price: number;
		unit: string;
		image_proof: string | null;
		created_at: string;
		product: { id: string; name: string } | null;
		supplier: { id: string; name: string; corporation?: string } | null;
		warehouse: { id: string; name: string } | null;
		user?: { id: string; username: string; name?: string } | null;
	},
	company: InvoiceCompanyInfo,
	config: InvoiceConfig = DEFAULT_INVOICE_CONFIG,
): PurchaseInvoice {
	const date = new Date(purchase.created_at);
	const sequence = deriveSequenceFromId(purchase.id);
	const unitLabel = purchase.unit === "1" ? "KG" : purchase.unit === "2" ? "PCS" : purchase.unit;

	const item: InvoiceItem = {
		id: purchase.product?.id || purchase.id,
		name: purchase.product?.name || "Unknown Product",
		qty: purchase.qty,
		unit: unitLabel,
		price: purchase.price,
		discount: 0,
		subtotal: purchase.qty * purchase.price,
	};

	return {
		id: `po_${purchase.id}`,
		invoiceNumber: generateInvoiceNumber("PURCHASE", date, sequence, config),
		type: "PURCHASE",
		purchaseId: purchase.id,
		date: purchase.created_at,
		supplierName: purchase.supplier?.name || "-",
		warehouseName: purchase.warehouse?.name || "-",
		userName: purchase.user?.name || purchase.user?.username || "-",
		status: "PAID",
		items: [item],
		subtotal: item.subtotal,
		total: item.subtotal,
		note: purchase.batch ? `Batch: ${purchase.batch}` : null,
		company,
		createdAt: new Date().toISOString(),
	};
}

/**
 * Build a purchase invoice from grouped purchase items (same batch/supplier).
 */
export function transformGroupedPurchaseToInvoice(
	group: {
		id: string;
		date: string;
		supplierName: string;
		warehouseName: string;
		totalAmount: number;
		items: Array<{
			id: string;
			qty: number;
			price: number;
			unit: string;
			product: { id: string; name: string } | null;
		}>;
		userName?: string;
	},
	company: InvoiceCompanyInfo,
	config: InvoiceConfig = DEFAULT_INVOICE_CONFIG,
): PurchaseInvoice {
	const date = new Date(group.date);
	const sequence = deriveSequenceFromId(group.id);

	const invoiceItems: InvoiceItem[] = group.items.map((item) => {
		const unitLabel = item.unit === "1" ? "KG" : item.unit === "2" ? "PCS" : item.unit;
		return {
			id: item.product?.id || item.id,
			name: item.product?.name || "Unknown Product",
			qty: item.qty,
			unit: unitLabel,
			price: item.price,
			discount: 0,
			subtotal: item.qty * item.price,
		};
	});

	return {
		id: `po_group_${group.id}`,
		invoiceNumber: generateInvoiceNumber("PURCHASE", date, sequence, config),
		type: "PURCHASE",
		purchaseId: group.id,
		date: group.date,
		supplierName: group.supplierName,
		warehouseName: group.warehouseName,
		userName: group.userName || "-",
		status: "PAID",
		items: invoiceItems,
		subtotal: group.totalAmount,
		total: group.totalAmount,
		note: null,
		company,
		createdAt: new Date().toISOString(),
	};
}

/**
 * Calculate invoice summary from items.
 */
export function calculateInvoiceSummary(items: InvoiceItem[]) {
	const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
	return { subtotal };
}

/**
 * Transform cart items (CartItem[]) into InvoiceItem[].
 */
export function transformCartToInvoiceItems(
	cartItems: Array<{
		id: string;
		name: string;
		qty: number;
		unit: string;
		basePrice: number;
		discount: number;
		subtotal: number;
		selectedGrade?: string;
		selectedSize?: string;
		measuredWeight?: number;
		source?: string;
		type?: "PRODUCT" | "SERVICE";
	}>,
): InvoiceItem[] {
	return cartItems.map((item) => ({
		id: item.id,
		name: item.name,
		qty: item.qty,
		unit: item.unit,
		price: item.basePrice,
		discount: item.discount,
		subtotal: item.subtotal,
		grade: item.selectedGrade,
		size: item.selectedSize,
		type: item.type,
	}));
}

/**
 * Transform a Transaction + cart items directly into a SalesInvoice.
 * Used in the POS checkout flow where cart data is available in memory.
 */
export function transformPosToInvoice(
	transaction: Record<string, unknown>,
	cartItems: Array<{
		id: string;
		name: string;
		qty: number;
		unit: string;
		basePrice: number;
		discount: number;
		subtotal: number;
		selectedGrade?: string;
		selectedSize?: string;
		measuredWeight?: number;
		source?: string;
		type?: "PRODUCT" | "SERVICE";
	}>,
	company?: Partial<InvoiceCompanyInfo>,
	config?: InvoiceConfig,
): SalesInvoice {
	const items = transformCartToInvoiceItems(cartItems);
	const companyInfo = buildCompanyInfo(
		company?.name,
		company?.address,
		company?.phone,
		company?.logo,
	);
	return transformSellingToInvoice(transaction, items, companyInfo, config);
}
