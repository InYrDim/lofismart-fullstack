import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalFooter } from "@/components/ui/modals/Modal";
import { AlertCircle, Plus, Minus, Search, Percent, Hash, Package } from "lucide-react";
import { formatQty } from "@/utils/format";

export interface ItemRow {
	id: string;
	product_id: string;
	product_name: string;
	purchased_qty: string;
	accepted_qty: string;
	rejected_qty: string;
	reject_reason: string;
	price: string;
	batch: string;
	unit: string;
}

const emptyItem = (): ItemRow => ({
	id: Math.random().toString(36).slice(2),
	product_id: "",
	product_name: "",
	purchased_qty: "0",
	accepted_qty: "0",
	rejected_qty: "0",
	reject_reason: "",
	price: "",
	batch: "",
	unit: "1",
});

interface ItemModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (item: ItemRow) => void;
	initialData: ItemRow | null;
	products: any[];
}

export function ReceiveItemModal({
	isOpen,
	onClose,
	onSave,
	initialData,
	products,
}: ItemModalProps) {
	const [form, setForm] = useState<ItemRow>(emptyItem());
	const [searchQuery, setSearchQuery] = useState("");
	const isProductSelected = !!form.product_id;

	useEffect(() => {
		if (isOpen) {
			setForm(initialData ? { ...initialData } : emptyItem());
			setSearchQuery("");
		}
	}, [isOpen, initialData]);

	const filteredProducts = useMemo(
		() =>
			products.filter((p) => {
				if (p.type !== "PRODUCT") return false;
				if (!searchQuery) return true;
				const q = searchQuery.toLowerCase();
				const name = (p.name || "").toLowerCase();
				const cat = (p.category || "").toLowerCase();
				return name.includes(q) || cat.includes(q);
			}),
		[products, searchQuery],
	);

	const handleProductSelect = (prod: any) => {
		setForm((f) => ({
			...f,
			product_id: prod.productId || prod.id,
			product_name: prod.name || "",
			unit: prod.unit === "PCS" ? "2" : "1",
		}));
		setSearchQuery("");
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (
			!form.product_id ||
			!form.purchased_qty ||
			!form.accepted_qty ||
			!form.price
		)
			return;
		onSave({ ...form });
	};

	const qtyQuickValues = form.unit === "2" ? ["1", "5", "10"] : ["0.5", "1", "5"];

	const canDistribute = Number(form.purchased_qty) > 0;

	const syncQtys = (
		f: ItemRow,
		field: "purchased_qty" | "accepted_qty" | "rejected_qty",
		rawNext: number,
	) => {
		const purchased = Number(f.purchased_qty) || 0;
		let accepted = Number(f.accepted_qty) || 0;
		let rejected = Number(f.rejected_qty) || 0;

		if (field === "purchased_qty") {
			accepted = rawNext;
			rejected = 0;
		} else if (field === "accepted_qty") {
			accepted = Math.min(rawNext, purchased);
			rejected = Math.max(0, purchased - accepted);
		} else if (field === "rejected_qty") {
			rejected = Math.min(rawNext, purchased);
			accepted = Math.max(0, purchased - rejected);
		}

		const fmt = (n: number) => formatQty(n);
		return { accepted_qty: fmt(accepted), rejected_qty: fmt(rejected) };
	};

	const applyQuickQty = (
		field: "purchased_qty" | "accepted_qty" | "rejected_qty",
		value: string,
		operator: "plus" | "minus" = "plus",
	) => {
		setForm((f) => {
			const increment = Number(value);
			const currentValue = Number(f[field] || 0);
			const nextValue =
				operator === "plus"
					? currentValue + increment
					: Math.max(0, currentValue - increment);

			const { accepted_qty, rejected_qty } = syncQtys(f, field, nextValue);
			const fmt = (n: number) => formatQty(n);

			return {
				...f,
				purchased_qty:
					field === "purchased_qty" ? fmt(nextValue) : f.purchased_qty,
				accepted_qty,
				rejected_qty,
			};
		});
	};

	const adjustQtyByStep = (
		field: "purchased_qty" | "accepted_qty" | "rejected_qty",
		direction: "plus" | "minus",
	) => {
		setForm((f) => {
			const step = f.unit === "2" ? 1 : 0.01;
			const currentValue = Number(f[field] || 0);
			const nextValue =
				direction === "plus"
					? currentValue + step
					: Math.max(0, currentValue - step);

			const { accepted_qty, rejected_qty } = syncQtys(f, field, nextValue);
			const fmt = (n: number) => formatQty(n);

			return {
				...f,
				purchased_qty:
					field === "purchased_qty" ? fmt(nextValue) : f.purchased_qty,
				accepted_qty,
				rejected_qty,
			};
		});
	};

	const isEdit = !!initialData;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={isEdit ? "Edit Produk" : "Tambah Produk"}
			size="4xl"
		>
			<form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
				{products.filter((p) => p.type === "PRODUCT").length === 0 && (
					<div className="mx-6 mt-4 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
						<AlertCircle className="w-4 h-4 shrink-0" />
						<div>
							<p className="font-bold">Data Produk Kosong</p>
							<p className="text-xs">
								Silakan hubungi Admin untuk menambahkan data produk.
							</p>
						</div>
					</div>
				)}

				<div className="flex-1 overflow-y-auto p-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
						{/* Panel 1: Live Search Produk */}
						<div className="flex flex-col">
							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
									<Search className="w-4 h-4 text-emerald-500" />
									Cari Produk <span className="text-red-500">*</span>
								</label>
								<div className="relative">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
									<input
										type="text"
										value={form.product_id ? form.product_name : searchQuery}
										onChange={(e) => {
											setSearchQuery(e.target.value);
											if (form.product_id) {
												setForm((f) => ({ ...f, product_id: "", product_name: "", unit: "1" }));
											}
										}}
										placeholder="Ketik nama produk..."
										className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm shadow-sm outline-none transition-[color,box-shadow] focus-visible:border-emerald-400 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
										autoFocus
									/>
								</div>
							</div>

							{!form.product_id && (
								<div className="flex-1 mt-3 overflow-y-auto max-h-[280px] space-y-1 -mr-1 pr-1">
									{filteredProducts.length === 0 ? (
										<div className="flex flex-col items-center justify-center py-8 text-gray-400">
											<Package className="w-8 h-8 mb-2 opacity-30" />
											<p className="text-xs">Produk tidak ditemukan</p>
										</div>
									) : (
										filteredProducts.map((p) => {
											const pid = p.productId || p.id;
											return (
												<button
													type="button"
													key={pid}
													onClick={() => handleProductSelect(p)}
													className="w-full text-left px-3 py-2.5 rounded-xl border border-gray-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/40 transition-all"
												>
													<div className="font-medium text-sm text-gray-800">{p.name}</div>
													<div className="flex items-center gap-2 mt-0.5">
														<span className="text-[10px] text-gray-400 uppercase tracking-tight">
															{p.category || "General"}
														</span>
														<span className="text-[10px] text-gray-300">•</span>
														<Badge
															variant={p.unit === "PCS" ? "secondary" : "default"}
															className="text-[9px] px-1.5 py-0 h-4 font-semibold"
														>
															{p.unit === "PCS" ? "EKOR" : "KG"}
														</Badge>
													</div>
												</button>
											);
										})
									)}
								</div>
							)}

							{form.product_id && (
								<div className="mt-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center gap-3">
									<div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
										<Package className="w-4 h-4 text-emerald-600" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-semibold text-emerald-800 truncate">{form.product_name}</p>
										<div className="flex items-center gap-2 mt-0.5">
											<Badge
												variant={form.unit === "1" ? "default" : "secondary"}
												className="font-semibold text-[10px] px-1.5 py-0 h-4"
											>
												{form.unit === "1" ? "KG" : "EKOR"}
											</Badge>
											<button
												type="button"
												onClick={() => {
													setForm((f) => ({ ...f, product_id: "", product_name: "", unit: "1" }));
													setSearchQuery("");
												}}
												className="text-[10px] text-emerald-600 hover:text-emerald-800 underline"
											>
												Ganti produk
											</button>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Panel 2: Kuantitas */}
						<div className="flex flex-col">
							<div className="flex items-center gap-2 mb-3">
								<div className="h-px flex-1 bg-gray-100" />
								<span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Kuantitas</span>
								<div className="h-px flex-1 bg-gray-100" />
							</div>

							<div className="space-y-4 flex-1">
								<QtyField
									label={form.unit === "2" ? "Qty Beli (ekor)" : "Berat Beli (kg)"}
									required
									value={form.purchased_qty}
									unit={form.unit}
									onChange={(v) =>
										setForm((f) => {
											const { accepted_qty, rejected_qty } = syncQtys(
												f, "purchased_qty", Number(v) || 0,
											);
											return { ...f, purchased_qty: v, accepted_qty, rejected_qty };
										})
									}
									onStep={adjustQtyByStep}
									onQuick={applyQuickQty}
									quickValues={qtyQuickValues}
									disabled={!isProductSelected}
									accent="gray"
								/>

								<QtyField
									label={form.unit === "2" ? "Qty Terima (ekor)" : "Berat Terima (kg)"}
									required
									value={form.accepted_qty}
									unit={form.unit}
									onChange={(v) =>
										setForm((f) => {
											const { accepted_qty, rejected_qty } = syncQtys(
												f, "accepted_qty", Number(v) || 0,
											);
											return { ...f, accepted_qty, rejected_qty };
										})
									}
									onStep={adjustQtyByStep}
									onQuick={applyQuickQty}
									quickValues={qtyQuickValues}
									disabled={!isProductSelected || !canDistribute}
									accent="emerald"
								/>

								<QtyField
									label={form.unit === "2" ? "Qty Ditolak (ekor)" : "Berat Ditolak (kg)"}
									required={false}
									value={form.rejected_qty}
									unit={form.unit}
									onChange={(v) =>
										setForm((f) => {
											const { accepted_qty, rejected_qty } = syncQtys(
												f, "rejected_qty", Number(v) || 0,
											);
											return { ...f, accepted_qty, rejected_qty };
										})
									}
									onStep={adjustQtyByStep}
									onQuick={applyQuickQty}
									quickValues={qtyQuickValues}
									disabled={!isProductSelected || !canDistribute}
									accent="red"
								/>
							</div>
						</div>

						{/* Panel 3: Harga & Batch */}
						<div className="flex flex-col">
							<div className="flex items-center gap-2 mb-3">
								<div className="h-px flex-1 bg-gray-100" />
								<span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Harga & Batch</span>
								<div className="h-px flex-1 bg-gray-100" />
							</div>

							<div className="space-y-4 flex-1">
								<div className="bg-gray-50 rounded-xl p-4 space-y-4">
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
											<Percent className="w-3.5 h-3.5 text-gray-400" />
											Harga / Unit <span className="text-red-500">*</span>
										</label>
										<div className="relative">
											<span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sm text-gray-500 pointer-events-none z-10">Rp</span>
											<input
												type="number"
												min="0"
												value={form.price}
												onChange={(e) =>
													setForm((f) => ({ ...f, price: e.target.value }))
												}
												placeholder="0"
												required
												disabled={!isProductSelected}
												className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-1 text-sm shadow-sm outline-none transition-[color,box-shadow] focus-visible:border-emerald-400 focus-visible:ring-[3px] focus-visible:ring-emerald-100 disabled:pointer-events-none disabled:opacity-50"
											/>
										</div>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
											<Hash className="w-3.5 h-3.5 text-gray-400" />
											Batch (Opsional)
										</label>
										<input
											value={form.batch}
											onChange={(e) =>
												setForm((f) => ({ ...f, batch: e.target.value }))
											}
											placeholder="Cth: B001"
											disabled={!isProductSelected}
											className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm outline-none transition-[color,box-shadow] focus-visible:border-emerald-400 focus-visible:ring-[3px] focus-visible:ring-emerald-100 disabled:pointer-events-none disabled:opacity-50"
										/>
									</div>
								</div>

								{Number(form.rejected_qty) > 0 && (
									<div className="bg-red-50/50 rounded-xl p-4 space-y-2">
										<label className="text-sm font-medium text-red-700 flex items-center gap-1.5">
											<AlertCircle className="w-3.5 h-3.5" />
											Alasan Penolakan <span className="text-red-500">*</span>
										</label>
										<textarea
											value={form.reject_reason}
											onChange={(e) =>
												setForm((f) => ({
													...f,
													reject_reason: e.target.value,
												}))
											}
											placeholder="Contoh: kemasan rusak, expired…"
											required
											disabled={!isProductSelected}
											rows={3}
											className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition-[color,box-shadow] focus-visible:border-red-400 focus-visible:ring-[3px] focus-visible:ring-red-100 disabled:pointer-events-none disabled:opacity-50 placeholder:text-gray-400 resize-none"
										/>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="border-t border-gray-100 shrink-0" />

				<ModalFooter>
					<Button type="button" variant="outline" onClick={onClose}>
						Batal
					</Button>
					<Button
						type="submit"
						className="bg-emerald-600 hover:bg-emerald-700 text-white"
						disabled={!form.product_id}
					>
						{isEdit ? "Simpan Perubahan" : "Tambah ke Daftar"}
					</Button>
				</ModalFooter>
			</form>
		</Modal>
	);
}

// ─── Quantity Field Sub-component ─────────────────────────────────────────

interface QtyFieldProps {
	label: string;
	required: boolean;
	value: string;
	unit: string;
	onChange: (v: string) => void;
	onStep: (
		field: "purchased_qty" | "accepted_qty" | "rejected_qty",
		direction: "plus" | "minus",
	) => void;
	onQuick: (
		field: "purchased_qty" | "accepted_qty" | "rejected_qty",
		value: string,
		operator: "plus" | "minus",
	) => void;
	quickValues: string[];
	disabled: boolean;
	accent: "gray" | "emerald" | "red";
}

function QtyField({
	label,
	required,
	value,
	unit,
	onChange,
	onStep,
	onQuick,
	quickValues,
	disabled,
	accent,
}: QtyFieldProps) {
	const borderColor =
		accent === "emerald"
			? "focus-visible:border-emerald-400 focus-visible:ring-emerald-100"
			: accent === "red"
				? "focus-visible:border-red-400 focus-visible:ring-red-100"
				: "focus-visible:border-gray-400 focus-visible:ring-gray-100";

	const btnColor =
		accent === "emerald"
			? "text-emerald-600 hover:bg-emerald-50 border-emerald-200"
			: accent === "red"
				? "text-red-600 hover:bg-red-50 border-red-200"
				: "text-gray-600 hover:bg-gray-100 border-gray-200";

	const quickColor =
		accent === "emerald"
			? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
			: accent === "red"
				? "text-red-700 bg-red-50 hover:bg-red-100 border-red-200"
				: "text-gray-600 bg-gray-50 hover:bg-gray-100 border-gray-200";

	return (
		<div className="space-y-1.5">
			<label className="text-xs font-medium text-gray-600">
				{label}
				{required && <span className="text-red-500 ml-0.5">*</span>}
			</label>
			<div className="flex items-center">
				<button
					type="button"
					onClick={() => onStep(
						accent === "emerald" ? "accepted_qty" as const : accent === "red" ? "rejected_qty" as const : "purchased_qty" as const,
						"minus",
					)}
					disabled={disabled}
					className={`h-9 w-9 flex items-center justify-center rounded-l-lg border border-r-0 bg-white text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${btnColor}`}
				>
					<Minus className="w-3.5 h-3.5" />
				</button>
				<input
					type="number"
					step={unit === "2" ? "1" : "0.01"}
					min="0"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder="0"
					required={required}
					disabled={disabled}
					className={`h-9 w-full min-w-0 rounded-none border border-x-0 bg-white px-2 py-1 text-sm text-center font-medium shadow-sm outline-none transition-[color,box-shadow] ${borderColor} disabled:pointer-events-none disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield`}
				/>
				<button
					type="button"
					onClick={() => onStep(
						accent === "emerald" ? "accepted_qty" as const : accent === "red" ? "rejected_qty" as const : "purchased_qty" as const,
						"plus",
					)}
					disabled={disabled}
					className={`h-9 w-9 flex items-center justify-center rounded-r-lg border border-l-0 bg-white text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${btnColor}`}
				>
					<Plus className="w-3.5 h-3.5" />
				</button>
			</div>
			<div className="flex flex-wrap gap-1">
				{quickValues.map((v) => (
					<div key={v} className="flex rounded-md overflow-hidden border text-xs">
						<button
							type="button"
							onClick={() => onQuick(
								accent === "emerald" ? "accepted_qty" as const : accent === "red" ? "rejected_qty" as const : "purchased_qty" as const,
								v,
								"minus",
							)}
							disabled={disabled}
							className={`px-1.5 py-0.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${quickColor} border-r`}
						>
							-{v}
						</button>
						<button
							type="button"
							onClick={() => onQuick(
								accent === "emerald" ? "accepted_qty" as const : accent === "red" ? "rejected_qty" as const : "purchased_qty" as const,
								v,
								"plus",
							)}
							disabled={disabled}
							className={`px-1.5 py-0.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${quickColor}`}
						>
							+{v}
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
