import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import { ProductService } from "@/services/product.service";
import type { Product, MarketStock } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, AlertTriangle, Package, Warehouse, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatQty } from "@/utils/format";

export const Route = createLazyFileRoute("/_protected/_inventory_group/inventory-dashboard")({
	component: InventoryDashboardPage,
});

function InventoryDashboardPage() {
	const [inventory, setInventory] = useState<MarketStock[]>([]);
	const [allProducts, setAllProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const navigate = Route.useNavigate();

	const fetchInventory = async () => {
		setLoading(true);
		setError(null);
		try {
			const [dashboardData, productsData] = await Promise.all([
				ProductService.getInventoryDashboard(),
				ProductService.getBaseProducts(),
			]);
			setInventory(dashboardData);
			setAllProducts(productsData);
		} catch (error: unknown) {
			console.error("Failed to fetch inventory dashboard:", error);
			const message = error instanceof Error ? error.message : "Gagal memuat data inventaris server.";
			setError(message);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchInventory();
	}, []);

	return (
		<div className="flex flex-col h-full bg-slate-50/50 w-full overflow-hidden">
			<AppHeader title="Dashboard Stok" description="Pusat Monitoring Stok & Inventaris Global">
				<div className="flex items-center gap-2">
					<Button
						variant="default"
						size="sm"
						onClick={() => navigate({ to: "/pos" })}
						className="gap-2 bg-blue-600 hover:bg-blue-700 font-bold"
					>
						<Store className="w-4 h-4" />
						Buka POS (Point of Sale)
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={fetchInventory}
						disabled={loading}
						className="gap-2"
					>
						<RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
						Refresh
					</Button>
				</div>
			</AppHeader>

			<div className="flex-1 overflow-auto">
				{/* Content wrapper with padding */}
				<div className="p-6">
					{error ? (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-6 rounded-xl flex flex-col items-center gap-4 text-center max-w-lg mx-auto mt-12">
							<AlertTriangle className="w-12 h-12 text-red-500" />
							<div>
								<h3 className="font-bold text-lg">Ups! Terjadi Kesalahan</h3>
								<p className="text-sm opacity-80 mt-1">{error}</p>
							</div>
							<Button onClick={fetchInventory} variant="outline" className="mt-2">
								Coba Lagi
							</Button>
						</div>
					) : loading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{[1, 2, 3].map((i) => (
								<Card key={i} className="animate-pulse h-64 border-none shadow-sm" />
							))}
						</div>
					) : inventory.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{inventory.map((market) => (
								<MarketStockCard
									key={market.marketId}
									market={market}
									allProducts={allProducts}
								/>
							))}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center h-64 text-slate-500">
							<Package className="w-12 h-12 mb-4 opacity-20" />
							<p>Tidak ada data inventaris yang ditemukan.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

function MarketStockCard({ market, allProducts }: { market: MarketStock, allProducts: Product[] }) {
	const isGudang = market.marketId === "Gudang" || market.marketName.toLowerCase().includes("gudang");

	const products = useMemo(() => {
		return Object.entries(market)
			.filter(([key]) => !["marketId", "marketName"].includes(key))
			.map(([name, qty]) => {
				const productInfo = allProducts.find(p => p.name === name);
				let unit = "kg";
				if (productInfo) {
					unit = productInfo.unit === "PCS" ? "ekor" : "kg";
				}
				return { name, qty: Number(qty), unit };
			})
			.sort((a, b) => b.qty - a.qty);
	}, [market, allProducts]);

	// INFO: setting minimal jumlah stok untuk notifikasi stok menipis
	const lowStockItems = useMemo(() => {
		return products.filter((p) => p.qty < 10 && p.qty > 0);
	}, [products]);

	const outOfStockItems = useMemo(() => {
		return products.filter((p) => p.qty <= 0);
	}, [products]);

	return (
		<Card className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
			<CardHeader className={`pb-4 ${isGudang ? "bg-slate-900 text-white" : "bg-blue-600 text-white"}`}>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-white/20 rounded-lg">
							{isGudang ? <Warehouse className="w-5 h-5" /> : <Store className="w-5 h-5" />}
						</div>
						<div>
							<CardTitle className="text-lg font-bold">{market.marketName}</CardTitle>
							<Badge variant="secondary" className="bg-white/20 text-white border-none text-[10px] mt-1 font-normal uppercase tracking-wider">
								{isGudang ? "Primary Distribution" : "Retail Outlet"}
							</Badge>
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent className="p-0 flex-1 flex flex-col">
				<div className="p-4 grid grid-cols-2 gap-4 border-b bg-slate-50/50">
					<div>
						<p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Produk</p>
						<p className="text-xl font-bold text-slate-700">{products.length}</p>
					</div>
					{lowStockItems.length > 0 && (
						<div>
							<p className="text-[10px] uppercase font-bold text-amber-500 tracking-wider flex items-center gap-1">
								<AlertTriangle className="w-3 h-3" /> Stok Menipis
							</p>
							<p className="text-xl font-bold text-amber-600">{lowStockItems.length}</p>
						</div>
					)}
				</div>

				<div className="flex-1 overflow-auto max-h-[300px]">
					<Table>
						<TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
							<TableRow className="hover:bg-transparent border-slate-100">
								<TableHead className="text-[11px] font-bold text-slate-500 uppercase py-3">Nama Produk</TableHead>
								<TableHead className="text-right text-[11px] font-bold text-slate-500 uppercase py-3">Stok</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{products.length > 0 ? (
								products.map((p) => (
									<TableRow key={p.name} className="hover:bg-slate-50/80 border-slate-50 group">
										<TableCell className="py-3">
											<span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
												{p.name}
											</span>
										</TableCell>
										<TableCell className="text-right py-3">
											<span className={`text-sm font-bold ${p.qty <= 0 ? "text-red-500" :
												p.qty < 10 ? "text-amber-500" :
													"text-slate-900"
												}`}>
												{formatQty(p.qty)} {p.unit}
											</span>

										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={2} className="h-20 text-center text-slate-400 text-xs">
										Tidak ada produk terdaftar.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>

				{(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
					<div className="p-3 bg-slate-50 border-t mt-auto">
						<p className="text-[10px] text-slate-400 italic">
							* Data stok di atas telah dikategorikan berdasarkan batas minimum
							stok yang ditentukan.
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
