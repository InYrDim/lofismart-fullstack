import { useState, useEffect } from "react";
import { Check, CheckCircle2, RefreshCw } from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/modals/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	InventoryService,
	type StockItem,
} from "@/services/inventory.service";
import { formatQty } from "@/utils/format";

interface VerifyModalProps {
	isOpen: boolean;
	onClose: () => void;
	stockList: StockItem[];
	onSuccess: () => void;
}

export function VerifyModal({
	isOpen,
	onClose,
	stockList,
	onSuccess,
}: VerifyModalProps) {
	const [form, setForm] = useState({
		notes: "",
		items: [] as {
			stockId: string;
			expected: number;
			actual: number;
			ok: boolean;
		}[],
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setForm(() => ({
				notes: "",
				items: stockList.map((s) => ({
					stockId: s.id,
					expected: s.qty,
					actual: s.qty,
					ok: true,
				})),
			}));
			setSuccess(false);
		}
	}, [isOpen, stockList]);

	const handleVerify = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		setError(null);

		try {
			// Find items that have discrepancies (actual != expected)
			const discrepancies = form.items.filter(
				(item) => item.actual !== item.expected,
			);

			if (discrepancies.length > 0) {
				// Sequentially update each item to ensure synchronization
				for (const item of discrepancies) {
					await InventoryService.updateStock(item.stockId, item.actual);
				}
			}

			setSuccess(true);
			setTimeout(() => {
				onSuccess();
				onClose();
			}, 1500);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Gagal sinkronisasi stok");
		} finally {
			setSubmitting(false);
		}
	};

	const setAllOk = () => {
		setForm((f) => ({
			...f,
			items: f.items.map((item) => ({
				...item,
				ok: true,
				actual: item.expected,
			})),
		}));
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Verifikasi Terima Stok"
			size="2xl"
		>
			{success ? (
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
						<CheckCircle2 className="w-8 h-8 text-emerald-600" />
					</div>
					<h3 className="text-lg font-semibold text-gray-900">
						Verifikasi Selesai!
					</h3>
					<p className="text-gray-500 mt-1">
						Penerimaan stok telah dikonfirmasi.
					</p>
				</div>
			) : (
				<form onSubmit={handleVerify} className="space-y-4">
					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm italic">
							<span className="font-bold">Error:</span> {error}
						</div>
					)}

					<div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700 flex items-center justify-between">
						<span>
							Periksa kesesuaian barang yang diterima dengan yang tercatat.
							Centang ✓ jika sesuai.
						</span>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={setAllOk}
							className="bg-white hover:bg-blue-100 border-blue-200 text-blue-700 font-bold"
						>
							Sesuai Semua
						</Button>
					</div>

					<div className="space-y-2 max-h-72 overflow-y-auto pr-1">
						{form.items.length === 0 ? (
							<p className="text-center text-gray-400 py-8">
								Tidak ada stok untuk diverifikasi
							</p>
						) : (
							form.items.map((item, idx) => {
								const stock = stockList.find((s) => s.id === item.stockId);
								return (
									<div
										key={item.stockId}
										className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
											item.ok
												? "border-emerald-200 bg-emerald-50"
												: "border-red-200 bg-red-50"
										}`}
									>
										<button
											type="button"
											onClick={() => {
												const items = [...form.items];
												items[idx].ok = !items[idx].ok;
												setForm({ ...form, items });
											}}
											className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
												item.ok
													? "bg-emerald-500 text-white"
													: "bg-white border-2 border-gray-300"
											}`}
										>
											{item.ok && <Check className="w-4 h-4" />}
										</button>
										<div className="flex-1 min-w-0">
											<p className="font-medium text-gray-900 truncate">
												{stock?.product?.name || "Unknown"}
											</p>
										</div>
										<div className="flex items-center gap-2 shrink-0">
											<span className="text-xs text-gray-500">Tercatat:</span>
											<span className="font-semibold text-gray-800">
												{formatQty(item.expected)}{" "}
												{stock?.unit === "1" ? "kg" : "ekor"}
											</span>
											<span className="text-gray-400 mx-1">→</span>
											<span className="text-xs text-gray-500">Aktual:</span>
											<Input
												type="number"
												step="0.01"
												value={item.actual}
												onChange={(e) => {
													const items = [...form.items];
													items[idx].actual = Number(e.target.value);
													setForm({ ...form, items });
												}}
												className="w-20 px-2 py-1 text-sm text-center h-8"
											/>
										</div>
									</div>
								);
							})
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Catatan (opsional)
						</label>
						<Input
							value={form.notes}
							onChange={(e) => setForm({ ...form, notes: e.target.value })}
							placeholder="Misal: Sebagian kemasan penyok, dll."
						/>
					</div>

					<ModalFooter>
						<Button variant="outline" type="button" onClick={onClose}>
							Batal
						</Button>
						<Button
							type="submit"
							disabled={submitting || form.items.length === 0}
							className="bg-emerald-600 hover:bg-emerald-700 text-white"
						>
							{submitting ? (
								<RefreshCw className="w-4 h-4 animate-spin mr-2" />
							) : (
								<CheckCircle2 className="w-4 h-4 mr-2" />
							)}
							{submitting ? "Menyimpan..." : "Konfirmasi Verifikasi"}
						</Button>
					</ModalFooter>
				</form>
			)}
		</Modal>
	);
}
