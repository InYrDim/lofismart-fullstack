import { describe, it, expect } from "vitest";
import {
	formatCurrency,
	formatCompactCurrency,
	formatNumber,
} from "@/utils/format";

describe("formatCurrency", () => {
	it("formats 150000 as Rp + 150.000", () => {
		const result = formatCurrency(150000);
		expect(result).toMatch(/^Rp/);
		expect(result).toContain("150.000");
	});

	it("formats 0 — includes Rp prefix", () => {
		const result = formatCurrency(0);
		expect(result).toMatch(/^Rp/);
		expect(result).toContain("0");
	});

	it("formats 1000000 correctly", () => {
		const result = formatCurrency(1000000);
		expect(result).toMatch(/^Rp/);
		expect(result).toContain("1.000.000");
	});

	it("formats negative values", () => {
		expect(formatCurrency(-5000)).toContain("5.000");
	});
});

describe("formatCompactCurrency", () => {
	it("formats millions as jt suffix", () => {
		expect(formatCompactCurrency(1500000)).toBe("1.5jt");
	});

	it("formats exact million", () => {
		expect(formatCompactCurrency(1000000)).toBe("1.0jt");
	});

	it("formats thousands as rb suffix", () => {
		expect(formatCompactCurrency(50000)).toBe("50rb");
	});

	it("formats small numbers as plain string", () => {
		expect(formatCompactCurrency(500)).toBe("500");
	});

	it("formats 0 as '0'", () => {
		expect(formatCompactCurrency(0)).toBe("0");
	});
});

describe("formatNumber", () => {
	it("formats 12345 with Indonesian separator", () => {
		expect(formatNumber(12345)).toBe("12.345");
	});

	it("formats 0", () => {
		expect(formatNumber(0)).toBe("0");
	});

	it("formats 1000000", () => {
		expect(formatNumber(1000000)).toBe("1.000.000");
	});
});
