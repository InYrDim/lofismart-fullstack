import { useState, useEffect } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { AppHeader } from "@/components/AppHeader";
import { useRoleAndPermission } from "@/hooks/useRoleAndPermission";
import { useDateRangeFilter } from "@/hooks/useDateRangeFilter";
import { useTransactions } from "@/hooks/useTransactions";
import { useYesterdayTransactions } from "@/hooks/useYesterdayTransactions";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";

// Dashboard modular components
import { AdminStats } from "@/components/dashboard/AdminStats";
import { CashierStats } from "@/components/dashboard/CashierStats";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";

// Chart components
import { SalesWidget } from "@/components/widgets/SalesWidget";
import { PaymentMethodChart } from "@/components/charts/PaymentMethodChart";
import { PaymentRatioChart } from "@/components/charts/PaymentRatioChart";

// Hooks
import { useSetupStatus } from "@/hooks/useSetupStatus";

// Components
import { UnassignedOutletModal } from "@/components/ui/modals/UnassignedOutletModal";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, XCircle, Store, Package, Users, History, type LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

// Utilities
import * as StatsUtils from "@/utils/stats-utils";

export const Route = createLazyFileRoute('/_protected/dashboard')({
	component: DashboardPage,
});

function DashboardPage() {
	const navigate = Route.useNavigate();
	// The `useAuth` hook should return { user, token, etc. }
	const { isAdmin, isCashier } = useRoleAndPermission();

	const { items: setupItems, missingItems, isLoading: setupLoading } = useSetupStatus();

	// ═══ Outlet assignment check for KSR / SPVR ═══
	const { isSupervisor } = useRoleAndPermission();
	const { marketId } = useAuth();
	const [showUnassignedModal, setShowUnassignedModal] = useState(false);

	useEffect(() => {
		const isScopedRole = isCashier || isSupervisor;
		if (isScopedRole && !marketId) {
			setShowUnassignedModal(true);
		} else {
			setShowUnassignedModal(false);
		}
	}, [isCashier, isSupervisor, marketId]);

	const {
		startDate,
		endDate,
		filterType,
		handleFilterChange,
	} = useDateRangeFilter(isCashier ? "today" : "month");

	// Use reusable hook for transactions
	const { transactions, loading, user } = useTransactions({
		startDate,
		endDate,
	})

	const getGreeting = (): string => {
		const hour = new Date().getHours();
		if (hour < 12) return "Selamat Pagi";
		if (hour < 15) return "Selamat Siang";
		if (hour < 18) return "Selamat Sore";
		return "Selamat Malam";
	};

	const { yesterdayTransactions } = useYesterdayTransactions();


	// Calculations using utilities
	const todayRevenue = StatsUtils.calculateTotalRevenue(transactions);
	const yesterdayRevenue = StatsUtils.calculateTotalRevenue(yesterdayTransactions);

	const revenueChange = StatsUtils.calculatePercentageChange(
		todayRevenue,
		yesterdayRevenue,
	);

	const todayCount = transactions.length;
	const yesterdayCount = yesterdayTransactions.length;
	const countChange = StatsUtils.calculatePercentageChange(
		todayCount,
		yesterdayCount,
	);

	const activeCashiers = StatsUtils.getActiveCashiers(transactions);
	const unpaidCount = StatsUtils.getUnpaidCount(transactions);
	const recentTransactions = transactions.slice(0, 5);

	interface QuickAction {
		label: string;
		path: string;
		icon: LucideIcon;
		color: string;
	}

	const quickActions: QuickAction[] = [
		{
			label: "Point of Sale (POS)",
			path: "/pos",
			icon: Store,
			color: "bg-blue-600",
		},
		{
			label: "Data Transaksi",
			path: "/data-transaksi",
			icon: History,
			color: "bg-amber-500",
		},
		{
			label: "Manajemen Produk",
			path: "/products",
			icon: Package,
			color: "bg-purple-600",
		},
		{
			label: "Manajemen User",
			path: "/users",
			icon: Users,
			color: "bg-emerald-600",
		},
	];

	return (
		<div className="bg-gray-50 w-full overflow-scroll">
			<AppHeader
				title={`${getGreeting()}, ${user?.name || "User"} 👋`}
				description={
					<div className="flex items-center gap-2">
						<span>{format(new Date(), "EEEE, d MMMM yyyy", { locale: idLocale })}</span>
						{(user?.market || user?.market_id) && (
							<>
								<span className="w-1 h-1 rounded-full bg-gray-300" />
								<div className="flex items-center gap-1 text-brand-primary font-bold">
									<Store className="w-3 h-3" />
									<span>Tugas di: {user?.market?.name || user?.market_id}</span>
								</div>
							</>
						)}
					</div>
				}
			/>

			{/* Admin Setup Alert */}
			{!setupLoading && missingItems.length > 0 && isAdmin && (
				<div className="px-4 sm:px-6 mt-6">
					<Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
						<AlertCircle className="h-4 w-4 text-amber-600" />
						<AlertTitle className="text-amber-900 font-bold">Konfigurasi Dibutuhkan</AlertTitle>
						<AlertDescription className="text-amber-800">
							<p className="mb-3">Lengkapi data berikut agar semua fitur berjalan optimal:</p>
							<div className="space-y-1.5">
								{setupItems.map((item) => (
									<div key={item.label} className="flex items-center gap-2">
										{item.ok ? (
											<CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
										) : (
											<XCircle className="w-4 h-4 text-red-500 shrink-0" />
										)}
										<span className={item.ok ? "line-through text-amber-600" : ""}>
											{item.label}
										</span>
										{!item.ok && (
											<Link
												to={item.link}
												className="text-xs font-bold underline hover:text-amber-950 transition-colors ml-1"
											>
												Tambah
											</Link>
										)}
									</div>
								))}
							</div>
						</AlertDescription>
					</Alert>
				</div>
			)}

			{/* Bento Grid Content */}
			<main className="p-4 sm:p-6 mx-auto overflow-scroll">
				{loading ? (
					<div className="grid grid-cols-4 lg:grid-cols-12 gap-4">
						{[...Array(6)].map((_, i) => (
							<div
								key={i}
								className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse ${i === 0 ? `col-span-4 lg:col-span-5 row-span-2` : `col-span-2 lg:col-span-3`} `}
							>
								<div className="h-4 bg-gray-200 rounded w-24 mb-3" />
								<div className="h-8 bg-gray-200 rounded w-32" />
							</div>
						))}
					</div>
				) : (
					<div className="grid grid-cols-4 lg:grid-cols-12 gap-4 auto-rows-min">
						{/* ═══ TIER 1: Role-Based Stats ═══ */}
						{isCashier ? (
							<CashierStats
								todayRevenue={todayRevenue}
								todayCount={todayCount}
								unpaidCount={unpaidCount}
							/>
						) : (
							<AdminStats
								todayRevenue={todayRevenue}
								yesterdayRevenue={yesterdayRevenue}
								revenueChange={revenueChange}
								todayCount={todayCount}
								countChange={countChange}
								unpaidCount={unpaidCount}
								activeCashiers={activeCashiers}
							/>
						)}

						{/* Total Berat */}
						{/* <div className="col-span-2 lg:col-span-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
							<div className="flex items-center justify-between mb-3">
								<p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
									Total Berat
								</p>
								<div className="bg-purple-50 text-purple-600 p-2 rounded-lg">
									<Scale className="w-4 h-4" />
								</div>
							</div>
							<p className="text-2xl font-bold text-gray-900">
								{formatQty(totalWeight)}{" "}
								<span className="text-sm font-normal text-gray-500">kg</span>
							</p>
							<p className="text-xs text-gray-400 mt-2">
								Daging & Produk Timbang
							</p>
						</div> */}

						{/* Total Item (pcs) */}
						{/* <div className="col-span-2 lg:col-span-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
							<div className="flex items-center justify-between mb-3">
								<p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
									Total Item
								</p>
								<div className="bg-rose-50 text-rose-600 p-2 rounded-lg">
									<Package className="w-4 h-4" />
								</div>
							</div>
							<p className="text-2xl font-bold text-gray-900">
								{totalPcs}{" "}
								<span className="text-sm font-normal text-gray-500">pcs</span>
							</p>
							<p className="text-xs text-gray-400 mt-2">Produk Satuan</p>
						</div> */}

						{/* ═══ TIER 2: Sales Trend ═══ */}
						<div className="col-span-4 lg:col-span-12">
							<SalesWidget
								data={transactions}
								isRestricted={isCashier}
								filterType={filterType}
								onFilterChange={handleFilterChange}
							/>
						</div>

						{/* ═══ TIER 3: Recent Activity + Breakdowns ═══ */}

						<RecentTransactions
							transactions={recentTransactions}
							onNavigate={(path) => navigate({ to: path })}
						/>

						{/* Payment Method Chart */}
						<div className="col-span-4 lg:col-span-4">
							<PaymentMethodChart data={transactions} />
						</div>

						{/* Payment Ratio Chart */}
						<div className="col-span-4 lg:col-span-3">
							<PaymentRatioChart data={transactions} />
						</div>

						{/* ═══ TIER 4: Market Sales + Quick Actions ═══ */}

						{/* {(isAdmin || isManager) && (
							<div className="col-span-4 lg:col-span-9">
								<MarketSalesChart
									data={transactions}
									filterType={filterType}
									onFilterChange={handleFilterChange}
								/>
							</div>
						)} */}

						<div
							className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${ isAdmin ? `col-span-4 lg:col-span-3` : `col-span-4 lg:col-span-12` } `}
						>
							<h3 className="text-base font-bold text-gray-900 mb-4">
								Aksi Cepat
							</h3>
							<div className="space-y-2.5">
								{quickActions.map((action) => {
									const Icon = action.icon
									return (
										<button
											key={action.path}
											onClick={() => navigate({ to: action.path })}
											className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group"
										>
											<div
												className={`${action.color} p-2 rounded-lg text-white`}
											>
												<Icon className="w-4 h-4" />
											</div>
											<span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
												{action.label}
											</span>
										</button>
									)
								})}
							</div>
						</div>
					</div>
				)}
			</main>

			{/* ═══ Outlet Assignment Warning Modal ═══ */}
			<UnassignedOutletModal
				isOpen={showUnassignedModal}
				onClose={() => setShowUnassignedModal(false)}
			/>
		</div>
	)
};
