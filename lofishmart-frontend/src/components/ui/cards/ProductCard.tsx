import { Plus, Minus, ShoppingCart, Scale } from "lucide-react";
import type { Product } from "@/types";
import { Card } from "./Card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { SizeBadge } from "@/components/ui/badges/SizeBadge";
import { GradeBadge } from "@/components/ui/badges/GradeBadge";
import { ProductImage } from "@/components/ui/ProductImage";
import { formatQty } from "@/utils/format";

interface ProductCardProps {
	product: Product;
	qty: number;
	serialQty?: number;
	reservedWeight?: number;
	onAdd: (product: Product) => void;
	onUpdateQty: (delta: number) => void;
	onRemove?: (productId: string) => void;
}

export default function ProductCard({
	product,
	qty,
	serialQty = 0,
	reservedWeight = 0,
	onAdd,
	onUpdateQty,
}: ProductCardProps) {

	const isService = product.type === "SERVICE";
	const isNonStock = product.is_non_stock === "2" || product.isNonStock;
	const totalStock = product.stock || 0;
	const availableStock = Math.max(0, totalStock - reservedWeight);
	const hasStock = isService || isNonStock || availableStock > 0;

	const getStockBadge = () => {
		if (isService) {
			return <Badge variant="secondary">Layanan</Badge>;
		}

		if (isNonStock) {
			return <Badge variant="outline">Pre-order</Badge>;
		}

		const stockDisplay = `${formatQty(availableStock)} ${product.unit === "PCS" ? "PCS" : "KG"}`;

		if (reservedWeight > 0) {
			const totalDisplay = `${formatQty(totalStock)} ${product.unit === "PCS" ? "PCS" : "KG"}`;
			const reservedDisplay = `${formatQty(reservedWeight)} ${product.unit === "PCS" ? "PCS" : "KG"}`;

			if (availableStock > 0) {
				return (
					<Badge variant="success">
						{stockDisplay} <span className="text-xs opacity-60">({totalDisplay} - {reservedDisplay})</span>
					</Badge>
				);
			}
		}

		if (availableStock > 0) {
			return (
				<Badge variant="success">
					{stockDisplay}
				</Badge>
			);
		}

		return <Badge variant="destructive">Stok Habis</Badge>;
	};

	return (
		<Card className="flex flex-col gap-2 p-3 hover:shadow-md transition-all duration-300 group justify-between h-full">
			{/* Image Section */}
			<div className="relative w-full aspect-square">
				{/* Badge Qty di Keranjang */}
				{qty > 0 && (
					<Badge
						className="absolute top-2 right-2 px-2 py-1 text-[10px] backdrop-blur-sm z-10 flex items-center gap-1 shadow-sm"
						variant="default"
					>
						{formatQty(qty)} <ShoppingCart className="w-3 h-3" />
					</Badge>
				)}

				{/* Badge Serial Qty */}
				{serialQty > 0 && (
					<Tooltip content="berat produk" position="right">
						<Badge
							className="absolute top-2 left-2 px-2 py-1 text-[10px] backdrop-blur-sm z-10 flex items-center gap-1 shadow-sm"
							variant="secondary"
						>
							<Scale className="w-3 h-3" /> {serialQty}
						</Badge>
					</Tooltip>
				)}

				<ProductImage
					src={!hasStock ? "/default_product_stok_empty.jpg" : product.image}
					alt={product.name}
					className="group-hover:scale-105 transition-transform duration-500"
				>
					<div className="absolute inset-0 bg-linear-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
				</ProductImage>
			</div>

			<div className="flex flex-1 flex-col gap-1 justify-between">
				<div className="flex flex-1 flex-col gap-1">
					{/* Product Name */}
					<h3
						className="text-brand-tertiary text-sm font-semibold leading-tight truncate"
						title={product.name}
					>
						{product.name}
					</h3>


					{/* Size & Grade Subtitles */}
					{(product.size || product.grade) && (
						<div className="flex gap-2 text-[10px] text-gray-500 font-medium leading-none">
							{product.size && <SizeBadge sizeName={product.size} />}
							{product.grade && <GradeBadge gradeName={product.grade} showTooltip={true} />}
						</div>
					)}

					<div className="flex items-center justify-between">
						<p className="text-gray-600 text-xs font-medium leading-normal">
							Rp{" "}
							{product.hasVariants && product.variants
								? product.variants[0].price.toLocaleString("id-ID")
								: product.basePrice.toLocaleString("id-ID")}
						</p>
					</div>

					<div className="flex items-center justify-between text-[10px] text-gray-500 mt-0.5">
						<span
							className={`font-medium ${hasStock
								? "text-green-600"
								: "text-red-600"
								}`}
						>
							{getStockBadge()}
						</span>
					</div>


				</div>

				<Badge className="bg-black w-full rounded text-md">{product.barcode}</Badge>

				{/* Action Buttons */}
				<div className="flex items-center justify-between gap-2 border-t border-gray-50">
					{!hasStock ? (
						<Button
							disabled
							variant="secondary"
							size="sm"
							className="w-full text-xs h-9"
						>
							Stok Habis
						</Button>
					) : qty > 0 ? (
						<>
							<Button
								onClick={(e) => {
									e.stopPropagation();
									onUpdateQty(-1);
								}}
								variant="secondary"
								size="sm"
								className="h-8 w-8 p-0!"
							>
								<Minus className="w-4 h-4" />
							</Button>
							<span className="text-sm font-bold text-gray-900 min-w-[40px] text-center">
								{formatQty(qty)}
							</span>
							<Button
								onClick={(e) => {
									e.stopPropagation();
									onUpdateQty(1);
								}}
								size="sm"
								className="h-8 w-8 p-0!"
							>
								<Plus className="w-4 h-4" />
							</Button>
						</>
					) : (
						<Button
							onClick={() => onAdd(product)}
							variant="outline-primary"
							size="sm"
							className="w-full h-9 text-xs gap-1 border-brand-primary/20 hover:border-brand-primary bg-brand-primary/10 hover:bg-brand-primary! hover:text-white"
						>
							<Plus className="w-3.5 h-3.5" /> Tambah
						</Button>
					)}
				</div>
			</div>
		</Card>
	);
}
