import { describe, it, expect, vi, beforeEach } from "vitest";
import { TransactionService } from "@/services/transaction.service";
import type { CreateTransactionRequest } from "@/types";

// Mock the api module
vi.mock("../../utils/api", () => ({
	api: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockApi = (await import("../../utils/api")).api as any;

function makePayload(overrides: Partial<CreateTransactionRequest> = {}): CreateTransactionRequest {
	return {
		date: "2026-06-14",
		total_price: 0,
		payed_money: 0,
		change_money: 0,
		is_paid: "1",
		market_id: "MKT001",
		user_id: "USR001",
		total_weight_qty: 0,
		totol_pcs_qty: 0,
		price: 0,
		per_item_disc: 0,
		voucher_disc: 0,
		total_disc: 0,
		tax_price: 0,
		online_order: "1",
		note: "",
		items: JSON.stringify([]),
		...overrides,
	};
}

describe("TransactionService.createTransaction", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("sends correct payload and returns transaction data", async () => {
		const mockTransaction = {
			id: "TESTTRX001",
			total_price: 150000,
			is_paid: "3",
			market: { id: "MKT001", name: "Test Market" },
			user: { id: "USR001", name: "Test User" },
		};

		mockApi.post.mockResolvedValue({ data: mockTransaction });

		const payload = makePayload({
			total_price: 150000,
			payed_money: 150000,
			change_money: 0,
			is_paid: "3",
			total_weight_qty: 10,
			payment_method_id: "PM001",
			price: 150000,
			items: JSON.stringify([
				{ stock_id: "STK001", qty: 5, price_id: "PRC001", total_price: 75000 },
				{ stock_id: "STK002", qty: 5, price_id: "PRC002", total_price: 75000 },
			]),
		});

		const result = await TransactionService.createTransaction(payload);

		expect(mockApi.post).toHaveBeenCalledWith(
			"/transaction/selling/create",
			payload,
		);
		expect(result).toEqual(mockTransaction);
	});

	it("handles API errors gracefully", async () => {
		mockApi.post.mockRejectedValue(new Error("Network error"));

		const payload = makePayload({ is_paid: "1" });

		await expect(
			TransactionService.createTransaction(payload),
		).rejects.toThrow("Network error");
	});

	it("sends items as JSON stringified array", async () => {
		mockApi.post.mockResolvedValue({ data: { id: "TEST" } });

		const items = [
			{ stock_id: "STK001", qty: 3, total_price: 45000 },
		];

		await TransactionService.createTransaction(
			makePayload({
				total_price: 45000,
				payed_money: 45000,
				is_paid: "3",
				total_weight_qty: 3,
				price: 45000,
				items: JSON.stringify(items),
			}),
		);

		const callArg = mockApi.post.mock.calls[0][1];
		expect(typeof callArg.items).toBe("string");
		const parsed = JSON.parse(callArg.items);
		expect(parsed).toEqual(items);
	});
});

describe("TransactionService.getTransactions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("maps API response to Transaction interface", async () => {
		const apiResponse = {
			data: [
				{
					id: "TRX001",
					total_weight_qty: 10,
					totol_pcs_qty: 0,
					price: 150000,
					per_item_disc: 0,
					voucher_disc: 0,
					total_disc: 0,
					tax_price: 0,
					total_price: 150000,
					payed_money: 150000,
					change_money: 0,
					is_paid: "3",
					online_order: "1",
					note: null,
					created_at: "2026-06-14T10:00:00.000Z",
					updated_at: "2026-06-14T10:00:00.000Z",
					deleted_at: null,
					user: { id: "USR001", name: "Kasir 1" },
					market: { id: "MKT001", name: "Outlet A" },
					payment: { id: "PM001", name: "Tunai" },
					member: null,
					voucher: null,
				},
			],
			pagination: {
				page: 1,
				limit: 20,
				total: 1,
				totalPages: 1,
			},
		};

		mockApi.get.mockResolvedValue(apiResponse);

		const result = await TransactionService.getTransactions({ marketId: "MKT001" });

		expect(mockApi.get).toHaveBeenCalledWith(
			expect.stringContaining("/transaction/selling/list"),
		);
		expect(result).toHaveLength(1);
		expect(result[0].id).toBe("TRX001");
		expect(result[0].cashier_name).toBe("Kasir 1");
		expect(result[0].market_name).toBe("Outlet A");
		expect(result[0].payment_method).toBe("Tunai");
	});

	it("returns empty array when API returns no data", async () => {
		mockApi.get.mockResolvedValue({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
		const result = await TransactionService.getTransactions({});
		expect(result).toEqual([]);
	});

	it("handles API failure gracefully", async () => {
		mockApi.get.mockRejectedValue(new Error("Failed to fetch"));
		await expect(TransactionService.getTransactions({})).rejects.toThrow("Failed to fetch");
	});
});

describe("TransactionService.getSellingProductDetails", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("maps stock_name from stock.product.name", async () => {
		const apiResponse = [
			{
				id: "DET001",
				qty: 5,
				mod_price: 0,
				total_price: 75000,
				total_weight: "5",
				note: null,
				created_at: "2026-06-14T10:00:00.000Z",
				updated_at: "2026-06-14T10:00:00.000Z",
				selling: {
					id: "TRX001",
					user: { name: "Kasir 1" },
					market: { name: "Outlet A" },
					payment: { name: "Tunai" },
					is_paid: "3",
				},
				stock: {
					product: { name: "Ikan Bandeng" },
				},
				price: {
					selling: 15000,
					grade: { name: "A" },
					size: { name: "Besar" },
				},
			},
		];

		mockApi.get.mockResolvedValue(apiResponse);

		const result = await TransactionService.getSellingProductDetails({ sellingId: "TRX001" });

		expect(result).toHaveLength(1);
		expect(result[0].stock_name).toBe("Ikan Bandeng");
		expect(result[0].grade).toBe("A");
		expect(result[0].size).toBe("Besar");
	});

	it("falls back to price.product.name when stock is null", async () => {
		const apiResponse = [
			{
				id: "DET002",
				qty: 1,
				mod_price: 0,
				total_price: 25000,
				total_weight: "0",
				note: null,
				created_at: "2026-06-14T10:00:00.000Z",
				updated_at: "2026-06-14T10:00:00.000Z",
				selling: { id: "TRX002", user: null, market: null, payment: null, is_paid: "3" },
				stock: null,
				price: { selling: 25000, product: { name: "Service Item" } },
			},
		];

		mockApi.get.mockResolvedValue(apiResponse);

		const result = await TransactionService.getSellingProductDetails({});
		expect(result[0].stock_name).toBe("Service Item");
	});
});
