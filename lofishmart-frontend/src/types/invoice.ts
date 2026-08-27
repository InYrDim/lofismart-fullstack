export type InvoiceType = "SALES" | "PURCHASE";

export type InvoiceStatus =
	| "PAID"
	| "UNPAID"
	| "PARTIAL"
	| "CANCELLED";

export interface InvoiceCompanyInfo {
	name: string;
	address: string;
	phone: string;
	logo?: string;
}

export interface InvoiceItem {
	id: string;
	name: string;
	qty: number;
	unit: string;
	price: number;
	discount: number;
	subtotal: number;
	note?: string;
	grade?: string;
	size?: string;
	type?: "PRODUCT" | "SERVICE";
}

export interface SalesInvoice {
	id: string;
	invoiceNumber: string;
	type: "SALES";
	transactionId: string;
	date: string;
	marketName: string;
	cashierName: string;
	customerName: string;
	paymentMethod: string;
	isPaid: string;
	status: InvoiceStatus;
	items: InvoiceItem[];
	subtotal: number;
	itemDiscount: number;
	voucherDiscount: number;
	totalDiscount: number;
	tax: number;
	total: number;
	payedMoney: number;
	changeMoney: number;
	note: string | null;
	company: InvoiceCompanyInfo;
	createdAt: string;
}

export interface PurchaseInvoice {
	id: string;
	invoiceNumber: string;
	type: "PURCHASE";
	purchaseId: string;
	date: string;
	supplierName: string;
	warehouseName: string;
	userName: string;
	status: InvoiceStatus;
	items: InvoiceItem[];
	subtotal: number;
	total: number;
	note: string | null;
	company: InvoiceCompanyInfo;
	createdAt: string;
}

export type Invoice = SalesInvoice | PurchaseInvoice;

export interface InvoiceConfig {
	salesPrefix: string;
	purchasePrefix: string;
	companyName: string;
	companyAddress: string;
	companyPhone: string;
	companyLogo?: string;
	separator: string;
	includeYear: boolean;
	includeMonth: boolean;
	includeDay: boolean;
	digitLength: number;
}

export const DEFAULT_INVOICE_CONFIG: InvoiceConfig = {
	salesPrefix: "INV",
	purchasePrefix: "PO",
	companyName: "Lofish Mart",
	companyAddress: "",
	companyPhone: "",
	separator: "/",
	includeYear: true,
	includeMonth: true,
	includeDay: true,
	digitLength: 4,
};
