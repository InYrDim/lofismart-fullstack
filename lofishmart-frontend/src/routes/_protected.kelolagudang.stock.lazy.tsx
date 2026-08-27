import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useCallback } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Warehouse,
	AlertTriangle,
	RefreshCw,
	Package,
	Search,
	Edit,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/config/roles";
import { AdminGudangSelector } from "@/components/markets/AdminGudangSelector";
import { formatQty } from "@/utils/format";

import { InventoryService, type StockItem } from "@/services/inventory.service";

export const Route = createLazyFileRoute("/_protected/kelolagudang/stock")({
	component: GudangStockPage,
});

function GudangStockPage() {
	const { roleId: userRole, marketId: userMarketId } = useAuth();

	const [stocks, setStocks] = useState<StockItem[]>([]);
	const [selectedGudangId, setSelectedGudangId] = useState<string>("");
	const [searchQuery, setSearchQuery] = useState("");
	const [loading, setLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Dialog State
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
	const [adjustType, setAdjustType] = useState<"add" | "subtract" | "set">(
		"add",
	);
	const [adjustAmount, setAdjustAmount] = useState<number | "">("");

	const activeGudangId =
		userRole === ROLES.ADMIN ? selectedGudangId : userMarketId;

	const loadStocks = useCallback(async () => {
		if (!activeGudangId) return;
		setLoading(true);
		try {
			const res = await InventoryService.getStockList({
				market_id: activeGudangId,
			});
			// Filter to warehouse-only stocks using the new type field
			const warehouseStocks = (res || []).filter(
				(s) =>
					s.warehouse?.id === activeGudangId ||
					s.werehouse?.id === activeGudangId,
			);
			setStocks(warehouseStocks);
		} catch (error) {
			console.error("Failed to fetch stock list:", error);
		} finally {
			setLoading(false);
		}
	}, [activeGudangId]);

	useEffect(() => {
		loadStocks();
	}, [loadStocks]);

	const filteredStocks = useMemo(() => {
		return stocks.filter((s) => {
			const productName = s.product?.name || "";
			const locationName = s.warehouse?.name || s.werehouse?.name || "Gudang";
			return (
				productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				locationName.toLowerCase().includes(searchQuery.toLowerCase())
			);
		});
	}, [stocks, searchQuery]);

	// Summary stats
	const totalProducts = new Set(filteredStocks.map((s) => s.product?.id)).size;
	const totalQty = filteredStocks.reduce((sum, s) => sum + (s.qty || 0), 0);
	const lowStock = filteredStocks.filter((s) => s.qty > 0 && s.qty < 10).length;

	const openAdjustModal = (stock: StockItem) => {
		setSelectedStock(stock);
		setAdjustType("add");
		setAdjustAmount("");
		setIsModalOpen(true);
	};

	const handleAdjustStock = async () => {
		if (!selectedStock) return;
		if (adjustAmount === "" || isNaN(Number(adjustAmount))) return;

		const amount = Number(adjustAmount);
		let finalQty = selectedStock.qty;

		if (adjustType === "add") {
			finalQty += amount;
		} else if (adjustType === "subtract") {
			finalQty = Math.max(0, finalQty - amount);
		} else if (adjustType === "set") {
			finalQty = amount;
		}

		setIsSubmitting(true);
		try {
		        await InventoryService.updateStock(selectedStock.id, finalQty);
		        await loadStocks();
		        setIsModalOpen(false);
		} catch (error) {
		        console.error("Failed to commit stock manual adjustment", error);
		        toast.error("Gagal memperbarui stok secara manual. Silakan periksa koneksi.");
		} finally {			setIsSubmitting(false);
		}
	};

	const handleDeleteStock = async () => {
		if (!selectedStock) return;
		const confirmed = window.confirm(
			`Hapus stok ${selectedStock.product?.name || "-"} ini secara permanen?`,
		);
		if (!confirmed) return;

		setIsSubmitting(true);
		try {
			await InventoryService.deleteStock(selectedStock.id);
			await loadStocks();
			setIsModalOpen(false);
			toast.success("Stok berhasil dihapus");
		} catch (error) {
			console.error("Failed to delete stock", error);
			toast.error("Gagal menghapus stok. Silakan periksa koneksi.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex flex-col h-full w-full overflow-hidden">
			<AppHeader
				title="Stok Gudang"
				description="Pantau stok barang yang tersedia di gudang"
			>
				<Button
					variant="outline"
					size="sm"
					onClick={loadStocks}
					disabled={loading}
					className="gap-2"
				>
					<RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
					Refresh
				</Button>
			</AppHeader>

			<div className="flex-1 overflow-auto p-6 bg-slate-50/50">
				<AdminGudangSelector
					selectedGudangId={selectedGudangId}
					onSelect={(id) => setSelectedGudangId(id)}
				/>

				{/* Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
								<Package className="w-5 h-5" />
							</div>
							<div>
								<p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
									Total Produk
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{loading ? "..." : totalProducts}
								</p>
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
								<Warehouse className="w-5 h-5" />
							</div>
							<div>
								<p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
									Total Stok
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{loading ? "..." : formatQty(totalQty)}
								</p>
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
								<AlertTriangle className="w-5 h-5" />
							</div>
							<div>
								<p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
									Stok Rendah
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{loading ? "..." : lowStock}
								</p>
							</div>
						</div>
					</div>
				</div>

				<Card className="border-none shadow-sm h-full flex flex-col">
					<div className="p-4 border-b flex items-center justify-between gap-4">
						<div className="relative w-64 max-w-sm">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
							<Input
								placeholder="Cari produk..."
								className="pl-9 bg-slate-50 border-slate-200"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>

					<CardContent className="p-0 flex-1 overflow-auto">
						<Table>
							<TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
								<TableRow className="border-slate-100">
									<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 pl-4">
										ID Stok
									</TableHead>
									<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3">
										Nama Produk
									</TableHead>
									<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3">
										Lokasi Gudang
									</TableHead>
									<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 text-center">
										Satuan
									</TableHead>
									<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 text-right">
										Stok Aktif
									</TableHead>
									<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 text-right pr-4">
										Aksi
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{loading ? (
									<TableRow>
										<TableCell
											colSpan={6}
											className="h-32 text-center text-slate-400"
										>
											<RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50 text-blue-500" />
											<p>Memuat data stok gudang...</p>
										</TableCell>
									</TableRow>
								) : filteredStocks.length > 0 ? (
									filteredStocks.map((p) => {
										const locationName = p.warehouse?.name || "Gudang Utama";
										const unitLabel = p.unit === "1" ? "KG" : "EKOR";

										return (
											<TableRow
												key={p.id}
												className="hover:bg-slate-50/80 border-slate-50"
											>
												<TableCell className="py-3 pl-4 font-mono text-sm text-slate-500">
													...
													{p.id.substring(p.id.length - 6).toUpperCase()}
												</TableCell>
												<TableCell className="py-3 font-medium text-slate-700">
													{p.product?.name || "Produk Tidak Ditemukan"}
												</TableCell>
												<TableCell className="py-3">
													<Badge
														variant="outline"
														className="font-normal text-slate-600 bg-slate-100 border-slate-200"
													>
														{locationName}
													</Badge>
												</TableCell>
												<TableCell className="py-3 text-center">
													<span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">
														{unitLabel}
													</span>
												</TableCell>
												<TableCell className="py-3 text-right">
													<span
														className={`text-sm font-bold ${
															p.qty <= 0
																? "text-red-500"
																: p.qty < 10
																	? "text-amber-500"
																	: "text-emerald-600"
														}`}
													>
														{formatQty(Number(p.qty))}
													</span>
												</TableCell>
												<TableCell className="py-3 text-right pr-4">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => openAdjustModal(p)}
														className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
													>
														<Edit className="w-4 h-4 mr-1" />
														Sesuaikan
													</Button>
												</TableCell>
											</TableRow>
										);
									})
								) : (
									<TableRow>
										<TableCell
											colSpan={6}
											className="h-40 text-center text-slate-400"
										>
											<Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
											<p>Tidak ada stok produk di gudang. Data kosong.</p>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>

			{/* Modal Adjust Stock */}
			<Dialog
				open={isModalOpen}
				onOpenChange={(open) => !isSubmitting && setIsModalOpen(open)}
			>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Sesuaikan Stok Gudang</DialogTitle>
						<DialogDescription>
							Memperbarui data stok{" "}
							<strong>{selectedStock?.product?.name}</strong> langsung ke
							database.
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label className="text-right text-sm font-medium">Lokasi</Label>
							<div className="col-span-3 font-medium text-slate-800 text-sm">
								{selectedStock?.warehouse?.name ||
									selectedStock?.werehouse?.name ||
									"Gudang Utama"}
							</div>
						</div>

						<div className="grid grid-cols-4 items-center gap-4">
							<Label className="text-right text-sm font-medium">
								Stok Saat Ini
							</Label>
							<div className="col-span-3">
								<Badge
									variant="secondary"
									className="text-sm px-3 py-1 bg-slate-100"
								>
									{formatQty(Number(selectedStock?.qty))}{" "}
									{selectedStock?.unit === "1" ? "KG" : "EKOR"}
								</Badge>
							</div>
						</div>

						<div className="grid grid-cols-4 items-start gap-4">
							<Label className="text-right text-sm font-medium pt-2">
								Tipe Aksi
							</Label>
							<div className="col-span-3 flex flex-col gap-2">
								<div className="flex gap-2">
									<Button
										type="button"
										variant={adjustType === "add" ? "default" : "outline"}
										size="sm"
										className={`flex-1 ${adjustType === "add" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
										onClick={() => setAdjustType("add")}
									>
										Tambah (+ve)
									</Button>
									<Button
										type="button"
										variant={adjustType === "subtract" ? "default" : "outline"}
										size="sm"
										className={`flex-1 ${adjustType === "subtract" ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}`}
										onClick={() => setAdjustType("subtract")}
									>
										Kurangi (-ve)
									</Button>
								</div>
								<Button
									type="button"
									variant={adjustType === "set" ? "default" : "outline"}
									size="sm"
									className={`w-full ${adjustType === "set" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
									onClick={() => setAdjustType("set")}
								>
									Set Override Maksimal
								</Button>
							</div>
						</div>

						<div className="grid grid-cols-4 items-center gap-4">
							<Label
								htmlFor="amount"
								className="text-right text-sm font-medium"
							>
								{adjustType === "set" ? "Stok Baru" : "Kuantitas"}
							</Label>
							<div className="col-span-3 relative">
								<Input
									id="amount"
									type="number"
									step={selectedStock?.unit === "2" ? "1" : "0.01"}
									min="0"
									placeholder="Masukkan angka..."
									value={adjustAmount}
									onChange={(e) =>
										setAdjustAmount(
											e.target.value === "" ? "" : Number(e.target.value),
										)
									}
									disabled={isSubmitting}
								/>
								<span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300">
									{selectedStock?.unit === "1" ? "KG" : "EKOR"}
								</span>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="destructive"
							onClick={handleDeleteStock}
							disabled={isSubmitting}
							className="mr-auto"
						>
							Hapus Stok
						</Button>
						<Button
							type="button"
							variant="ghost"
							onClick={() => setIsModalOpen(false)}
							disabled={isSubmitting}
						>
							Batal
						</Button>
						<Button
							type="button"
							onClick={handleAdjustStock}
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<>
									<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
									Menyimpan...
								</>
							) : (
								"Sinkronisasi Ke Database"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
