import { describe, it, expect } from "vitest";
import {
	getGradingLabel,
	generateSkuCode,
	QUALITY_CRITERIA,
	SIZES,
} from "@/utils/grading";

describe("QUALITY_CRITERIA", () => {
	it("has exactly 4 entries", () => {
		expect(QUALITY_CRITERIA).toHaveLength(4);
	});

	it("first entry is Grade A with multiplier 1.2", () => {
		expect(QUALITY_CRITERIA[0]).toMatchObject({ id: "1", priceMultiplier: 1.2 });
	});
});

describe("SIZES", () => {
	it("has exactly 4 entries", () => {
		expect(SIZES).toHaveLength(4);
	});

	it("'Besar' size has the highest price multiplier", () => {
		const max = Math.max(...SIZES.map((s) => s.priceMultiplier));
		const besar = SIZES.find((s) => s.label === "Besar");
		expect(besar?.priceMultiplier).toBe(max);
	});
});

describe("getGradingLabel", () => {
	it("returns 'Besar A' for size=1, quality=1", () => {
		expect(getGradingLabel("1", "1")).toBe("Besar A");
	});

	it("returns 'Sedang Segar' for size=2, quality=2", () => {
		expect(getGradingLabel("2", "2")).toBe("Sedang Segar");
	});

	it("returns 'Kecil Kurang Segar' for size=3, quality=3", () => {
		expect(getGradingLabel("3", "3")).toBe("Kecil Kurang Segar");
	});

	it("returns 'Baby Tidak Segar' for size=4, quality=4", () => {
		expect(getGradingLabel("4", "4")).toBe("Baby Tidak Segar");
	});

	it("returns empty strings for unknown ids", () => {
		const result = getGradingLabel("99", "99");
		expect(result.trim()).toBe("");
	});
});

describe("generateSkuCode", () => {
	it("concatenates product code + size + quality ids", () => {
		expect(generateSkuCode("BANDENG", "1", "2")).toBe("BANDENG12");
	});

	it("works with any alphanumeric product code", () => {
		expect(generateSkuCode("SALMON", "3", "1")).toBe("SALMON31");
	});

	it("handles empty product code", () => {
		expect(generateSkuCode("", "1", "1")).toBe("11");
	});
});
