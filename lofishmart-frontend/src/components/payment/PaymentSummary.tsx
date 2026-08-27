import React from "react";
import { X, Tag, Scale, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import type { CartItem, CartSummary, PaymentMethod } from "@/types";
import { formatRupiah } from "@/utils";
import { getGradingLabel } from "@/utils/grading";

interface PaymentSummaryProps {
	cart: CartItem[];
	totalAmount: number;
	cashAmount: string;
	change: number;
	summary: CartSummary;
	activeVoucher?: string;
	onClose: () => void;
	activeTab: PaymentMethod;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({
	cart,
	totalAmount,
	cashAmount,
	change,
	summary,
	activeVoucher,
	onClose,
	activeTab,
}) => {
	return (
		<div className="hidden md:flex w-[400px] flex-col bg-gray-50 border-l border-gray-200 text-sm">
			{/* Header Kanan */}
			<div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0 bg-gray-50">
				<h3 className="text-base font-bold text-gray-700 font-sans">
					Rincian Pesanan
				</h3>
				<Button
					onClick={onClose}
					variant="ghost"
					size="sm"
					className="p-2 rounded-full text-gray-500"
				>
					<X className="w-5 h-5" />
				</Button>
			</div>

			{/* List Pesanan */}
			<div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
				{cart.map((item) => {
					const unitPrice = (item.subtotal + item.discount) / item.qty;

					// Logic untuk menentukan label variant
					let variantLabel = item.selectedGrade;
					if (
						item.useGradingSystem &&
						item.selectedSize &&
						item.selectedQuality
					) {
						variantLabel = getGradingLabel(
							item.selectedSize,
							item.selectedQuality,
						);
					}

					return (
						<div
							key={item.cartId}
							className="flex flex-col border-b border-dashed border-gray-300 pb-4 last:border-0"
						>
							<div className="flex justify-between items-start mb-1">
								<span className="font-bold text-gray-800 w-2/3 truncate">
									{item.name}
								</span>
								<span className="text-gray-900 font-bold">
									{formatRupiah(item.subtotal + item.discount)}
								</span>
							</div>

							<div className="flex justify-between text-xs text-gray-500 mb-1 items-center">
								<div className="flex items-center gap-2">
									<span>
										{item.qty} x {formatRupiah(unitPrice)}
									</span>
									{item.measuredWeight !== undefined && (
										<Tooltip content="berat produk">
											<Badge
												variant="secondary"
												className="px-1.5 py-0.5 text-[10px]"
											>
												{item.measuredWeight > 0 ? item.measuredWeight : "0"}
												kg
											</Badge>
										</Tooltip>
									)}
									<Tooltip content="sumber produk (timbangan atau input manual)">
										{item.source === "serial" ? (
											<Badge
												variant="secondary"
												className="px-1.5 py-0.5 text-[10px] gap-1"
											>
												<Scale className="w-2.5 h-2.5" /> Timbangan
											</Badge>
										) : (
											<Badge
												variant="default"
												className="bg-brand-primary/10 text-brand-primary border-brand-primary/20 px-1.5 py-0.5 text-[10px] gap-1 hover:bg-brand-primary/20"
											>
												<User className="w-2.5 h-2.5" /> Manual
											</Badge>
										)}
									</Tooltip>
								</div>
								{variantLabel && (
									<Badge
										variant="outline"
										className="text-[10px] text-gray-600 bg-gray-200"
									>
										{variantLabel}
									</Badge>
								)}
							</div>

							{item.discount > 0 && (
								<div className="flex justify-between text-xs text-red-500">
									<span>Diskon Item</span>
									<span>- {formatRupiah(item.discount)}</span>
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Footer Kanan: Summary Fields */}
			<div className="p-6 bg-white border-t border-gray-200 space-y-3 text-gray-600">
				<div className="flex justify-between">
					<span>SUBTOTAL</span>
					<span className="font-bold text-gray-800">
						{formatRupiah(summary.grossTotal)}
					</span>
				</div>

				<div className="flex justify-between">
					<span>PAJAK</span>
					<span className="font-bold text-gray-800">
						{formatRupiah(summary.tax)}
					</span>
				</div>

				<div className="flex justify-between text-red-500">
					<span>TOTAL DISKON ITEM</span>
					<span>
						{summary.totalItemDiscount > 0
							? `- ${formatRupiah(summary.totalItemDiscount)}`
							: "-"}
					</span>
				</div>

				{/* DISC VOUCHER dengan Badge */}
				<div className="flex justify-between items-center text-red-500">
					<div className="flex items-center gap-2">
						<span>DISKON VOUCHER</span>
						{activeVoucher && (
							<Badge
								variant="destructive"
								className="gap-1 text-[10px] uppercase tracking-wide"
							>
								<Tag className="w-3 h-3" />
								{activeVoucher}
							</Badge>
						)}
					</div>
					<span>
						{summary.voucherDiscount > 0
							? `- ${formatRupiah(summary.voucherDiscount)}`
							: "-"}
					</span>
				</div>

				<div className="border-t-2 border-dashed border-gray-300 my-2"></div>

				<div className="flex justify-between items-center text-lg">
					<span className="font-bold text-gray-900">TOTAL</span>
					<span className="font-extrabold text-brand-primary">
						{formatRupiah(totalAmount)}
					</span>
				</div>

				{/* Money & Change Display (Read Only) */}
				<div className="flex justify-between items-center text-sm pt-2">
					<span>UANG</span>
					<span className="font-bold">
						{activeTab === "CASH" && cashAmount
							? formatRupiah(parseInt(cashAmount.replace(/\D/g, "")))
							: "-"}
					</span>
				</div>
				<div className="flex justify-between items-center text-sm">
					<span>KEMBALIAN</span>
					<span
						className={`${
							change >= 0 ? "text-green-600" : "text-gray-400"
						} font-bold`}
					>
						{activeTab === "CASH" ? formatRupiah(change) : "-"}
					</span>
				</div>
			</div>
		</div>
	);
};
