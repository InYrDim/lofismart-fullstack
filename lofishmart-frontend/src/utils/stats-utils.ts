import type { Transaction } from "@/types";

/**
 * Calculates total revenue from an array of transactions.
 */
export const calculateTotalRevenue = (transactions: Transaction[]): number => {
	return transactions.reduce((sum, trx) => sum + trx.total_price, 0);
};

/**
 * Calculates percentage change between current and previous values.
 */
export const calculatePercentageChange = (
	current: number,
	previous: number,
): number => {
	if (previous === 0) {
		return current > 0 ? 100 : 0;
	}
	return ((current - previous) / previous) * 100;
};

/**
 * Sorts and slices recent transactions.
 */
export const getRecentTransactions = (
	transactions: Transaction[],
	limit: number = 5,
): Transaction[] => {
	return [...transactions]
		.sort(
			(a, b) =>
				new Date(b.transaction_date).getTime() -
				new Date(a.transaction_date).getTime(),
		)
		.slice(0, limit);
};

/**
 * Gets unique active cashier names.
 */
export const getActiveCashiers = (transactions: Transaction[]): string[] => {
	return [
		...new Set(
			transactions
				.map((t) => t.cashier_name)
				.filter((name): name is string => Boolean(name)),
		),
	];
};

/**
 * Counts unpaid transactions.
 */
export const getUnpaidCount = (transactions: Transaction[]): number => {
	return transactions.filter((t) => t.is_paid === "2").length;
};
