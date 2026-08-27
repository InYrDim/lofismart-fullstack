import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useCallback } from "react";
import { AppHeader } from "@/components/AppHeader";
import type { Transaction, SellingProductDetail, SellingServiceDetail } from "@/types";
import { TransactionService } from "@/services/transaction.service";
import { ReportService } from "@/services/report.service";
import { AuthService } from "@/services/auth.service";
import { useDateRangeFilter } from "@/hooks/useDateRangeFilter";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw, Download, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatQty } from "@/utils/format";

export const Route = createLazyFileRoute("/_protected/_management/report-item")({
	component: ReportItemPage,
});

function ReportItemPage() {
	const { startDate, endDate, filterType, handleFilterChange } = useDateRangeFilter();
	const [details, setDetails] = useState<SellingProductDetail[]>([]);
	const [services, setServices] = useState<SellingServiceDetail[]>([]);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedMarket, setSelectedMarket] = useState("all");

	const fetchDetails = useCallback(async () => {
		setLoading(true);
		try {
			const marketId = selectedMarket === "all" ? undefined : selectedMarket;
			const [prodData, svcData, txData] = await Promise.all([
				TransactionService.getSellingProductDetails({
					startDate,
					endDate,
					marketId,
				}),
				TransactionService.getServiceDetails(marketId, startDate, endDate),
				TransactionService.getTransactions({
					startDate,
					endDate,
					marketId,
				}),
			]);
			setDetails(prodData);
			setServices(svcData);
			setTransactions(txData);
		} catch (error) {
			console.error("Failed to fetch product details:", error);
		} finally {
			setLoading(false);
		}
	}, [startDate, endDate, selectedMarket]);

	useEffect(() => {
		fetchDetails();
	}, [fetchDetails]);

	const filteredDetails = useMemo(() => {
		return details.filter((item) => {
			const matchesSearch =
				item.stock_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.selling_id.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesSearch;
		})
	}, [details, searchQuery]);

	const markets = useMemo(() => {
		const uniqueMarkets = new Set(details.map((d) => d.selling_market_name));
		return Array.from(uniqueMarkets);
	}, [details]);

	const stats = useMemo(() => {
		const totalQty = filteredDetails.reduce((sum, item) => sum + item.qty, 0);
		const totalRevenue = filteredDetails.reduce(
			(sum, item) => sum + item.total_price,
			0,
		)
		const totalWeight = filteredDetails.reduce(
			(sum, item) => sum + (item.total_weight || 0),
			0,
		)
		return { totalQty, totalRevenue, totalWeight };
	}, [filteredDetails]);

	const formatIDR = (amount: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			maximumFractionDigits: 0,
		}).format(amount);
	}

	const handlePrintRecap = () => {
		if (transactions.length === 0) return;
		const user = AuthService.getCurrentUser();
		ReportService.printSalesRecap(
			transactions,
			`${format(new Date(startDate), "dd MMM yyyy")}${startDate !== endDate ? ` - ${format(new Date(endDate), "dd MMM yyyy")}` : ""}`,
			selectedMarket === "all" ? "Semua Outlet" : selectedMarket,
			user?.name || "Admin",
		);
	};

	const handlePrintReport = () => {
		if (details.length === 0 && services.length === 0) return;
		const user = AuthService.getCurrentUser();
		ReportService.printComprehensiveReport(details, services, {
			dateRange: `${format(new Date(startDate), "dd MMM yyyy")}${startDate !== endDate ? ` - ${format(new Date(endDate), "dd MMM yyyy")}` : ""}`,
			marketName: selectedMarket === "all" ? "Semua Outlet" : selectedMarket,
			userName: user?.name || "Admin",
		});
	};

	return (
		<div className="flex flex-col h-full bg-slate-50/50 w-full overflow-hidden">
			<AppHeader 
				title="Laporan per Item"
				description="Analisis rincian penjualan produk secara mendetail"
			>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						className="h-9 gap-2"
						onClick={handlePrintRecap}
						disabled={loading || transactions.length === 0}
					>
						<Printer className="w-4 h-4" /> Cetak Rekap
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="h-9 gap-2"
						onClick={handlePrintReport}
						disabled={loading || (details.length === 0 && services.length === 0)}
					>
						<Printer className="w-4 h-4" /> Cetak Laporan
					</Button>
				</div>
			</AppHeader>

			<div className="flex-1 overflow-auto">
				{/* Filter & Summary Bar */}
				<div className="p-6 bg-white border-b space-y-6">
					<div className="flex flex-wrap items-center gap-3">
						<div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
							<Button
								variant={filterType === "today" ? "secondary" : "ghost"}
								size="sm"
								className="h-8 shadow-none"
								onClick={() => handleFilterChange("today")}
							>
								Hari Ini
							</Button>
							<Button
								variant={filterType === "week" ? "secondary" : "ghost"}
								size="sm"
								className="h-8 shadow-none"
								onClick={() => handleFilterChange("week")}
							>
								Minggu Ini
							</Button>
							<Button
								variant={filterType === "month" ? "secondary" : "ghost"}
								size="sm"
								className="h-8 shadow-none"
								onClick={() => handleFilterChange("month")}
							>
								Bulan Ini
							</Button>
						</div>

						<div className="h-8 w-[1px] bg-slate-200 mx-1 hidden md:block" />

						<div className="relative flex-1 min-w-[240px]">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
							<Input
								placeholder="Cari produk atau ID transaksi..."
								className="pl-9 h-10 border-slate-200 bg-white"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>

						<Select value={selectedMarket} onChange={(val) => setSelectedMarket(val as string)}>
							<SelectTrigger className="w-[180px] h-10 border-slate-200 bg-white">
								<SelectValue placeholder="Semua Outlet" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Semua Outlet</SelectItem>
								{markets.map((m) => (
									<SelectItem key={m} value={m}>
										{m}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Button
							variant="ghost"
							size="icon"
							className="h-10 w-10 text-slate-500 hover:text-slate-900"
							onClick={() => {
								setSearchQuery("")
								setSelectedMarket("all");
								handleFilterChange("month");
							}}
						>
							<RotateCcw className="w-4 h-4" />
						</Button>
					</div>

					{/* Stats Row */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Card className="border-none shadow-sm bg-blue-600 text-white overflow-hidden relative">
							<div className="absolute right-0 top-0 p-4 opacity-10">
								<Download className="w-16 h-16" />
							</div>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium opacity-90">
									Total Produk Terjual
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{stats.totalQty} <span className="text-sm font-normal opacity-80">item</span>
								</div>
							</CardContent>
						</Card>
						<Card className="border-none shadow-sm bg-emerald-600 text-white overflow-hidden relative">
							<div className="absolute right-0 top-0 p-4 opacity-10">
								<Search className="w-16 h-16" />
							</div>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium opacity-90">
									Total Berat
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{formatQty(stats.totalWeight)}{" "}
									<span className="text-sm font-normal opacity-80">kg</span>
								</div>
							</CardContent>
						</Card>
						<Card className="border-none shadow-sm bg-violet-600 text-white overflow-hidden relative">
							<div className="absolute right-0 top-0 p-4 opacity-10">
								<Download className="w-16 h-16" />
							</div>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium opacity-90">
									Total Pendapatan
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{formatIDR(stats.totalRevenue)}</div>
							</CardContent>
						</Card>
					</div>
				</div>

				<div className="p-6">
					<Card className="border-none shadow-sm">
						<CardContent className="p-0">
							<Table>
								<TableHeader className="bg-slate-50/50">
									<TableRow className="hover:bg-transparent border-slate-100">
										<TableHead className="w-[120px] font-semibold text-slate-700">Tanggal</TableHead>
										<TableHead className="font-semibold text-slate-700">Produk</TableHead>
										<TableHead className="font-semibold text-slate-700">Detail</TableHead>
										<TableHead className="text-right font-semibold text-slate-700">Qty</TableHead>
										<TableHead className="text-right font-semibold text-slate-700">Berat (kg)</TableHead>
										<TableHead className="text-right font-semibold text-slate-700">Harga Jual</TableHead>
										<TableHead className="text-right font-semibold text-slate-700">Total</TableHead>
										<TableHead className="font-semibold text-slate-700">ID Transaksi</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{loading ? (
										Array.from({ length: 5 }).map((_, i) => (
											<TableRow key={i} className="animate-pulse">
												{Array.from({ length: 8 }).map((_, j) => (
													<TableCell key={j}>
														<div className="h-4 bg-slate-100 rounded"></div>
													</TableCell>
												))}
											</TableRow>
										))
									) : filteredDetails.length > 0 ? (
										filteredDetails.map((item) => (
											<TableRow key={item.id} className="hover:bg-slate-50 border-slate-50 group">
												<TableCell className="text-slate-500 text-sm">
													{format(new Date(item.created_at), "dd MMM yyyy", {
														locale: localeId,
													})}
												</TableCell>
												<TableCell>
													<div className="font-medium text-slate-900">
														{item.stock_name}
													</div>
													<div className="text-xs text-slate-500">
														{item.selling_market_name}
													</div>
												</TableCell>
												<TableCell>
													<div className="flex gap-1">
														{item.grade && (
															<Badge
																variant="secondary"
																className="bg-slate-100 text-slate-600 font-normal text-[10px]"
															>
																{item.grade}
															</Badge>
														)}
														{item.size && (
															<Badge
																variant="secondary"
																className="bg-slate-100 text-slate-600 font-normal text-[10px]"
															>
																{item.size}
															</Badge>
														)}
													</div>
												</TableCell>
												<TableCell className="text-right font-medium text-slate-700">
													{item.qty}
												</TableCell>
												<TableCell className="text-right font-medium text-slate-700">
													{item.total_weight ? formatQty(item.total_weight) : "-"}
												</TableCell>
												<TableCell className="text-right text-slate-600">
													{formatIDR(item.mod_price)}
												</TableCell>
												<TableCell className="text-right font-bold text-slate-900">
													{formatIDR(item.total_price)}
												</TableCell>
												<TableCell>
													<code className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded group-hover:text-slate-600 group-hover:bg-slate-200 transition-colors">
														{item.selling_id}
													</code>
												</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={8} className="h-32 text-center text-slate-500">
												Tidak ada rincian produk yang ditemukan.
											</TableCell>
										</TableRow>
									)}
									<TableRow className="bg-slate-50/50 font-semibold border-t-2">
										<TableCell colSpan={3} className="text-right py-4">
											Total Periode Ini
										</TableCell>
										<TableCell className="text-right py-4">
											{stats.totalQty.toLocaleString("id-ID")}
										</TableCell>
										<TableCell className="text-right py-4">
											{formatQty(stats.totalWeight)}
										</TableCell>
										<TableCell />
										<TableCell className="text-right py-4">
											{formatIDR(stats.totalRevenue)}
										</TableCell>
										<TableCell />
									</TableRow>
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
