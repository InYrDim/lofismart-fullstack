import React, { useState, useEffect } from "react";
import {
	ShoppingCart,
	RotateCcw,
	Minus,
	Plus,
	Trash2,
	Tag,
	Package,
	Sparkles,
	Scale,
	User,
	X,
	Check,
	ChevronsUpDown,
} from "lucide-react";
import { Tooltip } from "./ui/tooltip";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Badge } from "./ui/badge";
import { SizeBadge } from "./ui/badges/SizeBadge";
import { GradeBadge } from "./ui/badges/GradeBadge";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { formatQty } from "@/utils/format";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "./ui/command";
import type { CartItem, CartSummary } from "@/types";
import { formatRupiah } from "@/utils";
import { SIZES, QUALITY_CRITERIA } from "@/utils/grading";
import { ProductImage } from "./ui/ProductImage";

interface CartSidebarProps {
	cart: CartItem[];
	onUpdateQuantity: (cartId: string, delta: number) => void;
	onUpdateGrade: (cartId: string, newGrade: string) => void;
	onUpdateGrading: (
		cartId: string,
		type: "size" | "quality",
		value: string
	) => void;
	onRemove: (cartId: string) => void;
	onClear: () => void;
	onApplyVoucher: (code: string) => void;
	activeVoucher: string;
	voucherDiscount: number;
	summary: CartSummary;
	onCheckout: () => void;
}
const CartSidebar: React.FC<CartSidebarProps> = ({
	cart,
	onUpdateQuantity,
	onUpdateGrade,
	onUpdateGrading,
	onRemove,
	onClear,
	onApplyVoucher,
	activeVoucher,
	voucherDiscount,
	summary,
	onCheckout,
}) => {
	const MOCK_MEMBERS = [
		{ value: "budi", label: "Budi Santoso" },
		{ value: "andi", label: "Andi Wijaya" },
		{ value: "siti", label: "Siti Aminah" },
		{ value: "joko", label: "Joko Anwar" },
		{ value: "kasir1", label: "Kasir Umum" },
	];

	const [voucherCodeInput, setVoucherCodeInput] = useState("");
	const [memberOpen, setMemberOpen] = useState(false);
	const [selectedMember, setSelectedMember] = useState("");

	useEffect(() => {
		setVoucherCodeInput(activeVoucher);
	}, [activeVoucher]);

	const handleVoucherSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			onApplyVoucher(voucherCodeInput);
		}
	};

	const productItems = cart.filter((item) => item.type === "PRODUCT");
	const serviceItems = cart.filter((item) => item.type === "SERVICE");

	const renderCartItem = (item: CartItem) => {
		const isService = item.type === "SERVICE";
		const isNonStock = item.is_non_stock === "2" || item.isNonStock;

		const otherItemsWithSameProduct = cart.filter(
			(otherItem) => otherItem.id === item.id && otherItem.cartId !== item.cartId
		);
		const otherReservedWeight = otherItemsWithSameProduct.reduce(
			(sum, oi) => sum + (oi.measuredWeight || 1) * oi.qty,
			0
		);
		const thisItemWeight = (item.measuredWeight || 1) * item.qty;
		const totalReserved = otherReservedWeight + thisItemWeight;
		const totalStock = item.stock || 0;
		const canAddMore = isService || isNonStock || (totalReserved + (item.measuredWeight || 1)) <= totalStock;
		// Logic untuk menentukan nama tampilan jika menggunakan sistem grading
		const displayName = item.name;
		let skuCode = null;

		if (
			item.type === "PRODUCT" &&
			// item.useGradingSystem &&
			// item.productBarcode && // used code instead of productCode
			item.selectedSize &&
			item.selectedQuality
		) {
			// skuCode = generateSkuCode(
			// 	item.productBarcode, // used code instead of productCode
			// 	item.selectedSize,
			// 	item.selectedQuality
			// );
			skuCode = item.barcode;

			// const gradingLabel = getGradingLabel(
			// 	item.selectedSize,
			// 	item.selectedQuality
			// );
			// Format: "Layang Besar A" (Nama diambil dari item.name, mungkin perlu dipotong kata 'Ikan' jika mau persis contoh user, tapi ini cukup jelas)
			// displayName = `${item.name.replace("Ikan ", "")} ${gradingLabel}`;
		}

		return (
			<div
				key={item.cartId}
				className="flex gap-3 pb-4 border-b border-gray-100 last:border-0 animate-in slide-in-from-right-4 duration-300 items-start group"
			>
				<ProductImage
					src={item.image}
					alt={item.name}
					size="sm"
					containerClassName="shrink-0 border border-gray-200"
				>
					{/* Tampilkan Kode Unik di atas gambar jika ada */}
					{skuCode && (
						<div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center font-mono py-0.5 backdrop-blur-sm">
							{skuCode}
						</div>
					)}
				</ProductImage>

				<div className="flex-1 min-w-0 flex flex-col gap-1.5">
					<div className="flex justify-between items-start">
						<div className="flex flex-col gap-1">
							<h4 className="font-bold text-gray-800 text-xs pr-2 leading-tight">
								{displayName}
							</h4>
							<div className="flex flex-wrap gap-1">
								{item.size && (
									<Tooltip content="ukuran produk">
										<SizeBadge sizeName={item.size} className="text-[10px] bg-purple-50 text-purple-600 border border-purple-100" />
									</Tooltip>
								)}
								{item.grade && (
									<Tooltip content="kualitas produk">
										<GradeBadge gradeName={item.grade} showTooltip={false} className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100" />
									</Tooltip>
								)}
								{item.measuredWeight && (
									<Tooltip content="berat produk">
										<span className="text-[10px] font-medium bg-brand-secondary/10 px-1.5 py-0.5 rounded text-brand-secondary border border-brand-secondary/10">
											{item.measuredWeight >= 0 ? item.measuredWeight : "0"} kg
										</span>
									</Tooltip>
								)}
								{/* Source Badge */}
								<Tooltip content="sumber produk (timbangan atau input manual)">
									{item.source === "serial" ? (
										<span className="text-[10px] font-medium bg-brand-secondary/10 px-1.5 py-0.5 rounded text-brand-secondary border border-brand-secondary/20 flex items-center gap-1">
											<Scale className="w-2.5 h-2.5" /> Timbangan
										</span>
									) : (
										<span className="text-[10px] font-medium bg-brand-primary/10 px-1.5 py-0.5 rounded text-brand-primary border border-brand-primary/20 flex items-center gap-1">
											<User className="w-2.5 h-2.5" /> Manual
										</span>
									)}
								</Tooltip>
							</div>
							{/* Harga satuan terhitung */}
							<span className="text-[10px] text-gray-400 font-medium mt-0.5">
								{formatRupiah(item.basePrice)}
							</span>
						</div>
						<div className="text-right">
							<p className="text-xs font-bold text-gray-900">
								{formatRupiah(item.subtotal - item.discount)}
							</p>
							{item.discount > 0 && (
								<p className="text-[10px] text-gray-400 line-through">
									{formatRupiah(item.subtotal)}
								</p>
							)}
						</div>
					</div>

					<div className="flex flex-col gap-2 mt-1">
						{/* Controls Row 1: Qty & Actions */}
						<div className="flex items-center gap-2 justify-between">
							<div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5 border border-gray-200">
								<Button
									onClick={() => onUpdateQuantity(item.cartId, -1)}
									className="w-5! h-5! p-0! rounded bg-white text-gray-600 hover:bg-gray-100 shadow-sm transition-colors border border-gray-200"
									variant="ghost"
								>
									<Minus className="w-3 h-3" />
								</Button>
								<span className="text-[10px] font-bold w-12 text-center text-gray-800">
									{formatQty(item.qty)}
								</span>
								<Button
									onClick={() => onUpdateQuantity(item.cartId, 1)}
									disabled={!canAddMore}
									className={`w-5! h-5! p-0! rounded shadow-sm transition-colors border ${canAddMore
										? "bg-white text-gray-600 hover:bg-gray-100 border-gray-200"
										: "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-100 opacity-50"
									}`}
									variant="ghost"
								>
									<Plus className="w-3 h-3" />
								</Button>
							</div>

							{/* Delete Button */}
							<Button
								onClick={() => onRemove(item.cartId)}
								className="p-1! h-auto! text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors ml-auto"
								variant="ghost"
							>
								<Trash2 className="w-3.5 h-3.5" />
							</Button>
						</div>

						{/* Controls Row 2: Variant Selectors */}
						{/* Case 1: New Grading System (2 Dropdowns) */}
						{item.useGradingSystem && (
							<div className="grid grid-cols-2 gap-2">
								{/* Size Dropdown */}
								<Select
									value={item.selectedSize}
									onChange={(val) =>
										onUpdateGrading(item.cartId, "size", String(val))
									}
									options={SIZES.map((s) => ({
										value: s.id,
										label: `${s.id} - ${s.label}`,
									}))}
									className="text-[9px] font-bold py-1 h-7 bg-brand-primary/10 border-brand-primary/20 text-brand-primary"
								/>

								{/* Quality Dropdown */}
								<Select
									value={item.selectedQuality}
									onChange={(val) =>
										onUpdateGrading(item.cartId, "quality", String(val))
									}
									options={QUALITY_CRITERIA.map((q) => ({
										value: q.id,
										label: `${q.id} - ${q.label}`,
									}))}
									className="text-[9px] font-bold py-1 h-7 bg-brand-secondary/10 border-brand-secondary/20 text-brand-secondary"
								/>
							</div>
						)}

						{/* Case 2: Old Variant System (1 Dropdown) */}
						{!item.useGradingSystem && item.hasVariants && item.variants && (
							<div className="relative w-full">
								<Select
									value={item.selectedGrade}
									onChange={(val) => onUpdateGrade(item.cartId, String(val))}
									options={item.variants.map((v) => ({
										value: v.grade,
										label: v.grade,
									}))}
									className="text-[9px] font-medium py-1 h-7 bg-gray-50 border-gray-200 text-gray-600"
								/>
							</div>
						)}
					</div>

					{item.discount > 0 && (
						<Badge
							variant="destructive"
							className="mt-1 self-start flex items-center gap-1 bg-red-50 border-red-100 text-red-600"
						>
							<Tag className="w-2.5 h-2.5" />
							<span className="text-[9px]">
								Hemat {formatRupiah(item.discount)}
							</span>
						</Badge>
					)}
				</div>
			</div>
		);
	};

	return (
		<div className="w-[400px] bg-white border-l border-gray-100 flex flex-col shadow-2xl z-20 h-full font-sans">
			{/* Header */}
			<div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
				<h2 className="font-bold text-xl text-brand-tertiary">Pesanan</h2>
				<Button
					onClick={onClear}
					disabled={cart.length === 0}
					variant="ghost"
					className="text-xs font-bold text-brand-primary hover:text-brand-primary/80"
				>
					<RotateCcw className="w-3 h-3 mr-1" />
					Reset
				</Button>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
				{cart.length === 0 ? (
					<div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-4">
						<div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
							<ShoppingCart className="w-8 h-8 opacity-50" />
						</div>
						<p className="font-medium text-sm">Belum ada pesanan</p>
					</div>
				) : (
					<>
						{/* Section Product */}
						{productItems.length > 0 && (
							<div className="space-y-3">
								<div className="flex items-center gap-2 text-brand-tertiary pb-2 border-b border-gray-100">
									<Package className="w-4 h-4 text-brand-primary" />
									<h3 className="text-sm font-bold uppercase tracking-wider">
										Produk
									</h3>
									<span className="text-xs text-gray-400 font-normal ml-auto">
										{productItems.length} item
									</span>
								</div>
								{productItems.map(renderCartItem)}
							</div>
						)}

						{/* Section Service */}
						{serviceItems.length > 0 && (
							<div className="space-y-3 pt-2">
								<div className="flex items-center gap-2 text-brand-tertiary pb-2 border-b border-gray-100">
									<Sparkles className="w-4 h-4 text-brand-secondary" />
									<h3 className="text-sm font-bold uppercase tracking-wider">
										Layanan
									</h3>
									<span className="text-xs text-gray-400 font-normal ml-auto">
										{serviceItems.length} item
									</span>
								</div>
								{serviceItems.map(renderCartItem)}
							</div>
						)}
					</>
				)}
			</div>

			{/* Footer */}
			<div className="p-5 bg-white border-t border-gray-100 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-10">
				<div className="grid grid-cols-2 gap-3">
					<Popover open={memberOpen} onOpenChange={setMemberOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								role="combobox"
								aria-expanded={memberOpen}
								className="col-span-2 justify-between text-xs font-medium bg-gray-50 border-transparent hover:bg-gray-100 hover:border-gray-200 text-gray-800 h-9 px-3"
							>
								{selectedMember
									? MOCK_MEMBERS.find((member) => member.value === selectedMember)?.label
									: "Pilih Nama Member..."}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[352px] p-0" align="start">
							<Command>
								<CommandInput placeholder="Cari member..." className="text-xs h-9" />
								<CommandList>
									<CommandEmpty>Member tidak ditemukan.</CommandEmpty>
									<CommandGroup>
										{MOCK_MEMBERS.map((member) => (
											<CommandItem
												key={member.value}
												value={member.value}
												onSelect={(currentValue) => {
													setSelectedMember(currentValue === selectedMember ? "" : currentValue);
													setMemberOpen(false);
												}}
												className="text-xs"
											>
												<Check
													className={`mr-2 h-4 w-4 ${selectedMember === member.value ? "opacity-100" : "opacity-0"
														}`}
												/>
												{member.label}
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
					<Input
						placeholder="Catatan"
						inputClassName="text-xs font-medium bg-gray-50 border-transparent hover:border-gray-200 placeholder-gray-400 text-gray-800"
					/>
					<div className="relative">
						<Input
							value={voucherCodeInput}
							onChange={(e) => {
								const val = e.target.value;
								setVoucherCodeInput(val);
								if (val === "") {
									onApplyVoucher("");
								}
							}}
							onBlur={() => onApplyVoucher(voucherCodeInput)}
							onKeyDown={handleVoucherSubmit}
							placeholder="Kode Voucher (Coba: ITEM10)"
							inputClassName={`text-xs font-medium uppercase transition-all ${activeVoucher
								? "bg-green-50 border-green-200 focus:border-green-500 focus:ring-green-500/10"
								: "bg-gray-50 border-transparent focus:bg-white focus:border-brand-primary focus:ring-brand-primary/10"
								}`}
							rightAddon={
								voucherCodeInput ? (
									<button
										onClick={() => {
											setVoucherCodeInput("");
											onApplyVoucher("");
										}}
										className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
										type="button"
									>
										<X className="w-3.5 h-3.5" />
									</button>
								) : null
							}
						/>
					</div>
				</div>

				<div className="space-y-1.5">
					<div className="flex justify-between text-gray-500 text-xs font-medium">
						<span>Subtotal</span>
						<span className="text-brand-tertiary">
							{formatRupiah(summary.grossTotal)}
						</span>
					</div>
					{summary.totalItemDiscount > 0 && (
						<div className="flex justify-between text-red-500 text-xs font-medium">
							<span>Hemat (Item)</span>
							<span>- {formatRupiah(summary.totalItemDiscount)}</span>
						</div>
					)}
					<div className="flex justify-between text-gray-500 text-xs font-medium">
						<span>Pajak</span>
						<span className="text-gray-900">{formatRupiah(summary.tax)}</span>
					</div>
					{voucherDiscount > 0 && (
						<div className="flex justify-between text-red-500 text-xs font-medium">
							<span>Voucher (Global)</span>
							<span>- {formatRupiah(voucherDiscount)}</span>
						</div>
					)}
				</div>

				<div className="pt-3 border-t border-dashed border-gray-200 flex justify-between items-end">
					<span className="text-xs font-bold text-brand-tertiary uppercase">
						Total
					</span>
					<span className="text-2xl font-extrabold text-brand-tertiary leading-none">
						{formatRupiah(summary.total)}
					</span>
				</div>

				<Button
					onClick={onCheckout}
					disabled={cart.length === 0}
					className="w-full py-3.5 text-sm shadow-lg shadow-brand-primary/20"
					fullWidth
				>
					Proses Pembayaran
				</Button>
			</div>
		</div>
	);
};

export default CartSidebar;
