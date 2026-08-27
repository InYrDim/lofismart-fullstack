import { api } from "@/utils/api";
import type {
	Transaction,
	SellingProductDetail,
	SellingServiceDetail,
	ApiSellingProductDetail,
} from "@/types";

// --- API Response Interfaces ---

interface ApiRole {
	id: string;
	name: string;
	guard_name: string;
	created_at: string;
	updated_at: string;
}

interface ApiUser {
	id: string;
	name: string;
	email: string;
	username: string;
	password: string;
	remember_token: string | null;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
	role?: ApiRole;
}

interface ApiMarket {
	id: string;
	name: string;
	address: string;
	maps: string;
	city: string;
	pos: string;
	timezone: string;
	time_dif: number;
	phone_number: string;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
}

interface ApiPayment {
	id: string;
	name: string;
	icon: string;
	created_at: string;
	updated_at: string;
}

interface ApiMember {
	id: string;
	name: string;
	[key: string]: unknown;
}

interface ApiVoucher {
	id: string;
	[key: string]: unknown;
}

// ApiSize, ApiCategory, ApiProduct, ApiGrade removed - unused or imported from types

// ApiPrice removed - imported from types implicitly via ApiSellingProductDetail

interface ApiTransaction {
	id: string;
	payment_id: string | null;
	total_weight_qty: number;
	totol_pcs_qty: number;
	price: number;
	per_item_disc: number;
	voucher_disc: number;
	total_disc: number;
	tax_price: number;
	total_price: number;
	payed_money: number;
	change_money: number;
	is_paid: string;
	online_order: string;
	note: string | null;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
	user: ApiUser;
	market: ApiMarket;
	payment: ApiPayment | null;
	member: ApiMember | null;
	voucher: ApiVoucher | null;
}

interface TransactionListResponse {
	data: ApiTransaction[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

// interface ApiSellingProductDetail removed - imported from types

interface ApiSellingServiceDetail {
	id: string;
	qty: number;
	mod_price: number;
	total_price: number;
	note: string | null;
	created_at: string;
	updated_at: string;
	selling: ApiTransaction;
}

// --- Service ---

export const TransactionService = {
	/**
	 * All Selling - main transactions list
	 */
	getTransactions: async ({
		marketId,
		startDate,
		endDate,
		userId,
	}: {
		marketId?: string;
		startDate?: string;
		endDate?: string;
		userId?: string;
	}): Promise<Transaction[]> => {
		try {
			let url = `/transaction/selling/list`;
			const params = new URLSearchParams();
			if (marketId) params.append("market_id", marketId);
			if (startDate) params.append("start_date", startDate);
			if (endDate) params.append("end_date", endDate);
			if (userId) params.append("user_id", userId);

			if (params.toString()) {
				url += `?${params.toString()}`;
			}
			console.log("Fetching transactions URL:", url);

			const response = await api.get<TransactionListResponse>(url);
			const transactions = response.data || [];
			return transactions.map((item) => ({
				id: item.id,
				code: item.id,
				total_weight_qty: item.total_weight_qty,
				total_pcs_qty: item.totol_pcs_qty, // note: API typo "totol"
				price: item.price,
				per_item_disc: item.per_item_disc,
				voucher_disc: item.voucher_disc,
				total_disc: item.total_disc,
				tax_price: item.tax_price,
				total_price: item.total_price,
				payed_money: item.payed_money,
				change_money: item.change_money,
				is_paid: item.is_paid,
				online_order: item.online_order,
				note: item.note,
				transaction_date: item.created_at,
				payment_method: item.payment?.name || "N/A",
				payment_method_id: item.payment?.id || null,
				cashier_name: item.user?.name || "-",
				market_name: item.market?.name || "-",
				customer_name: item.member?.name || "Umum",
				member_id: item.member?.id || null,
			}));
		} catch (error: unknown) {
			console.error("Failed to fetch transactions:", error);
			throw error;
		}
	},

	/**
	 * Helper: map an ApiTransaction to a Transaction
	 */
	_mapApiTransaction: (item: ApiTransaction): Transaction => ({
		id: item.id,
		code: item.id,
		total_weight_qty: item.total_weight_qty,
		total_pcs_qty: item.totol_pcs_qty, // note: API typo "totol"
		price: item.price,
		per_item_disc: item.per_item_disc,
		voucher_disc: item.voucher_disc,
		total_disc: item.total_disc,
		tax_price: item.tax_price,
		total_price: item.total_price,
		payed_money: item.payed_money,
		change_money: item.change_money,
		is_paid: item.is_paid,
		online_order: item.online_order,
		note: item.note,
		transaction_date: item.created_at,
		payment_method: item.payment?.name || "N/A",
		payment_method_id: item.payment?.id || null,
		cashier_name: item.user?.name || "-",
		market_name: item.market?.name || "-",
		customer_name: item.member?.name || "Umum",
		member_id: item.member?.id || null,
	}),

	/**
	 * Selling Product Detail - product items in selling transactions (Report per Item)
	 */
	getSellingProductDetails: async ({
		marketId,
		startDate,
		endDate,
		sellingId,
	}: {
		marketId?: string;
		startDate?: string;
		endDate?: string;
		sellingId?: string;
	}): Promise<SellingProductDetail[]> => {
		try {
			let url = `/transaction/selling/product/detail/list`;
			const params = new URLSearchParams();
			if (marketId) params.append("market_id", marketId);
			if (startDate) params.append("start_date", startDate);
			if (endDate) params.append("end_date", endDate);
			if (sellingId) params.append("selling_id", sellingId);

			const queryString = params.toString();
			if (queryString) {
				url += `?${queryString}`;
			}

			const response = await api.get<ApiSellingProductDetail[] | { data: ApiSellingProductDetail[] }>(url);
			// Backend might return raw array or { data: [] }
			const items = (Array.isArray(response) ? response : response.data) || [];

			return items.map((item: ApiSellingProductDetail) => ({
				id: item.id,
				selling_id: item.selling?.id || "",
				qty: item.qty,
				mod_price: item.mod_price,
				total_price: item.total_price,
				note: item.note,
				created_at: item.created_at,
				updated_at: item.updated_at,
				selling_user_name: item.selling?.user?.name || "-",
				selling_market_name: item.selling?.market?.name || "-",
				selling_payment_name: item.selling?.payment?.name || "N/A",
				selling_is_paid: item.selling?.is_paid || "0",
				stock_name:
					item.stock?.product?.name || item.price?.product?.name || null,
				price_value: item.price?.selling || null,
				total_weight:
					typeof item.total_weight === "string"
						? parseFloat(item.total_weight)
						: item.total_weight || 0,
				grade: item.price?.grade?.name || undefined,
				size: item.price?.size?.name || undefined,
			}));
		} catch (error: unknown) {
			console.error("Failed to fetch product details:", error);
			throw error;
		}
	},

	/**
	 * Selling Service Detail - service items in selling transactions
	 */
	getServiceDetails: async (
		marketId?: string,
		startDate?: string,
		endDate?: string,
		sellingId?: string,
	): Promise<SellingServiceDetail[]> => {
		try {
			let url = `/transaction/selling/service/detail/list?`;
			const params = new URLSearchParams();
			if (marketId) params.append("market_id", marketId);
			if (startDate) params.append("start_date", startDate);
			if (endDate) params.append("end_date", endDate);
			if (sellingId) params.append("selling_id", sellingId);

			const queryString = params.toString();
			if (queryString) {
				url += queryString;
			}

			const response = await api.get<ApiSellingServiceDetail[]>(url);
			const items = Array.isArray(response) ? response : [];
			return items.map((item) => ({
				id: item.id,
				selling_id: item.selling?.id || "",
				qty: item.qty,
				mod_price: item.mod_price,
				total_price: item.total_price,
				note: item.note,
				service_name: item.service?.name || null,
				created_at: item.created_at,
				updated_at: item.updated_at,
				selling_user_name: item.selling?.user?.name || "-",
				selling_market_name: item.selling?.market?.name || "-",
				selling_payment_name: item.selling?.payment?.name || "N/A",
				selling_is_paid: item.selling?.is_paid || "0",
			}));
		} catch (error: unknown) {
			console.error("Failed to fetch service details:", error);
			throw error;
		}
	},

	createTransaction: async (
		data: import("../types").CreateTransactionRequest,
	): Promise<Transaction> => {
		try {
			const response = await api.post<{ data: Transaction }>(
				"/transaction/selling/create",
				data,
			);
			return response.data;
		} catch (error: unknown) {
			console.error("Failed to create transaction:", error);
			throw error;
		}
	},

	updateTransaction: async (
		id: string,
		data: Partial<Transaction>,
	): Promise<Transaction> => {
		try {
			const response = await api.patch<Transaction>(
				`/transaction/selling/update/${id}`,
				data,
			);
			return response;
		} catch (error: unknown) {
			console.error("Failed to update transaction:", error);
			throw error;
		}
	},

	deleteTransaction: async (id: string): Promise<void> => {
		try {
			await api.delete(`/transaction/selling/delete/${id}`);
		} catch (error: unknown) {
			console.error("Failed to delete transaction:", error);
			throw error;
		}
	},

	getPaymentMethods: async (): Promise<ApiPayment[]> => {
		try {
			const res = await api.get<ApiPayment[] | { data: ApiPayment[] }>("/transaction/payment-method-list");
			if (Array.isArray(res)) return res;
			return res.data || [];
		} catch (error: unknown) {
			console.error("Failed to get payment methods:", error);
			return [];
		}
	},
};
