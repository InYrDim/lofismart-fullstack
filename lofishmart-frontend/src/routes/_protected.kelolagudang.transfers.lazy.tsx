import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalFooter } from "@/components/ui/modals/Modal";
import {
	Truck,
	Plus,
	RefreshCw,
	Package,
	Send,
	Search,
	Minus,
	Check,
	Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
	TransferOrderService,
	InventoryService,
	// type StockTransfer,
	type StockItem,
} from "@/services/inventory.service";
import { ProfileService } from "@/services/profile.service";
import { TransferOrderList } from "@/components/markets/TransferOrderList";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/config/roles";
import { formatQty } from "@/utils/format";
import { AdminGudangSelector } from "@/components/markets/AdminGudangSelector";
import type { StockTransfer } from "@/types";

interface CartItem {
	tempId: string;
	sourceStockId: string;
	productId: string;
	productName: string;
	unit: '1' | '2';
	maxQty: number;
	qty: number;
}

let _tempIdCounter = 0;
function nextTempId() {
	return `cart_${++_tempIdCounter}_${Date.now()}`;
}

export const Route = createLazyFileRoute(
	"/_protected/kelolagudang/transfers",
)({
	component: GudangTransferPage,
});

function GudangTransferPage() {
	const { roleId: userRole, marketId: userMarketId } = useAuth();

	const [transfers, setTransfers] = useState<StockTransfer[]>([]);
	const [selectedGudangId, setSelectedGudangId] = useState("");
	const [loading, setLoading] = useState(true);

	// Create form
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [stocks, setStocks] = useState<StockItem[]>([]);
	const [markets, setMarkets] = useState<any[]>([]);
	const [formLoading, setFormLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	// Form fields (bulk cart)
	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const [targetMarketId, setTargetMarketId] = useState("");
	const [transferNotes, setTransferNotes] = useState("");

	const activeGudangId = userRole === ROLES.ADMIN ? selectedGudangId : userMarketId;

	const loadTransfers = useCallback(async () => {
		if (!activeGudangId) return;
		setLoading(true);
		try {
			const data = await TransferOrderService.list({
				source_market_id: activeGudangId,
			});
			setTransfers(data || []);
		} catch (error) {
			console.error("Failed to fetch transfers:", error);
		} finally {
			setLoading(false);
		}
	}, [activeGudangId]);

	useEffect(() => {
		loadTransfers();
	}, [loadTransfers]);

	const openCreateModal = async () => {
		setIsCreateOpen(true);
		setFormLoading(true);
		try {
			const [stockRes, marketRes] = await Promise.all([
				InventoryService.getStockList({ market_id: activeGudangId }),
				ProfileService.getMarketProfiles(),
			])
			// Only warehouse stocks for current warehouse
			const warehouseStocks = (stockRes || []).filter(
				(s) => (s.werehouse?.id === activeGudangId || s.warehouse?.id === activeGudangId) && s.qty > 0,
			)
			setStocks(warehouseStocks);
			setMarkets(marketRes || []);
		} catch (error) {
			console.error("Failed to load form data:", error);
			toast.error("Gagal memuat data form");
		} finally {
			setFormLoading(false);
		}
	}

	const [stockSearch, setStockSearch] = useState("");
	const [activeTab, setActiveTab] = useState<"produk" | "keranjang">("produk");

	const filteredStocks = useMemo(
		() =>
			stocks.filter((s) => {
				if (!stockSearch) return true;
				const q = stockSearch.toLowerCase();
				const name = (s.product?.name || "").toLowerCase();
				const warehouse = (s.warehouse?.name || s.werehouse?.name || "").toLowerCase();
				return name.includes(q) || warehouse.includes(q);
			}),
		[stocks, stockSearch],
	);

	const isInCart = (stockId: string) => cartItems.some((ci) => ci.sourceStockId === stockId);

	const addToCart = (stock: StockItem) => {
		const stockId = stock.id;
		if (isInCart(stockId)) {
			toast.info("Produk sudah ada di keranjang");
			return;
		}
		setCartItems((prev) => [
			...prev,
			{
				tempId: nextTempId(),
				sourceStockId: stockId,
				productId: stock.product?.id || "",
				productName: stock.product?.name || "?",
				unit: stock.unit,
				maxQty: stock.qty,
				qty: 0,
			},
		]);
	};

	const removeFromCart = (tempId: string) => {
		setCartItems((prev) => prev.filter((ci) => ci.tempId !== tempId));
	};

	const updateCartQty = (tempId: string, qty: number) => {
		setCartItems((prev) =>
			prev.map((ci) =>
				ci.tempId === tempId
					? { ...ci, qty: Math.max(0, Math.min(qty, ci.maxQty)) }
					: ci,
			),
		);
	};

	const applyQuickPctToCart = (tempId: string, pct: number) => {
		setCartItems((prev) =>
			prev.map((ci) => {
				if (ci.tempId !== tempId) return ci;
				const qty = ci.maxQty * (pct / 100);
				const fmt = ci.unit === "2" ? Math.round(qty) : qty;
				return { ...ci, qty: Math.max(0, Math.min(fmt, ci.maxQty)) };
			}),
		);
	};

	const handleBulkCreateTransfer = async () => {
		const validItems = cartItems.filter((ci) => ci.qty > 0);
		if (validItems.length === 0) {
			toast.error("Minimal 1 item dengan jumlah > 0");
			return;
		}
		if (!targetMarketId) {
			toast.error("Outlet tujuan wajib diisi");
			return;
		}

		setSubmitting(true);
		try {
			const res = await TransferOrderService.bulkCreate({
				items: validItems.map((ci) => ({
					source_stock_id: ci.sourceStockId,
					product_id: ci.productId,
					qty: ci.unit === "2" ? Math.round(ci.qty) : ci.qty,
					unit: ci.unit,
					target_market_id: targetMarketId,
				})),
				notes: transferNotes || undefined,
			});
			toast.success(`${validItems.length} transfer order berhasil dibuat!`, {
				description: `Kode Batch: #${res.transfer_group.slice(-8).toUpperCase()}`,
			});
			setIsCreateOpen(false);
			resetForm();
			await loadTransfers();
		} catch (err: any) {
			toast.error(err.message || "Gagal membuat transfer order");
		} finally {
			setSubmitting(false);
		}
	}

	const resetForm = () => {
		setCartItems([]);
		setTargetMarketId("");
		setTransferNotes("");
		setStockSearch("");
	}

	const marketOptions = [
		{ label: "— Pilih Outlet Tujuan —", value: "" },
		...markets
			.filter((m: any) => m.type === "OUTLET")
			.map((m: any) => ({
				label: m.name,
				value: m.id,
			})),
	]

	const formatStockQty = (stock: StockItem) =>
		`${formatQty(Number(stock.qty))} ${stock.unit === "1" ? "KG" : "Ekor"}`;

	return (
		<div className="flex flex-col h-full w-full overflow-hidden">
			<AppHeader
				title="Transfer ke Outlet"
				description="Kirim stok gudang ke outlet/market"
			>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={loadTransfers}
						disabled={loading}
						className="gap-2"
					>
						<RefreshCw
							className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
						/>
						Refresh
					</Button>
					<Button
						size="sm"
						className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
						onClick={openCreateModal}
					>
						<Plus className="w-4 h-4" />
						Buat Transfer
					</Button>
				</div>
			</AppHeader>

			<div className="flex-1 overflow-auto p-6 bg-slate-50/50">
				<AdminGudangSelector 
					selectedGudangId={selectedGudangId} 
					onSelect={(id) => setSelectedGudangId(id)} 
				/>

				{loading ? (
					<div className="flex flex-col items-center justify-center py-20 text-gray-400">
						<RefreshCw className="w-8 h-8 animate-spin opacity-50 text-blue-500 mb-3" />
						<p className="text-sm">Memuat data transfer...</p>
					</div>
				) : transfers.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 text-gray-400">
						<Truck className="w-16 h-16 mb-4 opacity-20" />
						<p className="text-lg font-medium text-gray-500">
							Belum ada transfer
						</p>
						<p className="text-sm text-gray-400 mb-6">
							Klik "Buat Transfer" untuk mengirim stok ke outlet.
						</p>
						<Button
							onClick={openCreateModal}
							className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
						>
							<Plus className="w-4 h-4" />
							Buat Transfer Pertama
						</Button>
					</div>
				) : (
					<TransferOrderList
						transfers={transfers}
						userRole={userRole}
						onSuccess={loadTransfers}
					/>
				)}
			</div>

			{/* Create Transfer Modal */}
			<Modal
				isOpen={isCreateOpen}
				onClose={() => {
					if (!submitting) {
						setIsCreateOpen(false);
						resetForm()
					}
				}}
				title="Buat Transfer Order"
				description="Kirim barang dari gudang ke outlet tujuan"
				size="4xl"
			>
				{formLoading ? (
					<div className="flex items-center justify-center py-16">
						<RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
					</div>
				) : (
					<div className="p-5 max-h-[70vh] overflow-y-auto space-y-5">
						{/* Master Info: Outlet + Notes */}
						<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
							<h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
								<Truck className="w-4 h-4 text-blue-600" />
								Tujuan Transfer
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-xs font-medium text-gray-600 mb-1">
										Outlet Tujuan <span className="text-red-500">*</span>
									</label>
									<Select
										value={targetMarketId}
										onChange={(v) => setTargetMarketId(String(v))}
										options={marketOptions}
										placeholder="Pilih outlet..."
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-600 mb-1">
										Catatan (Opsional)
									</label>
									<input
										value={transferNotes}
										onChange={(e) => setTransferNotes(e.target.value)}
										placeholder="Catatan pengiriman..."
										className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm outline-none transition-[color,box-shadow] focus-visible:border-blue-400 focus-visible:ring-[3px] focus-visible:ring-blue-100"
									/>
								</div>
							</div>
						</div>

						{/* Tab: Produk / Keranjang Transfer */}
						<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
							<div className="flex border-b border-gray-200 bg-gray-50">
								<button
									type="button"
									onClick={() => setActiveTab("produk")}
									className={`flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
										activeTab === "produk"
											? "text-blue-700 bg-white"
											: "text-gray-500 hover:text-gray-700"
									}`}
								>
									<Package className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
									Produk
									{activeTab === "produk" && (
										<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
									)}
								</button>
								<button
									type="button"
									onClick={() => setActiveTab("keranjang")}
									className={`flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
										activeTab === "keranjang"
											? "text-blue-700 bg-white"
											: "text-gray-500 hover:text-gray-700"
									}`}
								>
									<Truck className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
									Keranjang
									{cartItems.length > 0 && (
										<span className="ml-1.5 px-1.5 py-0.5 bg-blue-600 text-white rounded-full text-[9px] font-bold">
											{cartItems.filter((ci) => ci.qty > 0).length}
										</span>
									)}
									{activeTab === "keranjang" && (
										<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
									)}
								</button>
							</div>

							{/* Tab: Produk */}
							{activeTab === "produk" && (
								<>
									<div className="px-4 py-2.5 border-b border-gray-100">
										<div className="relative">
											<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
											<input
												type="text"
												value={stockSearch}
												onChange={(e) => setStockSearch(e.target.value)}
												placeholder="Cari produk..."
												className="h-8 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 py-1 text-sm shadow-sm outline-none transition-[color,box-shadow] focus-visible:border-blue-400 focus-visible:ring-[3px] focus-visible:ring-blue-100"
											/>
										</div>
									</div>
									{stocks.length === 0 ? (
										<div className="flex flex-col items-center justify-center py-10 text-gray-400">
											<Package className="w-10 h-10 mb-2 opacity-20" />
											<p className="text-sm">Tidak ada stok tersedia untuk ditransfer</p>
										</div>
									) : (
										<div className="max-h-[340px] overflow-y-auto divide-y divide-gray-50">
											{filteredStocks.length === 0 ? (
												<div className="text-xs text-gray-400 py-6 text-center">Produk tidak ditemukan</div>
											) : (
												filteredStocks.map((s) => {
													const inCart = isInCart(s.id);
													return (
														<div key={s.id} className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50/40 transition-colors">
															<div className="flex-1 min-w-0">
																<div className="flex items-center gap-1.5">
																	<span className="text-sm font-medium text-gray-800 truncate">{s.product?.name || "?"}</span>
																	<Badge variant={s.unit === "2" ? "secondary" : "default"} className="text-[10px] px-1.5 py-0 h-4 font-semibold shrink-0">
																		{s.unit === "1" ? "KG" : "EKOR"}
																	</Badge>
																</div>
																<div className="text-xs text-gray-500">
																	Stok: <span className="font-semibold text-blue-600">{formatStockQty(s)}</span>
																</div>
															</div>
															<Button
																type="button" size="sm"
																variant={inCart ? "outline" : "default"}
																className={`shrink-0 gap-1 text-xs h-7 px-2 ${inCart ? "text-green-600 border-green-300" : ""}`}
																disabled={inCart}
																onClick={() => { addToCart(s); setStockSearch(""); }}
															>
																{inCart ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
																{inCart ? "Sudah" : "Tambah"}
															</Button>
														</div>
													);
												})
											)}
										</div>
									)}
								</>
							)}

							{/* Tab: Keranjang Transfer */}
							{activeTab === "keranjang" && (
								<>
									{cartItems.length === 0 ? (
										<div className="flex flex-col items-center justify-center py-12 text-gray-400">
											<Truck className="w-10 h-10 mb-2 opacity-20" />
											<p className="text-sm">Belum ada produk</p>
											<p className="text-xs mt-1">Tambahkan produk dari tab Produk</p>
										</div>
									) : (
										<div className="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
											{cartItems.map((ci) => {
												const stock = stocks.find((s) => s.id === ci.sourceStockId);
												const stockQty = stock?.qty ?? ci.maxQty;
												const sliderPct = stockQty > 0 ? Math.round((ci.qty / stockQty) * 100) : 0;
												return (
													<div key={ci.tempId} className="px-4 py-3 space-y-2">
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-1.5 min-w-0">
																<span className="text-sm font-semibold text-gray-800 truncate">{ci.productName}</span>
																<Badge variant={ci.unit === "1" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 h-4 font-semibold shrink-0">
																	{ci.unit === "1" ? "KG" : "EKOR"}
																</Badge>
															</div>
															<div className="flex items-center gap-2">
																<span className="text-[10px] text-gray-400">
																	Stok: <strong>{`${formatQty(Number(stockQty))} ${ci.unit === "1" ? "KG" : "Ekor"}`}</strong>
																</span>
																<button type="button" onClick={() => removeFromCart(ci.tempId)} className="text-gray-400 hover:text-red-500 transition-colors p-0.5">
																	<Trash2 className="w-3.5 h-3.5" />
																</button>
															</div>
														</div>

														<div className="flex items-center gap-1">
															<button type="button" onClick={() => { const step = ci.unit === "2" ? 1 : 0.5; updateCartQty(ci.tempId, ci.qty - step); }} disabled={ci.qty <= 0}
																className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
															><Minus className="w-3.5 h-3.5" /></button>
															<input type="number" step={ci.unit === "2" ? "1" : "0.01"} min="0" max={stockQty}
																value={ci.qty === 0 ? "" : ci.qty}
																onChange={(e) => { const v = e.target.value === "" ? 0 : Number(e.target.value); updateCartQty(ci.tempId, isNaN(v) ? 0 : v); }}
																placeholder="0"
																className="h-8 w-20 min-w-0 rounded-none border-x-0 border-y border-gray-200 bg-white px-1 py-1 text-xs text-center font-semibold shadow-sm outline-none focus-visible:border-blue-400 focus-visible:ring-[3px] focus-visible:ring-blue-100 [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
															/>
															<button type="button" onClick={() => { const step = ci.unit === "2" ? 1 : 0.5; updateCartQty(ci.tempId, Math.min(stockQty, ci.qty + step)); }} disabled={ci.qty >= stockQty}
																className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
															><Plus className="w-3.5 h-3.5" /></button>
															<span className="ml-1 text-[10px] font-bold text-gray-400 min-w-[28px]">{ci.unit === "1" ? "KG" : "PCS"}</span>
														</div>

														<div>
															<div className="flex items-center justify-between mb-0.5">
																<span className="text-[10px] text-gray-400">0%</span>
																<span className="text-[10px] font-medium text-blue-600">{sliderPct}%</span>
																<span className="text-[10px] text-gray-400">100%</span>
															</div>
															<Slider value={[sliderPct]} onValueChange={([pct]) => {
																const qty = stockQty * (pct / 100);
																const fmt = Number(formatQty(qty));
																updateCartQty(ci.tempId, Math.max(0, Math.min(fmt, stockQty)));
															}} max={100} step={1} />
														</div>

														<div className="flex flex-wrap gap-1">
															{[100, 75, 50, 25].map((pct) => (
																<button key={pct} type="button" onClick={() => applyQuickPctToCart(ci.tempId, pct)}
																	className="px-2 py-0.5 text-[10px] font-medium rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
																>{pct}%</button>
															))}
															<button type="button" onClick={() => { const cur = ci.qty; const add = stockQty * 0.1; updateCartQty(ci.tempId, Math.min(stockQty, cur + add)); }} disabled={ci.qty >= stockQty}
																className="px-2 py-0.5 text-[10px] font-medium rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors disabled:opacity-40"
															>+10%</button>
															<button type="button" onClick={() => { const cur = ci.qty; const sub = stockQty * 0.1; updateCartQty(ci.tempId, Math.max(0, cur - sub)); }} disabled={ci.qty <= 0}
																className="px-2 py-0.5 text-[10px] font-medium rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors disabled:opacity-40"
															>-10%</button>
														</div>

														{ci.qty > 0 && (
															<div className="text-[10px] text-gray-400">
																Sisa stok: <strong>{`${formatQty(stockQty - ci.qty)} KG`}</strong>
															</div>
														)}
													</div>
												);
											})}
										</div>
									)}
								</>
							)}
						</div>
					</div>
				)}

				<div className="border-t border-gray-100 shrink-0" />

				<ModalFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							setIsCreateOpen(false)
							resetForm()
						}}
						disabled={submitting}
					>
						Batal
					</Button>
					<Button
						type="button"
						className="bg-blue-600 hover:bg-blue-700 text-white"
						onClick={handleBulkCreateTransfer}
						disabled={
							submitting ||
							cartItems.filter((ci) => ci.qty > 0).length === 0 ||
							!targetMarketId
						}
					>
						{submitting ? (
							<>
								<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
								Mengirim...
							</>
						) : (
							<>
								<Send className="w-4 h-4 mr-2" />
								Kirim {cartItems.filter((ci) => ci.qty > 0).length} Transfer
							</>
						)}
					</Button>
				</ModalFooter>
			</Modal>
		</div>
	)
}
