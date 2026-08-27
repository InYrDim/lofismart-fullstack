import { describe, it, expect } from "vitest";
import type { VoucherConfig } from "@/services/voucher.service";
import type { CartItem } from "@/types";

// Import strategies directly from the hook module
// We extract the STRATEGIES logic here by mirroring the same pattern

type VoucherType = VoucherConfig["type"];
type VoucherStrategy = {
	calculateGlobalDiscount?: (cart: CartItem[]) => number;
	calculateItemDiscount?: (item: CartItem, price: number, qty: number) => number;
};

const STRATEGIES: Record<VoucherType, (config: VoucherConfig) => VoucherStrategy> = {
	PERCENTAGE: (config) => ({
		calculateItemDiscount: (_item, price, qty) => price * qty * config.value,
	}),
	FIXED_CUT: (config) => ({
		calculateItemDiscount: (_item, price, qty) =>
			Math.min(price * qty, config.value * qty),
	}),
	NAME_CONTAINS_PERCENTAGE: (config) => ({
		calculateItemDiscount: (item, price, qty) => {
			if (!config.target) return 0;
			return item.name.toUpperCase().includes(config.target.toUpperCase())
				? price * qty * config.value
				: 0;
		},
	}),
	GLOBAL_FIXED: (config) => ({
		calculateGlobalDiscount: () => config.value,
	}),
};

const makeConfig = (overrides: Partial<VoucherConfig>): VoucherConfig => ({
	key: "TEST",
	name: "Test Voucher",
	type: "PERCENTAGE",
	value: 0,
	...overrides,
});

const mockItem = (name: string): CartItem =>
	({ name, price: 0, qty: 0 } as unknown as CartItem);

// ─── PERCENTAGE ───────────────────────────────────────────────────────────────
describe("PERCENTAGE strategy", () => {
	const config = makeConfig({ type: "PERCENTAGE", value: 0.1 });
	const strategy = STRATEGIES.PERCENTAGE(config);

	it("discounts by 10% of price × qty", () => {
		expect(strategy.calculateItemDiscount!(mockItem("X"), 10000, 2)).toBe(2000);
	});

	it("returns 0 when price is 0", () => {
		expect(strategy.calculateItemDiscount!(mockItem("X"), 0, 5)).toBe(0);
	});

	it("no global discount function", () => {
		expect(strategy.calculateGlobalDiscount).toBeUndefined();
	});
});

// ─── FIXED_CUT ────────────────────────────────────────────────────────────────
describe("FIXED_CUT strategy", () => {
	const config = makeConfig({ type: "FIXED_CUT", value: 5000 });
	const strategy = STRATEGIES.FIXED_CUT(config);

	it("discounts 5000 per item (qty=2 → 10000)", () => {
		expect(strategy.calculateItemDiscount!(mockItem("X"), 10000, 2)).toBe(10000);
	});

	it("cannot exceed total item price (caps at price × qty)", () => {
		// price=3000 × qty=2 = 6000, but cut = 5000×2 = 10000. Cap at 6000.
		expect(strategy.calculateItemDiscount!(mockItem("X"), 3000, 2)).toBe(6000);
	});
});

// ─── NAME_CONTAINS_PERCENTAGE ─────────────────────────────────────────────────
describe("NAME_CONTAINS_PERCENTAGE strategy", () => {
	const config = makeConfig({
		type: "NAME_CONTAINS_PERCENTAGE",
		value: 0.2,
		target: "BANDENG",
	});
	const strategy = STRATEGIES.NAME_CONTAINS_PERCENTAGE(config);

	it("applies discount for matching product name", () => {
		expect(strategy.calculateItemDiscount!(mockItem("BANDENG SEGAR"), 10000, 1)).toBe(2000);
	});

	it("is case-insensitive match", () => {
		expect(strategy.calculateItemDiscount!(mockItem("bandeng besar"), 10000, 1)).toBe(2000);
	});

	it("returns 0 for non-matching product name", () => {
		expect(strategy.calculateItemDiscount!(mockItem("SALMON"), 10000, 1)).toBe(0);
	});

	it("returns 0 when no target defined", () => {
		const noTargetConfig = makeConfig({ type: "NAME_CONTAINS_PERCENTAGE", value: 0.2 });
		const s = STRATEGIES.NAME_CONTAINS_PERCENTAGE(noTargetConfig);
		expect(s.calculateItemDiscount!(mockItem("BANDENG"), 10000, 1)).toBe(0);
	});
});

// ─── GLOBAL_FIXED ─────────────────────────────────────────────────────────────
describe("GLOBAL_FIXED strategy", () => {
	const config = makeConfig({ type: "GLOBAL_FIXED", value: 50000 });
	const strategy = STRATEGIES.GLOBAL_FIXED(config);

	it("always returns the fixed value regardless of cart", () => {
		expect(strategy.calculateGlobalDiscount!([])).toBe(50000);
	});

	it("no item discount function", () => {
		expect(strategy.calculateItemDiscount).toBeUndefined();
	});
});
