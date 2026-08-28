import { useState, useCallback, useEffect } from "react";
import { TransactionService } from "@/services/transaction.service";
import type { Transaction } from "@/types";
import { useAuth } from "./useAuth";
import { useRoleAndPermission } from "./useRoleAndPermission";

interface UseTransactionsOptions {
	startDate?: string;
	endDate?: string;
}

/**
 * Hook to fetch transactions with role-based market filtering.
 * Reusable across DashboardPage, TransactionHistoryPage, etc.
 */
export const useTransactions = ({
	startDate,
	endDate,
}: UseTransactionsOptions) => {
	const { user, marketId: userMarketId } = useAuth();
	const { isCashier, isAdmin, isManager } = useRoleAndPermission();

	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Sumber market id: pakai data user yang segar dari /me (user.market_id /
	// user.market.id). JANGAN fallback ke localStorage (lofish_market_id) karena
	// nilainya bisa stale/tersisa dari sesi lama — backend untuk role KSR/SPVR
	// selalu memaksa req.user.market_id (segar dari DB), jadi mengirim market_id
	// stale di query hanya menyesatkan dan menghasilkan 403 yang membingungkan.
	const marketId = userMarketId || null;

	const fetchTransactions = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const params: {
				marketId?: string;
				startDate?: string;
				endDate?: string;
			} = { startDate, endDate };

			// Role-based market filtering
			if (isCashier && marketId) {
				params.marketId = marketId;
			} else if (!isAdmin && !isManager && marketId) {
				params.marketId = marketId;
			}

			const data = await TransactionService.getTransactions(params);
			setTransactions(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Gagal memuat transaksi");
		} finally {
			setLoading(false);
		}
	}, [startDate, endDate, marketId, isCashier, isAdmin, isManager]);

	// Auto-fetch when dependencies change
	useEffect(() => {
		fetchTransactions();
	}, [fetchTransactions]);

	return {
		transactions,
		loading,
		error,
		marketId,
		user,
		isCashier,
		isAdmin,
		isManager,
		refetch: fetchTransactions,
	};
};
