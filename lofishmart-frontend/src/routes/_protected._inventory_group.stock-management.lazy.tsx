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
import { Package, Search, Edit, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { InventoryService, type StockItem } from "@/services/inventory.service";
import { formatQty } from "@/utils/format";

export const Route = createLazyFileRoute("/_protected/_inventory_group/stock-management")({
	component: StockManagementPage,
});

function StockManagementPage() {
	const [stocks, setStocks] = useState<StockItem[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [loading, setLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Dialog State
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
	const [adjustType, setAdjustType] = useState<"add" | "subtract" | "set">("add");
	const [adjustAmount, setAdjustAmount] = useState<number | "">("");

	const loadStocks = useCallback(async () => {
		setLoading(true);
		try {
			// Fetches real stocks from database. If user is scoped (SPVR/GDNG), the backend
			// already filters this to their assigned market.
			const res = await InventoryService.getStockList();
			setStocks(res || []);
		} catch (error) {
			console.error("Failed to fetch stock list:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadStocks();
	}, [loadStocks]);

	const filteredStocks = useMemo(() => {
		return stocks.filter((s) => {
			const productName = s.product?.name || "";
			const marketName = s.market?.name || s.werehouse?.name || "Gudang Utama";
			return (
				productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				marketName.toLowerCase().includes(searchQuery.toLowerCase())
			);
		});
	}, [stocks, searchQuery]);

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
			// Sync with backend API
			await InventoryService.updateStock(selectedStock.id, finalQty);

			// Refresh list after success
			await loadStocks();
			setIsModalOpen(false);
		} catch (error) {
		        console.error("Failed to commit stock manual adjustment", error);
		        toast.error("Gagal memperbarui stok secara manual. Silakan periksa koneksi.");
		} finally {			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex flex-col h-full w-full overflow-hidden">
			<AppHeader title="Manajemen Stok" description="Sesuaikan stok inventaris secara manual (Koneksi Langsung Database)">
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
				<Card className="border-none shadow-sm h-full flex flex-col">
					<div className="p-4 border-b flex items-center justify-between gap-4">
						<div className="relative w-64 max-w-sm">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
							<Input
								placeholder="Cari produk atau lokasi..."
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
									<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 pl-4">ID Stok</TableHead>
									<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3">Nama Produk</TableHead>
									<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3">Lokasi Fisik</TableHead>
									<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 text-center">Satuan</TableHead>
									<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 text-right">Stok Aktif</TableHead>
									<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 text-right pr-4">Aksi</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{loading ? (
									<TableRow>
										<TableCell colSpan={6} className="h-32 text-center text-slate-400">
											<RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50 text-blue-500" />
											<p>Mengambil sinkronisasi data dari server...</p>
										</TableCell>
									</TableRow>
								) : filteredStocks.length > 0 ? (
									filteredStocks.map((p) => {
										const locationName = p.market?.name || p.werehouse?.name || "Gudang Utama";
										const unitLabel = p.unit === "1" ? "KG" : "EKOR";

										return (
											<TableRow key={p.id} className="hover:bg-slate-50/80 border-slate-50">
												<TableCell className="py-3 pl-4 font-mono text-sm text-slate-500">
													...{p.id.substring(p.id.length - 6).toUpperCase()}
												</TableCell>
												<TableCell className="py-3 font-medium text-slate-700">
													{p.product?.name || "Produk Tidak Ditemukan"}
												</TableCell>
												<TableCell className="py-3">
													<Badge variant="outline" className={`font-normal ${p.market?.name ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-slate-600 bg-slate-100 border-slate-200'}`}>
														{locationName}
													</Badge>
												</TableCell>
												<TableCell className="py-3 text-center">
													<span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">
														{unitLabel}
													</span>
												</TableCell>
												<TableCell className="py-3 text-right">
													<span className={`text-sm font-bold ${p.qty <= 0 ? "text-red-500" : p.qty < 10 ? "text-amber-500" : "text-emerald-600"}`}>
														{formatQty(Number(p.qty))}
													</span>
												</TableCell>
												<TableCell className="py-3 text-right pr-4">
													<Button variant="ghost" size="sm" onClick={() => openAdjustModal(p)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
														<Edit className="w-4 h-4 mr-1" />
														Sesuaikan
													</Button>
												</TableCell>
											</TableRow>
										);
									})
								) : (
									<TableRow>
										<TableCell colSpan={6} className="h-40 text-center text-slate-400">
											<Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
											<p>Tidak ada stok produk yang sesuai. Data kosong.</p>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>

			{/* Modal Adjust Stock */}
			<Dialog open={isModalOpen} onOpenChange={(open) => !isSubmitting && setIsModalOpen(open)}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Sesuaikan Stok Real-time</DialogTitle>
						<DialogDescription>
							Memperbarui data stok <strong>{selectedStock?.product?.name}</strong> langsung ke database. Data Gudang & Ekspor Dashboard juga akan berubah!
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label className="text-right text-sm font-medium">Lokasi</Label>
							<div className="col-span-3 font-medium text-slate-800 text-sm">
								{selectedStock?.market?.name || selectedStock?.werehouse?.name || "Gudang Utama"}
							</div>
						</div>

						<div className="grid grid-cols-4 items-center gap-4">
							<Label className="text-right text-sm font-medium">Stok Saat Ini</Label>
							<div className="col-span-3">
								<Badge variant="secondary" className="text-sm px-3 py-1 bg-slate-100">
									{formatQty(Number(selectedStock?.qty))} {selectedStock?.unit === "1" ? "KG" : "EKOR"}
								</Badge>
							</div>
						</div>

						<div className="grid grid-cols-4 items-start gap-4">
							<Label className="text-right text-sm font-medium pt-2">Tipe Aksi</Label>
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
							<Label htmlFor="amount" className="text-right text-sm font-medium">
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
									onChange={(e) => setAdjustAmount(e.target.value === "" ? "" : Number(e.target.value))}
									disabled={isSubmitting}
								/>
								<span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300">
									{selectedStock?.unit === "1" ? "KG" : "EKOR"}
								</span>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Batal</Button>
						<Button type="button" onClick={handleAdjustStock} disabled={isSubmitting}>
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
