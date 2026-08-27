import { useEffect, useState, useCallback } from "react";
import { createLazyFileRoute } from '@tanstack/react-router';
import { AppHeader } from "@/components/AppHeader";

export const Route = createLazyFileRoute('/_protected/transactions')({
	component: TransactionHistoryPage,
});
import { useNavigate } from "@tanstack/react-router";
import { TransactionService } from "@/services/transaction.service";
import type { Transaction } from "@/types";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportService } from "@/services/report.service";
import { AuthService } from "@/services/auth.service";
import { useRoleAndPermission } from "@/hooks/useRoleAndPermission";
// import { useRoleAndPermission } from "@/hooks/useRoleAndPermission"; // Removed unused import
import { SalesDashboard } from "@/components/reports/SalesDashboard";
import { format } from "date-fns";
import { TransactionSummaryCards } from "@/components/transaction/TransactionSummaryCards";
import { TransactionListTable } from "@/components/transaction/TransactionListTable";
import { TransactionDetailSidebar } from "@/components/transaction/TransactionDetailSidebar";
import { Select } from "@/components/ui/select";
import { storage } from "@/utils/storage";
import { useAuth } from "@/hooks/useAuth";
import { useDateRangeFilter } from "@/hooks/useDateRangeFilter";

type ViewMode = "dashboard" | "list";

function TransactionHistoryPage() {
	const navigate = useNavigate();

	const [viewMode, setViewMode] = useState<ViewMode>("dashboard");

	// Use Filter Hook
	const {
		startDate,
		endDate,
		filterType,
		setFilterType,
		handleFilterChange,
		setManualDateRange,
	} = useDateRangeFilter("month");

	// All Selling state
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [marketId, setMarketId] = useState<string | null>(null);
	// User Role Check using hook
	const { user } = useAuth();
	const { isCashier, isAdmin, isManager, isSupervisor } = useRoleAndPermission();

	const [isRestricted, setIsRestricted] = useState(false);

	// Detail State
	const [selectedTransaction, setSelectedTransaction] =
		useState<Transaction | null>(null);

	// Fetch market ID and User Role on mount
	useEffect(() => {
		const loadData = async () => {
			try {
				const idMarket = storage.getMarketId();
				setMarketId(idMarket);

				if (isCashier) {
					setIsRestricted(true);
					// Force date to today for Cashier
					const today = format(new Date(), "yyyy-MM-dd");
					setManualDateRange(today, today);
					setFilterType("today");
				} else if (isSupervisor) {
					setIsRestricted(true);
				} else {
					setIsRestricted(false);
				}
			} catch (err: unknown) {
				setError(
					err instanceof Error ? err.message : "Failed to load profile.",
				)
			}
		}
		loadData();
		fetchTransactions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isCashier, isSupervisor]);

	const fetchTransactions = useCallback(async () => {
		setLoading(true);
		setError(null);

		// Admin and Manager: see all (no market filter)
		// SPVR, GDNG, Cashier: scoped to their market
		const useMarketId =
			isAdmin || isManager ? undefined : marketId || undefined;

		try {
			const data = await TransactionService.getTransactions({
				marketId: useMarketId,
				startDate,
				endDate,
				userId: isCashier ? user?.id : undefined,
			})
			setTransactions(data);
		} catch (err: unknown) {
			console.error("Fetch error:", err);
			setError(err instanceof Error ? err.message : "Failed to load data.");
		} finally {
			setLoading(false);
		}
	}, [startDate, endDate, marketId, isCashier, isAdmin, isManager, user?.id]);

	// Fetch transactions whenever relevant state changes
	useEffect(() => {
		// If Admin/Manager, no need to wait for marketId
		if (
			(marketId || isAdmin || isManager) &&
			(viewMode === "list" || viewMode === "dashboard")
		) {
			// Actually we need transactions for dashboard too
			fetchTransactions();
		}
	}, [marketId, viewMode, fetchTransactions, isAdmin, isManager]);

	const handleRefresh = () => {
		if (marketId || isAdmin || isManager) {
			fetchTransactions();
		}
	}

	<TransactionDetailSidebar
		isOpen={!!selectedTransaction}
		transaction={selectedTransaction}
		onClose={() => setSelectedTransaction(null)}
		startDate={startDate}
		endDate={endDate}
		marketId={isAdmin || isManager ? undefined : marketId || ""}
	/>

	const handleDateChange = (start: string, end: string) => {
		setManualDateRange(start, end);
	}

	// --- Metrics Calculation ---
	const totalRevenue = transactions.reduce(
		(acc, curr) => acc + curr.total_price,
		0,
	)
	const totalTransactions = transactions.length;
	const avgTransactionValue =
		totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
	const unpaidTransactionsCount = transactions.filter(
		(t) => t.is_paid === "2",
	).length;

	// --- Filtered data ---
	const filteredTransactions = transactions.filter(
		(t) =>
			t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(t.customer_name &&
				t.customer_name.toLowerCase().includes(searchTerm.toLowerCase())),
	)

	const handlePrint = () => {
		if (filteredTransactions.length === 0) return;
		const user = AuthService.getCurrentUser();
		const marketName = filteredTransactions[0]?.market_name || "Lofish Mart";

		ReportService.printSalesRecap(
			filteredTransactions,
			"Laporan Penjualan",
			marketName,
			user?.name || "Admin",
		)
	}

	return (
		<div className="flex bg-gray-50 w-full h-full overflow-hidden">
			{/* Main Content */}
			<div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
				<AppHeader title="Riwayat Transaksi" />

				<main className="flex-1 overflow-y-auto p-6">
					{viewMode === "dashboard" ? (
						<SalesDashboard
							transactions={transactions}
							startDate={startDate}
							endDate={endDate}
							onDateChange={handleDateChange}
							onViewDetails={() => setViewMode("list")}
							isRestricted={isRestricted}
							filterType={filterType}
							onFilterChange={handleFilterChange}
						/>
					) : (
						<>
							{/* Navigation Back */}
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
								<div className="flex items-center gap-4">
									<Button variant="ghost" size="icon-sm" onClick={() => {
										setViewMode("dashboard")
										setSelectedTransaction(null)
									}} className="text-gray-500">
										<ArrowLeft className="w-5 h-5" />
									</Button>
									<div>
										<h2 className="text-lg font-bold text-gray-800">
											Detail Penjualan
										</h2>
										<p className="text-gray-500 text-sm">
											{format(new Date(startDate), "d MMM yyyy")}
											{startDate !== endDate &&
												` - ${format(new Date(endDate), `d MMM yyyy`)}`}
										</p>
									</div>
								</div>

								<div className="w-full sm:w-48 ml-auto">
									{(isAdmin || isManager) && (
										<Select
											options={[
												{ label: "Hari Ini", value: "today" },
												{ label: "Minggu Ini", value: "week" },
												{ label: "Bulan Ini", value: "month" },
												{ label: "Tahun Ini", value: "year" },
												{ label: "Semua", value: "all" },
											]}
											value={filterType}
											onChange={handleFilterChange}
											className="bg-white"
										/>
									)}
								</div>
							</div>

							<TransactionSummaryCards
								totalRevenue={totalRevenue}
								totalTransactions={totalTransactions}
								avgTransactionValue={avgTransactionValue}
								unpaidTransactionsCount={unpaidTransactionsCount}
							/>

							{error && (
								<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
									Error: {error}
								</div>
							)}

							<TransactionListTable
								transactions={filteredTransactions.slice(0, 5)}
								loading={loading}
								searchTerm={searchTerm}
								onSearchChange={setSearchTerm}
								onRefresh={handleRefresh}
								onPrint={handlePrint}
								onRowClick={setSelectedTransaction}
								selectedTransactionId={selectedTransaction?.id}
							/>

							{!loading && (
								<div className="mt-4 flex justify-end">
									<Button
										variant="ghost"
										onClick={() => navigate({ to: '/data-transaksi' })}
										className="text-brand-primary hover:text-brand-primary/80 hover:bg-brand-primary/5 gap-2 px-4 h-9 text-sm font-medium transition-all duration-200"
									>
										Lihat Selengkapnya
										<ArrowRight className="w-4 h-4" />
									</Button>
								</div>
							)}

						</>
					)}
				</main>
			</div>
			<TransactionDetailSidebar
				isOpen={!!selectedTransaction}
				transaction={selectedTransaction}
				onClose={() => setSelectedTransaction(null)}
				startDate={startDate}
				endDate={endDate}
				marketId={marketId || ""}
			/>
		</div>
	)
};
