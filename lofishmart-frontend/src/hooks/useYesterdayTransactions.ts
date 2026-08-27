import { useState, useCallback, useEffect } from "react";
import { subDays, format, startOfDay, endOfDay } from "date-fns";
import { TransactionService } from "@/services/transaction.service";
import type { Transaction } from "@/types";

/**
 * Hook to fetch yesterday's transaction data for comparison.
 */
export const useYesterdayTransactions = () => {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchYesterdayData = useCallback(async () => {
		setLoading(true);
		try {
			const yesterday = subDays(new Date(), 1);
			const data = await TransactionService.getTransactions({
				startDate: format(startOfDay(yesterday), "yyyy-MM-dd"),
				endDate: format(endOfDay(yesterday), "yyyy-MM-dd"),
			});
			setTransactions(data);
		} catch (error) {
			console.error("Failed to fetch yesterday data:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchYesterdayData();
	}, [fetchYesterdayData]);

	return {
		yesterdayTransactions: transactions,
		loadingYesterday: loading,
		refetchYesterday: fetchYesterdayData,
	};
};
