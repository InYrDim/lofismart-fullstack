import { useState, useEffect, useMemo } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useMainLayout } from "@/components/layouts/MainLayoutContext";

export const Route = createLazyFileRoute('/_protected/pos')({
	component: POSPage,
});
import type { Product } from "@/types";
import { ProductService } from "@/services/product.service";
import ProductCatalog from "@/components/ProductCatalog";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import CartSidebar from "@/components/CartSidebar";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useRoleAndPermission } from "@/hooks/useRoleAndPermission";
import PosHeader from "@/components/PosHeader";
import { storage } from "@/utils/storage";
import { PrintService } from "@/lib/print";
import { transformPosToInvoice } from "@/lib/invoice";
import type { SalesInvoice } from "@/types/invoice";

import { ScaleListener } from "@/components/ScaleListener";

import { Modal } from "@/components/ui/modals/Modal";
import { PaymentModal } from "@/components/ui/modals/PaymentModal";
import { UnassignedOutletModal } from "@/components/ui/modals/UnassignedOutletModal";
import { SerialSettingsModal } from "@/components/ui/modals/SerialSettingsModal";
import { useSerial } from "@/hooks/useSerial";
import { useMarkets } from "@/hooks/useMarkets";
import { Plug, Loader2, Scale } from "lucide-react";

function NoDeviceScreen({ onConnect }: { onConnect: () => void }) {
	return (
		<div className="flex-1 flex items-center justify-center bg-gray-100">
			<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center flex flex-col items-center gap-4">
				<div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
					<Scale className="w-8 h-8 text-red-500" />
				</div>
				<h2 className="text-xl font-bold text-gray-800">Tidak Ada Perangkat Terhubung</h2>
				<p className="text-sm text-gray-500 leading-relaxed">
					Halaman POS tidak dapat diakses karena belum ada perangkat timbangan yang
					terhubung. Hubungkan perangkat terlebih dahulu untuk melanjutkan transaksi.
				</p>
				<Button
					onClick={onConnect}
					variant="primary"
					className="gap-2 mt-2 w-full"
				>
					<Plug className="w-4 h-4" />
					Hubungkan Perangkat
				</Button>
			</div>
		</div>
	);
}

function DeviceLoadingScreen() {
	return (
		<div className="flex-1 flex items-center justify-center bg-gray-100">
			<div className="flex flex-col items-center gap-3 text-gray-500">
				<Loader2 className="w-8 h-8 animate-spin" />
				<div className="text-sm">Menghubungkan perangkat...</div>
			</div>
		</div>
	);
}

function POSPage() {
	const { isSidebarOpen, setIsSidebarOpen } = useMainLayout();

	// ═══ Device connection gate: block POS when no scale device is connected ═══
	const { isConnected, isConnecting } = useSerial();
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	const [searchQuery, setSearchQuery] = useState("");
	const [isCartOpen, setIsCartOpen] = useState(true);

	const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
	const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
	const [lastChange, setLastChange] = useState(0);
	const [lastInvoice, setLastInvoice] = useState<SalesInvoice | null>(null);

	const [refreshTrigger, setRefreshTrigger] = useState(0);

	// ═══ Outlet assignment check for KSR / SPVR ═══
	const { marketId, marketName } = useAuth();
	const { isCashier, isSupervisor } = useRoleAndPermission();
	const [showUnassignedModal, setShowUnassignedModal] = useState(false);

	// ═══ Market display: resolve current market name ═══
	// Prefer the market matching the currently-displayed products (stored ID),
	// then fall back to the user's assigned market name from auth.
	const { markets } = useMarkets();
	const displayMarketName = useMemo(() => {
		const storedMarketId = storage.getMarketId();
		if (storedMarketId) {
			const found = markets.find((m) => m.id === storedMarketId);
			if (found) return found.name;
		}
		return marketName || undefined;
	}, [marketName, markets]);

	useEffect(() => {
		const isScopedRole = isCashier || isSupervisor;
		if (isScopedRole && !marketId) {
			setShowUnassignedModal(true);
		} else {
			setShowUnassignedModal(false);
		}
	}, [isCashier, isSupervisor, marketId]);

	const {
		cart,
		activeVoucher,
		voucherDiscount,
		applyVoucher,
		addToCart,
		updateQuantity,
		updateGrade,
		updateGrading,
		addScaleItem,
		removeFromCart,
		clearCart,
		summary,
	} = useCart();

	const handleRefresh = () => {
		setSearchQuery("");
		setRefreshTrigger((prev) => prev + 1);
	};

	const [products, setProducts] = useState<Product[]>([]);
	const [isLoadingProducts, setIsLoadingProducts] = useState(true);

	useEffect(() => {
		const loadProducts = async () => {
			setIsLoadingProducts(true);
			try {
				const marketId = storage.getMarketId();
				const data = await ProductService.getProducts(marketId || undefined);
				setProducts(data);
			} catch (error) {
				console.error("Failed to load products:", error);
			} finally {
				setIsLoadingProducts(false);
			}
		};
		loadProducts();
	}, [refreshTrigger]);

	// Filter Products (Search Logic) - Exclude archived products
	const filteredProducts = useMemo(() => {
		return products.filter((p: Product) =>
			p.isShow !== false && // Exclude archived products
			p.name.toLowerCase().includes(searchQuery.toLowerCase()),
		)
	}, [searchQuery, products]);

	const handlePaymentSuccess = (paymentAmount: number, transaction: Record<string, unknown>) => {
		const change = Math.max(0, paymentAmount - summary.total);
		setLastChange(change);
		setIsPaymentModalOpen(false);

		const invoice = transformPosToInvoice(transaction, cart);
		setLastInvoice(invoice);

		setIsSuccessModalOpen(true);
	}

	const handleCloseSuccess = () => {
		setIsSuccessModalOpen(false);
		setLastInvoice(null);
		clearCart();
		setRefreshTrigger((prev) => prev + 1);
	}

	// Calculate total items for badge
	const totalItems = useMemo(() => {
		return cart.reduce((acc, item) => acc + item.qty, 0);
	}, [cart]);

	// ═══ Device gate: render blocked/loading screen before POS UI ═══
	if (isConnecting) {
		return <DeviceLoadingScreen />;
	}

	if (!isConnected) {
		return (
			<>
				<NoDeviceScreen onConnect={() => setIsSettingsOpen(true)} />
				<SerialSettingsModal
					isOpen={isSettingsOpen}
					onClose={() => setIsSettingsOpen(false)}
				/>
			</>
		);
	}

	return (
		<>
			<ScaleListener products={products} onAddScaleItem={addScaleItem} />
			{/* Sidebar is now in MainLayout */}

			{/* Left Side - Catalog */}
			<div className="flex-1 flex flex-col min-w-0 bg-gray-100">
				<PosHeader
					isSidebarOpen={isSidebarOpen}
					setIsSidebarOpen={setIsSidebarOpen}
					isCartOpen={isCartOpen}
					setIsCartOpen={setIsCartOpen}
					totalItems={totalItems}
					handleRefresh={handleRefresh}
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					marketName={displayMarketName}
				/>

				{isLoadingProducts ? (
					<div className="flex-1 flex items-center justify-center">
						<div className="text-gray-500">Memuat produk...</div>
					</div>
				) : (
					<ProductCatalog
						products={filteredProducts}
						cart={cart}
						onAddToCart={addToCart}
						onUpdateQuantity={updateQuantity}
					/>
				)}
			</div>

			{/* Right Side - Cart Component */}
			<div
				className={`
					transition-all duration-300 ease-in-out overflow-hidden
					${isCartOpen ? "w-[400px] opacity-100" : "w-0 opacity-0"}
				`}
			>
				<div className="w-[400px] h-full">
					<CartSidebar
						cart={cart}
						onUpdateQuantity={updateQuantity}
						onUpdateGrade={updateGrade}
						onUpdateGrading={updateGrading} // Pass fungsi baru
						onRemove={removeFromCart}
						onClear={clearCart}
						onApplyVoucher={applyVoucher}
						activeVoucher={activeVoucher}
						voucherDiscount={voucherDiscount}
						summary={summary}
						onCheckout={() => setIsPaymentModalOpen(true)}
					/>
				</div>
			</div>

			{/* ═══ Outlet Assignment Warning Modal ═══ */}
			<UnassignedOutletModal
				isOpen={showUnassignedModal}
				onClose={() => setShowUnassignedModal(false)}
			/>

			{/* Modals */}
			<PaymentModal
				isOpen={isPaymentModalOpen}
				onClose={() => setIsPaymentModalOpen(false)}
				onSuccess={handlePaymentSuccess}
				cart={cart}
				activeVoucher={activeVoucher}
				voucherDiscount={voucherDiscount}
				summary={summary}
			/>

			<Modal
				isOpen={isSuccessModalOpen}
				onClose={handleCloseSuccess}
				variant="success"
				layout="center"
				title="Transaksi Sukses!"
				description="Pembayaran berhasil disimpan."
				size="sm"
				contentClassName="p-0"
				className="max-w-[400px]"
			>
				<div className="flex flex-col items-center text-center w-full">
					<div className="bg-gray-50 border border-gray-100 rounded-xl p-4 w-full mb-6 mt-4">
						<p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
							Kembalian
						</p>
						<p className="text-2xl font-bold text-gray-800">
							{new Intl.NumberFormat("id-ID", {
								style: "currency",
								currency: "IDR",
								minimumFractionDigits: 0,
								maximumFractionDigits: 0,
							}).format(lastChange)}
						</p>
					</div>

					<div className="flex gap-3 w-full">
						<Button
							onClick={() => lastInvoice && PrintService.printReceipt(lastInvoice)}
							className="flex-1 gap-2 py-6 rounded-xl shadow-lg shadow-brand-primary/20"
							variant="primary"
						>
							<Printer className="w-4 h-4" />
							Cetak Struk
						</Button>
						<Button
							onClick={handleCloseSuccess}
							className="flex-1 gap-2 py-6 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 border-none"
							variant="ghost"
						>
							Tutup
						</Button>
					</div>
				</div>
			</Modal>
		</>
	)
};
