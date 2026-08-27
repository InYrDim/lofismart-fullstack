import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import { useSerial } from "@/hooks/useSerial";
import { ProductService } from "@/services/product.service";
import { storage } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { logger } from "@/services/logger.service";
import type { Product } from "@/types";
import {
	Plug,
	Unplug,
	Trash2,
	Send,
	Wifi,
	WifiOff,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { useRoleAndPermission } from "@/hooks/useRoleAndPermission";

function AdminOnlyGuard({ children }: { children: React.ReactNode }) {
	const navigate = useNavigate();
	const { isAdmin } = useRoleAndPermission();

	useEffect(() => {
		if (!isAdmin) {
			navigate({ to: "/forbidden", replace: true });
		}
	}, [isAdmin, navigate]);

	if (!isAdmin) {
		return null;
	}

	return <>{children}</>;
}

export const Route = createLazyFileRoute("/_protected/test-remote-serial")({
	component: () => (
		<AdminOnlyGuard>
			<TestRemoteSerialPage />
		</AdminOnlyGuard>
	),
});

// ─── Page Component ────────────────────────────────────────────────────────

function TestRemoteSerialPage() {
	const {
		isConnected,
		isConnecting,
		baudRate,
		setBaudRate,
		lastData,
		error,
		connect,
		disconnect,
		send,
		clearData,
	} = useSerial();

	// Products
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoadingProducts, setIsLoadingProducts] = useState(true);

	// Form state
	const [selectedProductId, setSelectedProductId] = useState<string>("");
	const [weight, setWeight] = useState<number>(1.0);
	const [status, setStatus] = useState<boolean>(true);
	const [scaleId, setScaleId] = useState<string>("scale001");
	const [customPrice, setCustomPrice] = useState<number | null>(null);

	// Send history
	const [sentHistory, setSentHistory] = useState<string[]>([]);
	const monitorRef = useRef<HTMLDivElement>(null);

	// Load products
	useEffect(() => {
		const loadProducts = async () => {
			setIsLoadingProducts(true);
			try {
				const marketId = storage.getMarketId();
				const data = await ProductService.getProducts(marketId || undefined);
				setProducts(data);
			} catch (err) {
				logger.error("[TestSerial] Failed to load products:", err);
			} finally {
				setIsLoadingProducts(false);
			}
		};
		loadProducts();
	}, []);

	// Auto-scroll monitor
	useEffect(() => {
		if (monitorRef.current) {
			monitorRef.current.scrollTop = monitorRef.current.scrollHeight;
		}
	}, [lastData]);

	// Selected product
	const selectedProduct = useMemo(
		() => products.find((p) => p.id === selectedProductId || p.productId === selectedProductId),
		[products, selectedProductId]
	);

	// Computed price
	const computedPrice = useMemo(() => {
		if (customPrice !== null) return customPrice;
		if (!selectedProduct) return 0;
		return Math.round(selectedProduct.basePrice * weight);
	}, [selectedProduct, weight, customPrice]);

	// Generated JSON payload
	const generatedPayload = useMemo(() => {
		const payload: Record<string, unknown> = {
			itemCode: selectedProduct?.barcode || "",
			weight: Math.round(weight * 100) / 100,
			price: computedPrice,
			status,
			scaleId: scaleId || "scale001",
		};
		return JSON.stringify(payload, null, 2) + "\n";
	}, [selectedProduct, weight, computedPrice, status, scaleId]);

	// Compact (single-line) version
	const compactPayload = useMemo(() => {
		const payload: Record<string, unknown> = {
			itemCode: selectedProduct?.barcode || "",
			weight: Math.round(weight * 100) / 100,
			price: computedPrice,
			status,
			scaleId: scaleId || "scale001",
		};
		return JSON.stringify(payload) + "\n";
	}, [selectedProduct, weight, computedPrice, status, scaleId]);

	const baudRates = [9600, 19200, 38400, 57600, 115200];

	const handleSend = async (payload: string) => {
		if (!isConnected) return;
		try {
			await send(payload);
			setSentHistory((prev) => [payload, ...prev].slice(0, 50));
		} catch (err) {
			logger.error("[TestSerial] Send failed:", err);
		}
	};

	// Product dropdown options
	const productOptions = useMemo(
		() =>
			products
				.filter((p) => p.isShow !== false)
				.map((p) => ({
					value: p.id,
					label: `${p.name} (${p.barcode || "no barcode"})`,
				})),
		[products]
	);

	const handleWeightChange = (val: number[]) => {
		setWeight(val[0]);
		setCustomPrice(null); // reset custom price when slider moves
	};

	return (
		<div className="flex-1 flex flex-col h-full overflow-hidden">
			<AppHeader
				title="Test Remote Serial"
				description="Simulasi kirim data timbangan ke sistem POS"
			>
				<div
					className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border ${
						isConnected
							? "bg-green-100 text-green-700 border-green-200"
							: error
								? "bg-red-50 text-red-600 border-red-100"
								: "bg-gray-100 text-gray-500 border-gray-200"
					}`}
				>
					{isConnected ? (
						<><Wifi className="w-4 h-4" /> Terhubung ({baudRate} baud)</>
					) : error ? (
						<><WifiOff className="w-4 h-4" /> Error</>
					) : (
						<><WifiOff className="w-4 h-4" /> Terputus</>
					)}
				</div>
			</AppHeader>

			<div className="flex-1 overflow-y-auto p-6">
				<div className="max-w-6xl mx-auto space-y-6">
					{error && (
						<div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 whitespace-pre-line">
							{error}
						</div>
					)}

					<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
						{/* ── Left: Connection ── */}
						<div className="lg:col-span-2 space-y-6">
							{/* Connection Card */}
							<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
								<h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
									Koneksi Port
								</h2>

								<Select
									label="Baud Rate"
									value={baudRate}
									onChange={(e: any) => setBaudRate(Number(e))}
									disabled={isConnected || isConnecting}
									options={baudRates.map((rate) => ({
										value: rate,
										label: `${rate} baud`,
									}))}
									fullWidth
								/>

								{isConnected ? (
									<Button
										onClick={disconnect}
										variant="danger"
										className="gap-2 w-full"
									>
										<Unplug className="w-4 h-4" />
										Putuskan Koneksi
									</Button>
								) : (
									<Button
										onClick={connect}
										disabled={isConnecting}
										isLoading={isConnecting}
										className="gap-2 w-full"
									>
										{!isConnecting && <Plug className="w-4 h-4" />}
										{isConnecting ? "Menghubungkan..." : "Hubungkan ke Port Serial"}
									</Button>
								)}
							</div>

							{/* Product Form Card */}
							<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-5">
								<h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
									Simulasi Data Timbangan
								</h2>

								{/* Product Select */}
								<Select
									label="Produk (itemCode)"
									value={selectedProductId}
									onChange={(val) => {
										setSelectedProductId(String(val));
										setCustomPrice(null);
									}}
									disabled={isLoadingProducts}
									placeholder={
										isLoadingProducts
											? "Memuat produk..."
											: "Pilih produk..."
									}
									options={productOptions}
									fullWidth
								/>

								{/* Weight Slider */}
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<Label className="text-sm font-medium text-gray-700">
											Berat (kg)
										</Label>
										<span className="text-sm font-bold text-brand-primary tabular-nums">
											{weight.toFixed(2)} kg
										</span>
									</div>
									<Slider
										value={[weight]}
										onValueChange={handleWeightChange}
										min={0.1}
										max={10}
										step={0.01}
										disabled={isLoadingProducts}
									/>
									<div className="flex justify-between text-[10px] text-gray-400">
										<span>0.1 kg</span>
										<span>10 kg</span>
									</div>
								</div>

								{/* Status + Scale ID row */}
								<div className="flex items-center gap-6">
									<div className="flex items-center gap-2">
										<Checkbox
											id="status-check"
											checked={status}
											onCheckedChange={(val) => setStatus(val === true)}
										/>
										<Label
											htmlFor="status-check"
											className="text-sm font-medium text-gray-700 cursor-pointer"
										>
											Status {status ? "Aktif" : "Nonaktif"}
										</Label>
									</div>

									<div className="flex-1">
										<Label
											htmlFor="scale-id"
											className="text-xs font-medium text-gray-500 mb-1 block"
										>
											Scale ID
										</Label>
										<input
											id="scale-id"
											type="text"
											value={scaleId}
											onChange={(e) => setScaleId(e.target.value)}
											className="w-full px-2 py-1 text-xs font-mono border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
										/>
									</div>
								</div>

								{/* Price info */}
								{selectedProduct && (
									<div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs text-gray-600">
										<div className="flex justify-between">
											<span>Harga dasar produk</span>
											<span className="font-semibold tabular-nums">
												Rp {selectedProduct.basePrice.toLocaleString("id-ID")}
											</span>
										</div>
										<div className="flex justify-between">
											<span>Harga × berat</span>
											<span className="font-semibold tabular-nums">
												Rp {(selectedProduct.basePrice * weight).toLocaleString("id-ID", { maximumFractionDigits: 0 })}
											</span>
										</div>
										{customPrice !== null && (
											<div className="flex justify-between text-brand-primary">
												<span>Harga (kustom)</span>
												<span className="font-semibold tabular-nums">
													Rp {customPrice.toLocaleString("id-ID")}
												</span>
											</div>
										)}
									</div>
								)}

								{/* Generated JSON Preview */}
								<div className="space-y-1">
									<Label className="text-xs font-medium text-gray-500">
										Preview JSON
									</Label>
									<pre className="text-[11px] font-mono bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto leading-relaxed">
										{generatedPayload}
									</pre>
								</div>

								{/* Send Buttons */}
								<div className="flex gap-2">
									<Button
										onClick={() => handleSend(compactPayload)}
										disabled={!isConnected || !selectedProduct}
										className="gap-2 flex-1"
									>
										<Send className="w-4 h-4" />
										Kirim (compact)
									</Button>
									<Button
										onClick={() => handleSend(generatedPayload)}
										disabled={!isConnected || !selectedProduct}
										variant="outline"
										className="gap-2 flex-1"
									>
										<Send className="w-4 h-4" />
										Kirim (pretty)
									</Button>
								</div>
							</div>
						</div>

						{/* ── Right: Monitor + History ── */}
						<div className="lg:col-span-3 space-y-6">
							{/* Data Monitor */}
							<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
								<div className="flex items-center justify-between p-4 border-b border-gray-100">
									<h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
										Monitor Data Masuk
									</h2>
									<Button
										onClick={clearData}
										variant="ghost"
										size="sm"
										className="h-7 px-2 text-gray-400 hover:text-red-500 gap-1"
									>
										<Trash2 className="w-3.5 h-3.5" />
										<span className="text-xs">Bersihkan</span>
									</Button>
								</div>
								<div
									ref={monitorRef}
									className="bg-gray-900 p-4 font-mono text-xs text-green-400 shadow-inner overflow-y-auto max-h-[400px] min-h-[200px] whitespace-pre-wrap break-all"
								>
									{lastData ? (
										lastData
									) : (
										<span className="text-gray-600 italic">
											Belum ada data yang diterima...
										</span>
									)}
								</div>
							</div>

							{/* Sent History */}
							<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
								<div className="flex items-center justify-between p-4 border-b border-gray-100">
									<h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
										Riwayat Terkirim
									</h2>
									<div className="flex items-center gap-3">
										<span className="text-xs text-gray-400">
											{sentHistory.length} pesan
										</span>
										{sentHistory.length > 0 && (
											<button
												onClick={() => setSentHistory([])}
												className="text-xs text-red-500 hover:text-red-600 transition-colors"
											>
												Hapus semua
											</button>
										)}
									</div>
								</div>
								<div className="p-4 space-y-2 overflow-y-auto max-h-[300px] min-h-[150px]">
									{sentHistory.length === 0 ? (
										<p className="text-sm text-gray-400 italic">
											Belum ada data yang dikirim...
										</p>
									) : (
										sentHistory.map((entry, i) => (
											<div
												key={i}
												className="text-xs font-mono bg-gray-50 p-2 rounded border border-gray-100 text-gray-600 break-all"
											>
												{entry}
											</div>
										))
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
