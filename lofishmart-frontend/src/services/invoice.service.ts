import { TransactionService } from "./transaction.service";
import { InventoryService } from "./inventory.service";
import type {
	InvoiceItem,
	SalesInvoice,
	PurchaseInvoice,
	InvoiceCompanyInfo,
	InvoiceConfig,
} from "@/types/invoice";
import {
	transformSellingToInvoice,
	transformPurchaseToInvoice,
	buildCompanyInfo,
} from "@/lib/invoice";
import type { Transaction, SellingProductDetail, Purchase } from "@/types";

export interface GenerateSalesInvoiceParams {
	transactionId: string;
	startDate?: string;
	endDate?: string;
	marketId?: string;
	company?: Partial<InvoiceCompanyInfo>;
	config?: InvoiceConfig;
}

export interface GeneratePurchaseInvoiceParams {
	purchaseId?: string;
	batch?: string;
	date?: string;
	company?: Partial<InvoiceCompanyInfo>;
	config?: InvoiceConfig;
}

export interface GenerateBulkPurchaseInvoiceParams {
	startDate?: string;
	endDate?: string;
	warehouseId?: string;
	company?: Partial<InvoiceCompanyInfo>;
	config?: InvoiceConfig;
}

export const InvoiceService = {
	/**
	 * Generate a sales invoice from a transaction ID.
	 * Fetches the transaction details + product details and transforms them.
	 */
	generateSalesInvoice: async (
		params: GenerateSalesInvoiceParams,
	): Promise<SalesInvoice> => {
		const { transactionId, startDate, endDate, marketId, company, config } = params;

		const [transactions, details] = await Promise.all([
			TransactionService.getTransactions({
				marketId,
				startDate,
				endDate,
			}),
			TransactionService.getSellingProductDetails({
				marketId,
				startDate,
				endDate,
				sellingId: transactionId,
			}),
		]);

		const transaction = transactions.find((t) => t.id === transactionId);
		if (!transaction) {
			throw new Error(`Transaction ${transactionId} not found`);
		}

		const items: InvoiceItem[] = details.map((d: SellingProductDetail) => ({
			id: d.id,
			name: d.stock_name || "Unknown",
			qty: d.qty,
			unit: "KG",
			price: d.mod_price,
			discount: 0,
			subtotal: d.total_price,
			note: d.note || undefined,
			grade: d.grade,
			size: d.size,
		}));

		const companyInfo = buildCompanyInfo(
			company?.name,
			company?.address,
			company?.phone,
			company?.logo,
		);

		return transformSellingToInvoice(transaction, items, companyInfo, config);
	},

	/**
	 * Generate a sales invoice directly from already-fetched data.
	 * Useful when you already have the data in state.
	 */
	generateSalesInvoiceFromData: (
		transaction: Transaction,
		details: SellingProductDetail[],
		company?: Partial<InvoiceCompanyInfo>,
		config?: InvoiceConfig,
	): SalesInvoice => {
		const items: InvoiceItem[] = details.map((d: SellingProductDetail) => ({
			id: d.id,
			name: d.stock_name || "Unknown",
			qty: d.qty,
			unit: "KG",
			price: d.mod_price,
			discount: 0,
			subtotal: d.total_price,
			note: d.note || undefined,
			grade: d.grade,
			size: d.size,
		}));

		const companyInfo = buildCompanyInfo(
			company?.name,
			company?.address,
			company?.phone,
			company?.logo,
		);

		return transformSellingToInvoice(transaction, items, companyInfo, config);
	},

	/**
	 * Generate a purchase invoice from a single purchase record.
	 */
	generatePurchaseInvoice: async (
		params: GeneratePurchaseInvoiceParams,
	): Promise<PurchaseInvoice> => {
		const { purchaseId, company, config } = params;

		if (!purchaseId) throw new Error("purchaseId is required");

		const purchases = await InventoryService.getPurchaseList();
		const purchase = purchases.find((p: Purchase) => p.id === purchaseId);
		if (!purchase) {
			throw new Error(`Purchase ${purchaseId} not found`);
		}

		const companyInfo = buildCompanyInfo(
			company?.name,
			company?.address,
			company?.phone,
			company?.logo,
		);

		return transformPurchaseToInvoice(purchase, companyInfo, config);
	},

	/**
	 * Generate purchase invoices grouped by batch/supplier for a date range.
	 */
	generateBulkPurchaseInvoices: async (
		params: GenerateBulkPurchaseInvoiceParams,
	): Promise<PurchaseInvoice[]> => {
		const { startDate, endDate, warehouseId, company, config } = params;

		const purchases = await InventoryService.getPurchaseList({
			start_date: startDate,
			end_date: endDate,
		});

		const filtered = warehouseId
			? purchases.filter((p: Purchase) => p.warehouse?.id === warehouseId)
			: purchases;

		const companyInfo = buildCompanyInfo(
			company?.name,
			company?.address,
			company?.phone,
			company?.logo,
		);

		return filtered.map((p: Purchase) =>
			transformPurchaseToInvoice(p, companyInfo, config),
		);
	},

	/**
	 * Load saved invoices from localStorage.
	 */
	getSavedInvoices: (): (SalesInvoice | PurchaseInvoice)[] => {
		try {
			const raw = localStorage.getItem("lofish_invoices");
			return raw ? JSON.parse(raw) : [];
		} catch {
			return [];
		}
	},

	/**
	 * Save an invoice to localStorage.
	 */
	saveInvoice: (invoice: SalesInvoice | PurchaseInvoice): void => {
		const invoices = InvoiceService.getSavedInvoices();
		const idx = invoices.findIndex((i) => i.id === invoice.id);
		if (idx >= 0) {
			invoices[idx] = invoice;
		} else {
			invoices.push(invoice);
		}
		localStorage.setItem("lofish_invoices", JSON.stringify(invoices));
	},

	/**
	 * Delete a saved invoice from localStorage.
	 */
	deleteSavedInvoice: (id: string): void => {
		const invoices = InvoiceService.getSavedInvoices().filter((i) => i.id !== id);
		localStorage.setItem("lofish_invoices", JSON.stringify(invoices));
	},
};
