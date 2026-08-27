export type VoucherType =
	| "PERCENTAGE"
	| "FIXED_CUT"
	| "NAME_CONTAINS_PERCENTAGE"
	| "GLOBAL_FIXED";

export interface VoucherConfig {
	key: string;
	name: string;
	type: VoucherType;
	value: number; // Percentage (0.1) or Fixed Amount (5000)
	target?: string; // For NAME_CONTAINS, e.g., "CHANNA"
}

// Simulated Database
const VOUCHERS_DB: VoucherConfig[] = [
	{
		key: "ITEM10",
		name: "Diskon Item 10%",
		type: "PERCENTAGE",
		value: 0.1,
	},
	{
		key: "POTONG5K",
		name: "Potong 5rb per Item",
		type: "FIXED_CUT",
		value: 5000,
	},
	{
		key: "BANDENG20",
		name: "BANDENG Fest 20%",
		type: "NAME_CONTAINS_PERCENTAGE",
		value: 0.2,
		target: "BANDENG",
	},
	{
		key: "GLOBAL50",
		name: "Potongan Total 50rb",
		type: "GLOBAL_FIXED",
		value: 50000,
	},
];

export const VoucherService = {
	getVoucher: async (code: string): Promise<VoucherConfig | null> => {
		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 500));

		const cleanCode = code.trim().toUpperCase();
		const voucher = VOUCHERS_DB.find((v) => v.key === cleanCode);

		return voucher || null;
	},
};
