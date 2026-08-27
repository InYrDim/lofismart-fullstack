import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { InventoryService } from "@/services/inventory.service";
import { ProductService } from "@/services/product.service";
import { ProfileService } from "@/services/profile.service";
import { SupplierService } from "@/services/supplier.service";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Plus,
	Trash2,
	AlertCircle,
	Check,
	Package,
	Save,
	Pencil,
	PackageOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/config/roles";
import { AdminGudangSelector } from "@/components/markets/AdminGudangSelector";
import { ReceiveItemModal, type ItemRow } from "@/components/kelolagudang/ReceiveItemModal";
import { formatQty } from "@/utils/format";

export const Route = createLazyFileRoute("/_protected/kelolagudang/receive")({
	component: GudangReceivePage,
});

const PAYMENT_PROOF_MAX_SIZE_MB = 5;
const PAYMENT_PROOF_ACCEPTED_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"application/pdf",
];

// ─── Main Page ────────────────────────────────────────────────────────────────
function GudangReceivePage() {
	const navigate = useNavigate();

	// Master fields
	const [supplierId, setSupplierId] = useState("");
	const [selectedGudangId, setSelectedGudangId] = useState("");
	const [warehouseId, setWarehouseId] = useState("");

	// Item list (already added)
	const [rows, setRows] = useState<ItemRow[]>([]);
	const [paymentProof, setPaymentProof] = useState<File | null>(null);

	// Modal state
	const [modalOpen, setModalOpen] = useState(false);
	const [editItem, setEditItem] = useState<ItemRow | null>(null);

	// UI state
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	// Remote data
	const [products, setProducts] = useState<any[]>([]);
	const [markets, setMarkets] = useState<any[]>([]);
	const [suppliers, setSuppliers] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	const { roleId: userRole, marketId: userMarketId } = useAuth();

	const loadData = useCallback(async () => {
		setLoading(true);
		try {
			const [prods, sups, mks] = await Promise.all([
				ProductService.getBaseProducts(),
				SupplierService.getSuppliers(),
				ProfileService.getMarketProfiles(),
			]);
			setProducts(prods || []);
			setSuppliers(sups || []);
			setMarkets(mks || []);

			// Auto-select warehouse for non-admin
			if (userRole !== ROLES.ADMIN && userMarketId) {
				setWarehouseId(userMarketId);
			}
		} catch {
			setError("Gagal memuat data. Coba refresh halaman.");
		} finally {
			setLoading(false);
		}
	}, [userRole, userMarketId]);

	// When admin selects a gudang, update the target warehouseId
	useEffect(() => {
		if (userRole === ROLES.ADMIN && selectedGudangId) {
			setWarehouseId(selectedGudangId);
		}
	}, [userRole, selectedGudangId]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	// ─── Item Handlers ──────────────────────────────────────────────────────────
	const openAddModal = () => {
		setEditItem(null);
		setModalOpen(true);
	};

	const openEditModal = (item: ItemRow) => {
		setEditItem(item);
		setModalOpen(true);
	};

	const handleSaveItem = (item: ItemRow) => {
		if (editItem) {
			setRows((r) => r.map((row) => (row.id === item.id ? item : row)));
		} else {
			setRows((r) => [...r, item]);
		}
		setModalOpen(false);
		setEditItem(null);
	};

	const removeRow = (id: string) =>
		setRows((r) => r.filter((row) => row.id !== id));

	// ─── Submit ─────────────────────────────────────────────────────────────────
	const handleSubmit = async () => {
		setError(null);
		if (!supplierId) {
			setError("Pilih supplier terlebih dahulu.");
			return;
		}
		if (!warehouseId) {
			setError("Pilih gudang tujuan terlebih dahulu.");
			return;
		}
		if (rows.length === 0) {
			setError("Tambahkan minimal 1 produk.");
			return;
		}

		setSubmitting(true);
		try {
			const autoBatch = rows.length >= 2
				? `RCV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
				: null;

			await InventoryService.receiveBulkStock({
				supplier_id: supplierId,
				warehouse_id: warehouseId,
				items: rows.map((r) => ({
					product_id: r.product_id,
					purchased_qty: Number(r.purchased_qty),
					accepted_qty: Number(r.accepted_qty),
					rejected_qty: Number(r.rejected_qty) || 0,
					reject_reason: r.reject_reason,
					price: Number(r.price),
					batch: autoBatch || r.batch,
					unit: r.unit,
				})),
				proof: paymentProof || undefined,
			});
			setSuccess(true);
			toast.success("Stok berhasil diterima dari supplier!");
			setTimeout(() => navigate({ to: "/kelolagudang/stock" }), 1800);
		} catch (err: any) {
			setError(err.message || "Terjadi kesalahan saat menyimpan.");
		} finally {
			setSubmitting(false);
		}
	};

	const handlePaymentProofChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) {
			setPaymentProof(null);
			return;
		}

		if (!PAYMENT_PROOF_ACCEPTED_TYPES.includes(file.type)) {
			toast.error("Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau PDF.");
			e.currentTarget.value = "";
			return;
		}

		const maxSizeBytes = PAYMENT_PROOF_MAX_SIZE_MB * 1024 * 1024;
		if (file.size > maxSizeBytes) {
			toast.error(`Ukuran file maksimal ${PAYMENT_PROOF_MAX_SIZE_MB}MB.`);
			e.currentTarget.value = "";
			return;
		}

		setPaymentProof(file);
	};

	// ─── Options ────────────────────────────────────────────────────────────────
	const supplierOptions = [
		{ label: "— Pilih Supplier —", value: "" },
		...suppliers.map((s: any) => ({ label: s.name, value: s.id })),
	];
	const warehouseOptions = [
		{ label: "— Pilih Gudang —", value: "" },
		...markets
			.filter((m: any) => m.type === "GUDANG")
			.map((m: any) => ({ label: m.name, value: m.id })),
	];


	// ─── Render ─────────────────────────────────────────────────────────────────
	if (success) {
		return (
			<div className="flex items-center justify-center h-full w-full">
				<div className="flex flex-col items-center gap-4 text-center">
					<div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
						<Check className="w-10 h-10 text-emerald-600" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900">Berhasil!</h2>
					<p className="text-gray-500">
						Stok berhasil diterima dan disimpan ke gudang.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-gray-50 w-full">
			{/* ── Header ── */}
			<AppHeader title="Terima Barang Supplier">
				<div className="flex items-center gap-2">
					<Button
						size="sm"
						className="bg-emerald-600 hover:bg-emerald-700 text-white"
						disabled={submitting || loading || rows.length === 0}
						onClick={handleSubmit}
					>
						<Save className="w-4 h-4 mr-2" />
						{submitting ? "Menyimpan…" : "Simpan Semua"}
					</Button>
				</div>
			</AppHeader>

			{/* ── Body ── */}
			<main className="flex-1 overflow-y-auto p-6 space-y-6">
				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
						<AlertCircle className="w-4 h-4 shrink-0" />
						{error}
					</div>
				)}

				{!loading && suppliers.length === 0 && (
					<div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
						<AlertCircle className="w-4 h-4 shrink-0" />
						<div>
							<p className="font-bold">Data Supplier Kosong</p>
							<p className="text-xs">
								Silakan hubungi Admin untuk menambahkan data supplier.
							</p>
						</div>
					</div>
				)}

				<AdminGudangSelector
					selectedGudangId={selectedGudangId}
					onSelect={(id) => setSelectedGudangId(id)}
				/>

				{/* ── Master Info ── */}
				<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
					<h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
						<PackageOpen className="w-5 h-5 text-emerald-600" />
						Informasi Penerimaan
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Supplier <span className="text-red-500">*</span>
							</label>
							<Select
								value={supplierId}
								onChange={(v) => setSupplierId(String(v))}
								options={supplierOptions}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Gudang Tujuan <span className="text-red-500">*</span>
							</label>
							<Select
								value={warehouseId}
								onChange={(v) => setWarehouseId(String(v))}
								options={warehouseOptions}
							/>
						</div>
					</div>

					<div className="mt-4">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Bukti Pembayaran / Nota
						</label>
						<Input
							type="file"
							accept=".jpg,.jpeg,.png,.webp,.pdf"
							onChange={handlePaymentProofChange}
						/>
						<p className="mt-1 text-xs text-gray-500">
							Format: JPG, JPEG, PNG, WEBP, atau PDF. Ukuran maksimal{" "}
							{PAYMENT_PROOF_MAX_SIZE_MB}MB. Foto harus jelas, tidak blur,
							memuat total nominal, tanggal transaksi, dan nama supplier.
						</p>
						{paymentProof && (
							<p className="mt-1 text-xs text-emerald-700 font-medium">
								File terpilih: {paymentProof.name}
							</p>
						)}
					</div>
				</div>

				{/* ── Item Table ── */}
				<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
					<div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50">
						<h2 className="font-semibold text-emerald-800 flex items-center gap-2">
							<Package className="w-4 h-4" />
							Daftar Produk
							<span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
								{rows.length} produk
							</span>
						</h2>
						<Button
							type="button"
							size="sm"
							className="bg-emerald-600 hover:bg-emerald-700 text-white"
							onClick={openAddModal}
						>
							<Plus className="w-4 h-4 mr-1.5" />
							Tambah Produk
						</Button>
					</div>

					{rows.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 text-gray-400">
							<Package className="w-12 h-12 mb-3 opacity-30" />
							<p className="text-sm font-medium">Belum ada produk</p>
							<p className="text-xs mt-1">Klik "Tambah Produk" untuk mulai</p>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="mt-4"
								onClick={openAddModal}
							>
								<Plus className="w-4 h-4 mr-2" />
								Tambah Produk
							</Button>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead className="bg-gray-50 border-b border-gray-100">
									<tr>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-8">
											#
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
											Produk
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
											Satuan
										</th>
										<th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
											Qty Beli
										</th>
										<th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
											Qty Terima
										</th>
										<th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
											Qty Ditolak
										</th>
										<th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
											Harga/Unit
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
											Batch
										</th>
										<th className="px-4 py-3 w-20" />
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-50">
									{rows.map((row, idx) => (
										<tr
											key={row.id}
											className="hover:bg-gray-50/70 transition-colors"
										>
											<td className="px-4 py-3 text-xs text-gray-400 font-mono">
												{idx + 1}
											</td>
											<td className="px-4 py-3 font-medium text-gray-800">
												{row.product_name}
											</td>
											<td className="px-4 py-3 text-gray-500">
												{row.unit === "1" ? "KG" : "Ekor"}
											</td>
											<td className="px-4 py-3 text-right text-gray-700">
												{formatQty(Number(row.purchased_qty))}
											</td>
											<td className="px-4 py-3 text-right text-emerald-700 font-medium">
												{formatQty(Number(row.accepted_qty))}
											</td>
											<td className="px-4 py-3 text-right">
												{Number(row.rejected_qty) > 0 ? (
													<span className="text-red-600 font-medium">
														{formatQty(Number(row.rejected_qty))}
													</span>
												) : (
													<span className="text-gray-300">—</span>
												)}
											</td>
											<td className="px-4 py-3 text-right text-gray-700">
												{Number(row.price).toLocaleString("id-ID")}
											</td>
											<td className="px-4 py-3 text-gray-500 text-xs">
												{row.batch || "—"}
											</td>
											<td className="px-4 py-3">
												<div className="flex items-center gap-1 justify-end">
													<button
														type="button"
														onClick={() => openEditModal(row)}
														className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
													>
														<Pencil className="w-3.5 h-3.5" />
													</button>
													<button
														type="button"
														onClick={() => removeRow(row.id)}
														className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
													>
														<Trash2 className="w-3.5 h-3.5" />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
								<tfoot className="border-t-2 border-gray-200 bg-gray-50">
									<tr>
										<td
											colSpan={3}
											className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase"
										>
											Total
										</td>
										<td className="px-4 py-3 text-right font-bold text-gray-800">
											{formatQty(rows.reduce((sum, r) => sum + Number(r.purchased_qty), 0))}
										</td>
										<td className="px-4 py-3 text-right font-bold text-emerald-700">
											{formatQty(rows.reduce((sum, r) => sum + Number(r.accepted_qty), 0))}
										</td>
										<td className="px-4 py-3 text-right font-bold text-red-600">
											{rows.reduce((sum, r) => sum + Number(r.rejected_qty || 0), 0) > 0
												? formatQty(rows.reduce((sum, r) => sum + Number(r.rejected_qty || 0), 0))
												: "—"}
										</td>
										<td colSpan={3} />
									</tr>
								</tfoot>
							</table>
						</div>
					)}

					{rows.length > 0 && (
						<div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
							<button
								type="button"
								onClick={openAddModal}
								className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-800 font-medium"
							>
								<Plus className="w-4 h-4" />
								Tambah produk lagi
							</button>
							<span className="text-xs text-gray-400">
								{rows.length} produk tercatat
							</span>
						</div>
					)}
				</div>

				{/* ── Bottom Action Bar ── */}
				{rows.length > 0 && (
					<div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shadow-[0_-4px_16px_rgba(0,0,0,.06)]">
						<Button
							variant="outline"
							onClick={() => navigate({ to: "/kelolagudang/stock" })}
							disabled={submitting}
						>
							Batal
						</Button>
						<Button
							className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
							disabled={submitting || loading}
							onClick={handleSubmit}
						>
							<Save className="w-4 h-4 mr-2" />
							{submitting ? "Menyimpan…" : `Simpan ${rows.length} Produk`}
						</Button>
					</div>
				)}
			</main>

			{/* ── Item Modal ── */}
			<ReceiveItemModal
				isOpen={modalOpen}
				onClose={() => {
					setModalOpen(false);
					setEditItem(null);
				}}
				onSave={handleSaveItem}
				initialData={editItem}
				products={products}
			/>
		</div>
	);
}
