import { useState, useCallback } from "react";
import type {
	Invoice,
	InvoiceType,
	InvoiceCompanyInfo,
	InvoiceConfig,
} from "@/types/invoice";
import { InvoiceService, type GenerateSalesInvoiceParams } from "@/services/invoice.service";
import type { Transaction, SellingProductDetail } from "@/types";

interface UseInvoiceOptions {
	type: InvoiceType;
	company?: Partial<InvoiceCompanyInfo>;
	config?: InvoiceConfig;
}

interface UseInvoiceReturn {
	invoice: Invoice | null;
	loading: boolean;
	error: string | null;
	savedInvoices: Invoice[];

	/** Generate a sales invoice from a transaction (fetches data from API). */
	generateFromTransaction: (params: GenerateSalesInvoiceParams) => Promise<void>;

	/** Generate a sales invoice from already-fetched data. */
	generateFromData: (
		transaction: Transaction,
		details: SellingProductDetail[],
	) => void;

	/** Load saved invoices from localStorage. */
	loadSavedInvoices: () => void;

	/** Save current invoice to localStorage. */
	saveCurrentInvoice: () => void;

	/** Delete a saved invoice by ID. */
	deleteInvoice: (id: string) => void;

	/** Reset invoice state. */
	reset: () => void;

	/** Set invoice directly. */
	setInvoice: (invoice: Invoice | null) => void;
}

export function useInvoice(options: UseInvoiceOptions): UseInvoiceReturn {
	const { company, config } = options;
	const [invoice, setInvoice] = useState<Invoice | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [savedInvoices, setSavedInvoices] = useState<Invoice[]>(() =>
		InvoiceService.getSavedInvoices(),
	);

	const generateFromTransaction = useCallback(
		async (params: GenerateSalesInvoiceParams) => {
			setLoading(true);
			setError(null);
			try {
				const result = await InvoiceService.generateSalesInvoice({
					...params,
					company,
					config,
				});
				setInvoice(result);
			} catch (err) {
				const msg = err instanceof Error ? err.message : "Failed to generate invoice";
				setError(msg);
			} finally {
				setLoading(false);
			}
		},
		[company, config],
	);

	const generateFromData = useCallback(
		(transaction: Transaction, details: SellingProductDetail[]) => {
			setError(null);
			try {
				const result = InvoiceService.generateSalesInvoiceFromData(
					transaction,
					details,
					company,
					config,
				);
				setInvoice(result);
			} catch (err) {
				const msg = err instanceof Error ? err.message : "Failed to generate invoice";
				setError(msg);
			}
		},
		[company, config],
	);

	const loadSavedInvoices = useCallback(() => {
		setSavedInvoices(InvoiceService.getSavedInvoices());
	}, []);

	const saveCurrentInvoice = useCallback(() => {
		if (!invoice) return;
		InvoiceService.saveInvoice(invoice);
		loadSavedInvoices();
	}, [invoice, loadSavedInvoices]);

	const deleteInvoice = useCallback(
		(id: string) => {
			InvoiceService.deleteSavedInvoice(id);
			loadSavedInvoices();
		},
		[loadSavedInvoices],
	);

	const reset = useCallback(() => {
		setInvoice(null);
		setError(null);
		setLoading(false);
	}, []);

	return {
		invoice,
		loading,
		error,
		savedInvoices,
		generateFromTransaction,
		generateFromData,
		loadSavedInvoices,
		saveCurrentInvoice,
		deleteInvoice,
		reset,
		setInvoice,
	};
}
