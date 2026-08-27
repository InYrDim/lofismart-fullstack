import React, { useEffect, useState, useCallback } from "react";
import {
	Calendar,
	X,
	Package,
	RefreshCw,
	Store,
	User,
	CreditCard,
	Receipt,
	Scale,
	Printer,
} from "lucide-react";
import { format } from "date-fns";
import type {
	Transaction,
	SellingProductDetail,
	SellingServiceDetail,
} from "@/types";
import type { InvoiceItem } from "@/types/invoice";
import { formatQty } from "@/utils/format";
import { TransactionService } from "@/services/transaction.service";
import { PrintService } from "@/lib/print";
import { formatRupiah } from "@/utils";
import { transformSellingToInvoice, buildCompanyInfo } from "@/lib/invoice";
import { Button } from "@/components/ui/button";
import { PaymentStatusBadge } from "@/components/ui/PaymentStatusBadge.old";
import { SizeBadge } from "@/components/ui/badges/SizeBadge";
import { GradeBadge } from "@/components/ui/badges/GradeBadge";

// --- Sub-Components ---

const DetailHeader: React.FC<{
	transaction: Transaction;
	onClose: () => void;
}> = ({ transaction, onClose }) => {
	/* getPaidBadge moved to PaymentStatusBadge component */

	return (
		<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0 bg-white">
			<div>
				<h2 className="text-xl font-bold text-gray-900">Detail Transaksi</h2>
				<div className="flex items-center gap-2 mt-1">
					<span className="text-sm text-gray-500 font-mono tracking-wide bg-gray-100 px-2 py-0.5 rounded">
						{transaction.code}
					</span>
					<span className="text-gray-300">|</span>
					<div className="flex items-center gap-1.5 text-sm text-gray-500">
						<Calendar className="w-3.5 h-3.5" />
						{format(
							new Date(transaction.transaction_date),
							"dd MMM yyyy HH:mm",
						)}
					</div>
				</div>
			</div>
			<div className="flex items-center gap-3">
				<PaymentStatusBadge isPaid={transaction.is_paid} />
				<Button
					variant="ghost"
					size="sm"
					onClick={onClose}
					className="rounded-full w-8 h-8 p-0"
				>
					<X className="w-5 h-5" />
				</Button>
			</div>
		</div>
	);
};

const GeneralInfoSection: React.FC<{ transaction: Transaction }> = ({
	transaction,
}) => (
	<div>
		<h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
			<Store className="w-4 h-4 text-gray-400" />
			Informasi Umum
		</h3>
		<div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm border border-gray-100">
			<div className="flex justify-between items-center">
				<span className="text-gray-500 flex items-center gap-2">
					<User className="w-3.5 h-3.5" /> Pelanggan
				</span>
				<span className="font-medium text-gray-900">
					{transaction.customer_name || "Umum"}
				</span>
			</div>
			<div className="flex justify-between items-center">
				<span className="text-gray-500 flex items-center gap-2">
					<User className="w-3.5 h-3.5" /> Kasir
				</span>
				<span className="font-medium text-gray-900">
					{transaction.cashier_name || "-"}
				</span>
			</div>
			<div className="flex justify-between items-center">
				<span className="text-gray-500 flex items-center gap-2">
					<Store className="w-3.5 h-3.5" /> Toko
				</span>
				<span className="font-medium text-gray-900">
					{transaction.market_name || "-"}
				</span>
			</div>
			<div className="flex justify-between items-center">
				<span className="text-gray-500 flex items-center gap-2">
					<CreditCard className="w-3.5 h-3.5" /> Metode Bayar
				</span>
				<span className="font-medium text-gray-900">
					{transaction.payment_method}
				</span>
			</div>
			<div className="flex justify-between items-center">
				<span className="text-gray-500 flex items-center gap-2">
					<Store className="w-3.5 h-3.5" /> Tipe Pesanan
				</span>
				<span className="font-medium text-gray-900">
					{transaction.online_order === "1" || transaction.online_order === "2"
						? "Offline"
						: transaction.online_order === "3"
							? "Other"
							: "Unknown"}
				</span>
			</div>
			<div className="pt-2 border-t border-gray-200 mt-2">
				<span className="text-gray-500 block mb-1">Catatan:</span>
				{transaction.note ? (
					<p className="text-gray-700 italic">{transaction.note}</p>
				) : (
					<p className="text-gray-400 italic text-xs">Tidak ada catatan</p>
				)}
			</div>
		</div>
	</div>
);

const FinancialDetailsSection: React.FC<{ transaction: Transaction }> = ({
	transaction,
}) => (
	<div>
		<h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
			<Receipt className="w-4 h-4 text-gray-400" />
			Rincian Keuangan
		</h3>
		<div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
			{/* Items Summary */}
			<div className="flex justify-between text-sm pb-2 border-b border-gray-200 mb-2">
				<span className="text-gray-500 flex items-center gap-2">
					<Package className="w-3.5 h-3.5" /> Total Produk (Pcs)
				</span>
				<span className="font-medium text-gray-900">
					{transaction.total_pcs_qty} pcs
				</span>
			</div>
			{transaction.total_weight_qty > 0 && (
				<div className="flex justify-between text-sm">
					<span className="text-gray-500 flex items-center gap-2">
						<Scale className="w-3.5 h-3.5" /> Total Berat
					</span>
					<span className="font-medium text-gray-900">
						{formatQty(transaction.total_weight_qty)} kg
					</span>
				</div>
			)}

			<div className="border-t border-gray-200 my-2 pt-2 space-y-2">
				<div className="flex justify-between text-sm">
					<span className="text-gray-500">Harga (Subtotal)</span>
					<span className="font-medium text-gray-900">
						{formatRupiah(transaction.price)}
					</span>
				</div>
				<div className="flex justify-between text-sm">
					<span className="text-gray-500">Pajak (Tax)</span>
					<span className="font-medium text-gray-900">
						+{formatRupiah(transaction.tax_price)}
					</span>
				</div>
				<div className="flex justify-between text-sm">
					<span className="text-gray-500">Diskon</span>
					<span className="font-medium text-green-600">
						-{formatRupiah(transaction.total_disc)}
					</span>
				</div>
			</div>

			<div className="pt-2 border-t border-gray-200 mt-2 flex justify-between items-center">
				<span className="text-base font-bold text-gray-900">Total Tagihan</span>
				<span className="text-lg font-bold text-brand-primary">
					{formatRupiah(transaction.total_price)}
				</span>
			</div>

			<div className="pt-2 border-t border-gray-200 mt-2 space-y-2">
				<div className="flex justify-between text-sm">
					<span className="text-gray-500">Dibayar</span>
					<span className="font-medium text-gray-900">
						{formatRupiah(transaction.payed_money)}
					</span>
				</div>
				<div className="flex justify-between text-sm">
					<span className="text-gray-500">Kembalian</span>
					<span className="font-medium text-gray-600">
						{formatRupiah(transaction.change_money)}
					</span>
				</div>
			</div>
		</div>
	</div>
);

const ItemsTabsSection: React.FC<{
	activeTab: "product_detail" | "service_detail";
	setActiveTab: (tab: "product_detail" | "service_detail") => void;
	loading: boolean;
	productDetails: SellingProductDetail[];
	serviceDetails: SellingServiceDetail[];
}> = ({ activeTab, setActiveTab, loading, productDetails, serviceDetails }) => {

	const renderProductTable = () => (
		<table className="w-full text-left">
			<thead className="bg-gray-50 border-b border-gray-200">
				<tr>
					<th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase">
						Produk
					</th>
					<th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase">
						Qty
					</th>
					<th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase text-right">
						Total
					</th>
				</tr>
			</thead>
			<tbody className="divide-y divide-gray-100">
				{loading ? (
					<tr>
						<td colSpan={3} className="px-6 py-8 text-center text-gray-500">
							<RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-primary" />
							<p>Memuat...</p>
						</td>
					</tr>
				) : productDetails.length === 0 ? (
					<tr>
						<td colSpan={3} className="px-6 py-8 text-center text-gray-500">
							Tidak ada data produk.
						</td>
					</tr>
				) : (
					productDetails.map(
						(item) => (
							console.log(item),
							(
								<tr key={item.id} className="hover:bg-gray-50">
									<td className="px-6 py-3 text-sm font-medium text-gray-900">
										<div className="flex items-center gap-2">
											<Package className="w-4 h-4 text-gray-400" />
											{item.stock_name || "-"}
										</div>

										{/* Badges for Grade and Size */}
										{(item.grade || item.size) && (
											<div className="flex gap-2 mt-1 ml-6">
												{item.size && (
													<SizeBadge
														sizeName={item.size}
														className="text-[10px] font-medium"
													/>
												)}
												{item.grade && (
													<GradeBadge
														gradeName={item.grade}
														className="text-[10px] font-medium"
														showTooltip={false}
													/>
												)}
											</div>
										)}

										<div className="text-xs text-gray-500 mt-0.5 ml-6">
											@
											{item.price_value != null
												? formatRupiah(item.price_value)
												: "-"}
										</div>

										{/* Total Weight Display */}
										{item.total_weight && item.total_weight > 0 ? (
											<div className="text-xs text-gray-500 mt-0.5 ml-6 flex items-center gap-1">
												<Scale className="w-3 h-3" />
												{formatQty(typeof item.total_weight === "number" ? item.total_weight : parseFloat(item.total_weight as string))}{" "}
												kg
											</div>
										) : null}
									</td>
									<td className="px-6 py-3 text-sm text-gray-700">
										{item.qty}
									</td>
									<td className="px-6 py-3 text-sm font-bold text-gray-900 text-right">
										{formatRupiah(item.total_price)}
									</td>
								</tr>
							)
						),
					)
				)}
			</tbody>
		</table>
	);

	const renderServiceTable = () => (
		<table className="w-full text-left">
			<thead className="bg-gray-50 border-b border-gray-200">
				<tr>
					<th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase">
						Service ID
					</th>
					<th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase">
						Qty
					</th>
					<th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase text-right">
						Total
					</th>
				</tr>
			</thead>
			<tbody className="divide-y divide-gray-100">
				{loading ? (
					<tr>
						<td colSpan={3} className="px-6 py-8 text-center text-gray-500">
							<RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-primary" />
							<p>Memuat...</p>
						</td>
					</tr>
				) : serviceDetails.length === 0 ? (
					<tr>
						<td colSpan={3} className="px-6 py-8 text-center text-gray-500">
							Tidak ada data layanan.
						</td>
					</tr>
				) : (
					serviceDetails.map((item) => (
						<tr key={item.id} className="hover:bg-gray-50">
							<td className="px-6 py-3 text-sm font-medium text-gray-900">
								<div className="flex items-center gap-2">
									<Package className="w-4 h-4 text-gray-400" />
									{item.service_name || "Layanan"}
								</div>
								<div className="mt-1 ml-6">
									<span className="inline-block text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
										#{item.id}
									</span>
								</div>
								<div className="text-xs text-gray-500 mt-0.5 ml-6">
									Mod: {formatRupiah(item.mod_price)}
								</div>
							</td>
							<td className="px-6 py-3 text-sm text-gray-700">{item.qty}</td>
							<td className="px-6 py-3 text-sm font-bold text-gray-900 text-right">
								{formatRupiah(item.total_price)}
							</td>
						</tr>
					))
				)}
			</tbody>
		</table>
	);

	return (
		<div className="border rounded-xl overflow-hidden shadow-sm border-gray-200">
			<div className="flex border-b bg-gray-50">
				<button
					onClick={() => setActiveTab("product_detail")}
					className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === "product_detail" ? "bg-white text-brand-primary border-b-2 border-brand-primary -mb-[2px]" : "text-gray-500 hover:text-gray-700"}`}
				>
					Detail Produk
				</button>
				<button
					onClick={() => setActiveTab("service_detail")}
					className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === "service_detail" ? "bg-white text-brand-primary border-b-2 border-brand-primary -mb-[2px]" : "text-gray-500 hover:text-gray-700"}`}
				>
					Detail Layanan
				</button>
			</div>
			<div className="bg-white">
				{activeTab === "product_detail"
					? renderProductTable()
					: renderServiceTable()}
			</div>
		</div>
	);
};

// --- Main Component ---

interface TransactionDetailSidebarProps {
	isOpen: boolean;
	transaction: Transaction | null;
	onClose: () => void;
	startDate: string;
	endDate: string;
	marketId?: string;
}

type TabType = "product_detail" | "service_detail";

export const TransactionDetailSidebar: React.FC<
	TransactionDetailSidebarProps
> = ({ isOpen, transaction, onClose, startDate, endDate, marketId }) => {
	const [activeTab, setActiveTab] = useState<TabType>("product_detail");
	const [productDetails, setProductDetails] = useState<SellingProductDetail[]>(
		[],
	);
	const [serviceDetails, setServiceDetails] = useState<SellingServiceDetail[]>(
		[],
	);
	const [loading, setLoading] = useState(false);

	const fetchDetails = useCallback(async () => {
		if (!transaction) return;

		try {
			if (activeTab === "product_detail") {
				const data = await TransactionService.getSellingProductDetails({
					marketId,
					startDate,
					endDate,
					sellingId: transaction.id,
				});

				setProductDetails(data);
			} else {
				const data = await TransactionService.getServiceDetails(
					marketId,
					startDate,
					endDate,
					transaction.id,
				);
				setServiceDetails(data);
			}
		} catch (err) {
			console.error("Failed to load details:", err);
		} finally {
			setLoading(false);
		}
	}, [transaction, marketId, startDate, endDate, activeTab]);

	useEffect(() => {
		if (isOpen && transaction) {
			fetchDetails();
		}
	}, [isOpen, transaction, activeTab, fetchDetails]);

	const handlePrintReceipt = useCallback(async () => {
		if (!transaction) return;

		try {
			const [products, services] = await Promise.all([
				TransactionService.getSellingProductDetails({
					marketId,
					startDate,
					endDate,
					sellingId: transaction.id,
				}),
				TransactionService.getServiceDetails(
					marketId,
					startDate,
					endDate,
					transaction.id,
				),
			]);

			const items: InvoiceItem[] = [
				...products.map((p) => ({
					id: p.id,
					name: p.stock_name || "-",
					qty: p.qty,
					unit: "PCS" as const,
					price: p.price_value ?? 0,
					discount: 0,
					subtotal: p.total_price,
					grade: p.grade,
					size: p.size,
					type: "PRODUCT" as const,
				})),
				...services.map((s) => ({
					id: s.id,
					name: s.service_name || "Layanan",
					qty: s.qty,
					unit: "PCS" as const,
					price: s.mod_price,
					discount: 0,
					subtotal: s.total_price,
					type: "SERVICE" as const,
				})),
			];

			const invoice = transformSellingToInvoice(
				transaction as unknown as Record<string, unknown>,
				items,
				buildCompanyInfo(),
			);

			PrintService.printReceipt(invoice);
		} catch (err) {
			console.error("Gagal mencetak struk:", err);
		}
	}, [transaction, marketId, startDate, endDate]);

	useEffect(() => {
		if (!isOpen) {
			setActiveTab("product_detail");
			setProductDetails([]);
			setServiceDetails([]);
		}
	}, [isOpen]);

	return (
		<div
			className={`
				bg-white shadow-xl z-20 transition-all duration-300 ease-in-out overflow-hidden border-l border-gray-200 flex flex-col
				${isOpen ? "w-[500px] opacity-100" : "w-0 opacity-0 border-l-0"}
			`}
			style={{
				minWidth: isOpen ? "500px" : "0px",
				width: isOpen ? "500px" : "0px",
			}}
		>
			<div className="w-[500px] h-full flex flex-col bg-white">
				{transaction && (
					<>
						<DetailHeader transaction={transaction} onClose={onClose} />

						<div className="flex-1 overflow-y-auto">
							<div className="p-6 space-y-8">
								<GeneralInfoSection transaction={transaction} />
								<FinancialDetailsSection transaction={transaction} />
								<ItemsTabsSection
									activeTab={activeTab}
									setActiveTab={setActiveTab}
									loading={loading}
									productDetails={productDetails}
									serviceDetails={serviceDetails}
								/>
							</div>
						</div>

						{/* Footer Actions */}
						<div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
							<Button variant="secondary" onClick={onClose}>
								Tutup
							</Button>
							<Button variant="primary" onClick={handlePrintReceipt}>
								<Printer className="w-4 h-4" />
								Cetak Struk
							</Button>
						</div>
					</>
				)}
			</div>
		</div>
	);
};
