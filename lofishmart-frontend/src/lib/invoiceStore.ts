import type { Invoice } from "@/types/invoice";

const STORAGE_KEY = "lofish_invoices";

/**
 * Persistent invoice store using localStorage.
 * Provides CRUD operations for saved invoices.
 */
export const InvoiceStore = {
	getAll: (): Invoice[] => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			return raw ? JSON.parse(raw) : [];
		} catch {
			return [];
		}
	},

	getById: (id: string): Invoice | undefined => {
		return InvoiceStore.getAll().find((inv) => inv.id === id);
	},

	save: (invoice: Invoice): void => {
		const invoices = InvoiceStore.getAll();
		const idx = invoices.findIndex((inv) => inv.id === invoice.id);
		if (idx >= 0) {
			invoices[idx] = invoice;
		} else {
			invoices.unshift(invoice);
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
	},

	delete: (id: string): void => {
		const invoices = InvoiceStore.getAll().filter((inv) => inv.id !== id);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
	},

	clear: (): void => {
		localStorage.removeItem(STORAGE_KEY);
	},

	count: (): number => {
		return InvoiceStore.getAll().length;
	},
};
