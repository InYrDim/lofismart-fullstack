import { useState, useEffect, useCallback, useContext } from "react";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { InventoryService } from "@/services/inventory.service";
import { ProfileService } from "@/services/profile.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModalFooter } from "@/components/ui/modals/Modal";
import {
	AlertCircle,
	Check,
	PackageOpen,
	Truck,
	Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthContext } from "@/context/AuthContextDef";
import { ROLES } from "@/config/roles";
import { AdminOutletSelector } from "@/components/markets/AdminOutletSelector";

export const Route = createLazyFileRoute(
	"/_protected/kelolaoutlet/receive",
)({
	component: OutletReceivePage,
});

interface ItemRow {
	id: string;
	transfer_id: string;
	product_id: string;
	product_name: string;
	expected_qty: string;
	received_qty: string;
	rejected_qty: string;
	reject_reason: string;
	unit: string;
	batch?: string;
}

function OutletReceivePage() {
	const navigate = useNavigate();
	const auth = useContext(AuthContext);
	const userRole = auth?.roleId;
	const userMarketId = auth?.marketId;

	// Check role permission
	useEffect(() => {
		if (userRole && userRole !== ROLES.ADMIN && userRole !== ROLES.SUPERVISOR) {
			toast.error("Akses ditolak. Halaman ini hanya untuk Admin dan Supervisor.");
			navigate({ to: "/dashboard" as any });
		}
	}, [userRole, navigate]);

	// Check if user has market/outlet assigned
	useEffect(() => {
		if (userRole === ROLES.SUPERVISOR && !userMarketId) {
			toast.error("Supervisor tidak memiliki outlet tujuan. Hubungi admin.");
			navigate({ to: "/dashboard" as any });
		}
	}, [userRole, userMarketId, navigate]);

	// State for outlet selection (Admin only)
	const [selectedMarketId, setSelectedMarketId] = useState<string>("");
	const [outlets, setOutlets] = useState<any[]>([]);

	// Transfer selection
	const [selectedTransfer, setSelectedTransfer] = useState<any | null>(null);
	const [pendingTransfers, setPendingTransfers] = useState<any[]>([]);

	// Item list
	const [rows, setRows] = useState<ItemRow[]>([]);

	// UI state
	const [submitting, setSubmitting] = useState(false);
	const [loading, setLoading] = useState(true);

	// Load outlets for admin
	useEffect(() => {
		if (userRole === ROLES.ADMIN) {
			ProfileService.getMarketProfiles().then((profiles) => {
				const outletList = profiles.filter((m: any) => m.type === "OUTLET");
				setOutlets(outletList);
				// Auto-select first outlet if available
				if (outletList.length > 0 && !selectedMarketId) {
					setSelectedMarketId(outletList[0].id);
				}
			}).catch(console.error);
		} else if (userRole === ROLES.SUPERVISOR) {
			setSelectedMarketId(userMarketId || "");
		}
	}, [userRole, userMarketId]);

	// Determine active market ID based on role
	const activeMarketId = userRole === ROLES.ADMIN ? selectedMarketId : userMarketId;

	const loadData = useCallback(async () => {
		if (!activeMarketId) return;
		
		setLoading(true);
		try {
			// Load pending transfers from warehouse TO selected outlet
			try {
				const transfers = await InventoryService.getTransferList({
					status: "WAITING_VERIFICATION",
				})
				// Filter transfers TO this outlet only
				const pending = transfers.filter(
					(t: any) => t.target_market?.id === activeMarketId && t.status === "WAITING_VERIFICATION",
				)
				setPendingTransfers(pending);
			} catch (err) {
				console.error("Failed to load transfers:", err);
			}
		} catch (err) {
			console.error("Failed to load data:", err);
		} finally {
			setLoading(false);
		}
	}, [activeMarketId]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const handleSelectTransfer = async (transferId: string) => {
		const transfer = pendingTransfers.find((t) => t.id === transferId);
		if (!transfer) return;

		setSelectedTransfer(transfer);
		setRows([
			{
				id: Math.random().toString(36).slice(2),
				transfer_id: transfer.id,
				product_id: transfer.product?.id || "",
				product_name: transfer.product?.name || "",
				expected_qty: transfer.qty.toString(),
				received_qty: transfer.qty.toString(),
				rejected_qty: "0",
				reject_reason: "",
				unit: transfer.unit || "1",
				batch: transfer.batch,
			},
		])
	}

	const updateRow = (id: string, field: keyof ItemRow, value: any) => {
		setRows((prev) =>
			prev.map((row) => {
				if (row.id !== id) return row;
				const updated = { ...row, [field]: value };
				// Auto-calculate received = expected - rejected
				if (field === "rejected_qty") {
					const expected = parseFloat(row.expected_qty) || 0;
					const rejected = parseFloat(value) || 0;
					updated.received_qty = (expected - rejected).toString();
				}
				return updated;
			}),
		)
	}

	const handleSubmit = async () => {
		if (!selectedTransfer || rows.length === 0) {
			toast.error("Pilih transfer terlebih dahulu");
			return
		}

		setSubmitting(true);
		try {
			const row = rows[0];
			const receivedQty = parseFloat(row.received_qty) || 0;
			const rejectedQty = parseFloat(row.rejected_qty) || 0;

			// Accept the transfer with verification
			await InventoryService.acceptTransfer(
				selectedTransfer.id,
				receivedQty,
				rejectedQty,
				row.reject_reason,
			)

			toast.success("Transfer berhasil diterima");
			setTimeout(() => {
				navigate({ to: "/kelolaoutlet/stock" as any });
			}, 1500);
		} catch (err: any) {
			toast.error(err.message || "Gagal menerima transfer");
		} finally {
			setSubmitting(false);
		}
	}

	if (loading) {
		return (
			<div className="flex flex-col h-full w-full overflow-hidden">
				<AppHeader
					title="Terima Transfer dari Gudang"
					description="Terima stok yang dikirim dari gudang ke outlet"
				/>
				<div className="flex-1 flex items-center justify-center">
					<div className="flex items-center gap-3 text-slate-400">
						<PackageOpen className="w-8 h-8 animate-spin" />
						<p>Memuat data...</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col h-full w-full overflow-hidden">
			<AppHeader
				title="Terima Transfer dari Gudang"
				description={
					userRole === ROLES.ADMIN && selectedMarketId
						? `Mengelola transfer untuk: ${outlets.find(o => o.id === selectedMarketId)?.name || "Outlet"}`
						: auth?.marketName
							? `Outlet: ${auth.marketName}`
							: "Terima stok yang dikirim dari gudang ke outlet"
				}
			>
				<Button
					variant="outline"
					size="sm"
					onClick={() => navigate({ to: "/kelolaoutlet/stock" as any })}
				>
					Lihat Stok Outlet
				</Button>
			</AppHeader>

			<div className="flex-1 overflow-auto p-6 bg-slate-50/50">
				{/* Outlet Selector for Admin */}
				<AdminOutletSelector 
					selectedMarketId={selectedMarketId} 
					onSelect={(id) => {
						setSelectedMarketId(id);
						setSelectedTransfer(null);
						setRows([]);
					}} 
				/>

				{/* No Pending Transfers */}
				{pendingTransfers.length === 0 && (
					<Card className="border-none shadow-sm mb-6">
						<CardContent className="p-6">
							<div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
								<div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
									<AlertCircle className="w-6 h-6" />
								</div>
								<div className="flex-1">
									<h3 className="font-semibold text-amber-900 mb-1">
										Tidak Ada Transfer Pending
									</h3>
									<p className="text-sm text-amber-700">
										Saat ini tidak ada transfer dari gudang yang menunggu verifikasi di outlet Anda.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Pending Transfer Alert Cards */}
				{pendingTransfers.length > 0 && !selectedTransfer && (
					<div className="space-y-4 mb-6">
						<div className="flex items-center gap-2 mb-2">
							<Truck className="w-5 h-5 text-blue-600" />
							<h2 className="text-lg font-bold text-slate-900">Transfer Pending</h2>
							<Badge className="bg-blue-100 text-blue-700 border-blue-200">
								{pendingTransfers.length} transfer
							</Badge>
						</div>

						{pendingTransfers.map((transfer) => (
							<Card
								key={transfer.id}
								className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
								onClick={() => handleSelectTransfer(transfer.id)}
							>
								<CardContent className="p-5">
									<div className="flex items-start justify-between">
										<div className="flex items-start gap-4 flex-1">
											<div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
												<PackageOpen className="w-6 h-6" />
											</div>
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-2">
													<h3 className="font-bold text-slate-900 text-base">
														{transfer.product?.name || "Produk"}
													</h3>
													<Badge className="bg-blue-50 text-blue-700 border-blue-200">
														{transfer.unit === "1" ? "KG" : "Ekor"}
													</Badge>
												</div>
												<div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
													<div>
														<span className="text-slate-500 block text-xs">Qty Dikirim</span>
														<span className="font-semibold text-slate-900">
															{transfer.qty} {transfer.unit === "1" ? "KG" : "Ekor"}
														</span>
													</div>
													<div>
														<span className="text-slate-500 block text-xs">Tanggal Kirim</span>
														<span className="font-medium text-slate-700">
															{new Date(transfer.sent_at || transfer.created_at).toLocaleDateString("id-ID", {
																day: "numeric",
																month: "short",
																year: "numeric",
															})}
														</span>
													</div>
													<div>
														<span className="text-slate-500 block text-xs">Dari</span>
														<span className="font-medium text-slate-700">Gudang Utama</span>
													</div>
													<div>
														<span className="text-slate-500 block text-xs">Status</span>
														<Badge className="bg-amber-100 text-amber-700 border-amber-200 mt-0.5">
															<Clock className="w-3 h-3 mr-1 inline" />
															Menunggu Verifikasi
														</Badge>
													</div>
												</div>
											</div>
										</div>
										<div className="flex items-center">
											<Button
												size="sm"
												className="bg-blue-600 hover:bg-blue-700 text-white"
												onClick={(e) => {
													e.stopPropagation()
													handleSelectTransfer(transfer.id)
												}}
											>
												Verifikasi
												<Check className="w-4 h-4 ml-1" />
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Selected Transfer - Verification Form */}
				{selectedTransfer && rows.length > 0 && (
					<Card className="border-none shadow-sm">
						<div className="p-4 border-b flex items-center justify-between">
							<div>
								<h3 className="font-semibold text-slate-900">Verifikasi Penerimaan</h3>
								<p className="text-sm text-slate-500 mt-1">
									Masukkan jumlah yang diterima dan yang reject
								</p>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setSelectedTransfer(null)
									setRows([])
								}}
							>
								Kembali
							</Button>
						</div>

						<CardContent className="p-4 space-y-4">
							{rows.map((row) => (
								<div
									key={row.id}
									className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-slate-50 rounded-lg border"
								>
									<div className="md:col-span-2">
										<label className="text-xs font-medium text-slate-500 mb-1 block">
											Produk
										</label>
										<p className="font-medium text-slate-900">{row.product_name}</p>
									</div>

									<div>
										<label className="text-xs font-medium text-slate-500 mb-1 block">
											Dikirim
										</label>
										<p className="font-medium text-slate-700">
											{row.expected_qty} {row.unit === "1" ? "KG" : "Ekor"}
										</p>
									</div>

									<div>
										<label className="text-xs font-medium text-slate-500 mb-1 block">
											Diterima
										</label>
										<Input
											type="number"
											step={row.unit === "1" ? "0.01" : "1"}
											min="0"
											value={row.received_qty}
											onChange={(e) => {
												const received = parseFloat(e.target.value) || 0;
												const rejected = parseFloat(row.rejected_qty) || 0;
												if (received + rejected > parseFloat(row.expected_qty)) {
													toast.error("Total diterima + reject tidak boleh melebihi yang dikirim!");
													return
												}
												updateRow(row.id, "received_qty", e.target.value);
											}}
											className="bg-white"
										/>
									</div>

									<div>
										<label className="text-xs font-medium text-slate-500 mb-1 block">
											Reject
										</label>
										<Input
											type="number"
											step={row.unit === "1" ? "0.01" : "1"}
											min="0"
											value={row.rejected_qty}
											onChange={(e) => {
												const received = parseFloat(row.received_qty) || 0;
												const rejected = parseFloat(e.target.value) || 0;
												if (received + rejected > parseFloat(row.expected_qty)) {
													toast.error("Total diterima + reject tidak boleh melebihi yang dikirim!");
													return
												}
												updateRow(row.id, "rejected_qty", e.target.value);
											}}
											className="bg-white"
										/>
									</div>

									<div>
										<label className="text-xs font-medium text-slate-500 mb-1 block">
											Keterangan Reject
										</label>
										<Input
											type="text"
											placeholder="Alasan reject..."
											value={row.reject_reason}
											onChange={(e) => updateRow(row.id, "reject_reason", e.target.value)}
											className="bg-white"
										/>
									</div>
								</div>
							))}

							<ModalFooter className="px-0 pt-4">
								<Button
									variant="outline"
									onClick={() => navigate({ to: "/kelolaoutlet/stock" as any })}
									disabled={submitting}
								>
									Batal
								</Button>
								<Button
									onClick={handleSubmit}
									disabled={submitting}
									className="gap-2"
								>
									<Check className="w-4 h-4" />
									{submitting ? "Menyimpan..." : "Konfirmasi Penerimaan"}
								</Button>
							</ModalFooter>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	)
}
