import { describe, it, expect, vi, beforeEach } from "vitest";
import { VoucherService } from "@/services/voucher.service";

describe("VoucherService.getVoucher", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	it("returns config for valid voucher code ITEM10", async () => {
		const promise = VoucherService.getVoucher("ITEM10");
		vi.advanceTimersByTime(600);
		const result = await promise;
		expect(result).not.toBeNull();
		expect(result?.key).toBe("ITEM10");
		expect(result?.type).toBe("PERCENTAGE");
		expect(result?.value).toBe(0.1);
	});

	it("returns null for unknown voucher code", async () => {
		const promise = VoucherService.getVoucher("NOTEXIST");
		vi.advanceTimersByTime(600);
		const result = await promise;
		expect(result).toBeNull();
	});

	it("is case-insensitive (lowercase input works)", async () => {
		const promise = VoucherService.getVoucher("item10");
		vi.advanceTimersByTime(600);
		const result = await promise;
		expect(result?.key).toBe("ITEM10");
	});

	it("trims whitespace before lookup", async () => {
		const promise = VoucherService.getVoucher("  ITEM10  ");
		vi.advanceTimersByTime(600);
		const result = await promise;
		expect(result?.key).toBe("ITEM10");
	});

	it("returns config for POTONG5K", async () => {
		const promise = VoucherService.getVoucher("POTONG5K");
		vi.advanceTimersByTime(600);
		const result = await promise;
		expect(result?.type).toBe("FIXED_CUT");
		expect(result?.value).toBe(5000);
	});

	it("returns config for BANDENG20 with target field", async () => {
		const promise = VoucherService.getVoucher("BANDENG20");
		vi.advanceTimersByTime(600);
		const result = await promise;
		expect(result?.type).toBe("NAME_CONTAINS_PERCENTAGE");
		expect(result?.target).toBe("BANDENG");
		expect(result?.value).toBe(0.2);
	});

	it("returns config for GLOBAL50", async () => {
		const promise = VoucherService.getVoucher("GLOBAL50");
		vi.advanceTimersByTime(600);
		const result = await promise;
		expect(result?.type).toBe("GLOBAL_FIXED");
		expect(result?.value).toBe(50000);
	});
});
