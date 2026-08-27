import React from "react";
import { Package, Sparkles, AlertTriangle } from "lucide-react";
import type { Product, CartItem } from "@/types";
import ProductCard from "./ui/cards/ProductCard";
import { Button } from "./ui/button";
import { Select } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { useProductFilter } from "@/hooks/useProductFilter";

interface ProductCatalogProps {
	products: Product[];
	cart: CartItem[];
	onAddToCart: (product: Product) => void;
	onUpdateQuantity: (cartId: string, delta: number) => void;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({
	products,
	cart,
	onAddToCart,
	onUpdateQuantity,
}) => {
	const {
		activeFilter,
		setActiveFilter,
		selectedGrade,
		setSelectedGrade,
		selectedSize,
		setSelectedSize,
		isAvailableOnly,
		setIsAvailableOnly,
		uniqueGrades,
		uniqueSizes,
		availableData,
		outOfStockData,
		clearFilters,
		hasActiveSecondaryFilters,
	} = useProductFilter(products);

	function renderProductCard(product: Product) {
		const qty = cart
			.filter(
				(item) => item.id === product.id && item.source === "manual"
			)
			.reduce((sum, item) => sum + item.qty, 0);

		const serialQty = cart
			.filter(
				(item) => item.id === product.id && item.source === "serial"
			)
			.reduce((sum, item) => sum + item.qty, 0);

		const reservedWeight = cart
			.filter((item) => item.id === product.id)
			.reduce(
				(sum, item) => sum + (item.measuredWeight || 1) * item.qty,
				0
			);

		return (
			<ProductCard
				key={product.id}
				product={product}
				qty={qty}
				serialQty={serialQty}
				reservedWeight={reservedWeight}
				onAdd={() => onAddToCart(product)}
				onUpdateQty={(delta) => {
					const manualItem = cart.find(
						(item) => item.id === product.id && item.source === "manual"
					);
					if (manualItem) {
						onUpdateQuantity(manualItem.cartId, delta);
					}
				}}
			/>
		);
	}

	function renderSelectFilter() {
		return (
			<>
				{/* Grade Filter */}
				<div className="w-[150px]">
					<Select
						value={selectedGrade || "all"}
						onChange={(val) => setSelectedGrade(val === "all" ? "" : String(val))}
						options={[
							{ value: "all", label: "Semua Grade" },
							...uniqueGrades.map((g) => ({ value: g, label: g })),
						]}
						placeholder="Semua Grade"
						className="h-9 py-1"
					/>
				</div>

				{/* Size Filter */}
				<div className="w-[150px]">
					<Select
						value={selectedSize || "all"}
						onChange={(val) => setSelectedSize(val === "all" ? "" : String(val))}
						options={[
							{ value: "all", label: "Semua Ukuran" },
							...uniqueSizes.map((s) => ({ value: s, label: s })),
						]}
						placeholder="Semua Ukuran"
						className="h-9 py-1"
					/>
				</div>
			</>
		)
	}

	function renderFilter() {
		return <div className="px-6 pb-4 shrink-0 mt-2 flex flex-col gap-3">
			{/* Primary Tabs */}
			<div className="flex gap-2">
				<Button
					onClick={() => setActiveFilter("ALL")}
					variant={activeFilter === "ALL" ? "primary" : "secondary"}
					size="sm"
					className={activeFilter === "ALL" ? "bg-gray-800" : "bg-white"}
				>
					Semua
				</Button>
				<Button
					onClick={() => setActiveFilter("PRODUCT")}
					variant={activeFilter === "PRODUCT" ? "primary" : "secondary"}
					size="sm"
					className={activeFilter === "PRODUCT" ? "" : "bg-white"}
				>
					<Package className="w-4 h-4 mr-2" />
					Produk
				</Button>
				<Button
					onClick={() => setActiveFilter("SERVICE")}
					variant={activeFilter === "SERVICE" ? "primary" : "secondary"}
					size="sm"
					className={
						activeFilter === "SERVICE" ? "bg-brand-secondary" : "bg-white"
					}
				>
					<Sparkles className="w-4 h-4 mr-2" />
					Layanan
				</Button>
			</div>

			{/* Secondary Filters */}
			<div className="flex items-center gap-3">
				{/* Grade Filter */}
				{renderSelectFilter()}

				{/* Availability Toggle */}
				<div className="h-9 flex items-center gap-2 px-2">
					<Checkbox
						id="available-only"
						checked={isAvailableOnly}
						onCheckedChange={(checked) => setIsAvailableOnly(checked === true)}
					/>
					<label
						htmlFor="available-only"
						className="text-sm font-medium leading-none whitespace-nowrap peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-text-primary"
					>
						Tersedia Saja
					</label>
				</div>

				{/* Clear Button */}
				{hasActiveSecondaryFilters && (
					<button
						onClick={clearFilters}
						className="text-xs text-red-500 hover:underline font-medium ml-auto"
					>
						Reset Filter
					</button>
				)}
			</div>
		</div>
	}

	return (
		<div className="flex-1 flex flex-col overflow-hidden">
			{/* Filter Tabs */}
			{renderFilter()}

			{/* Product Grid */}
			<div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-thin scrollbar-thumb-gray-300">
				{/* Available Products Section */}
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
					{availableData.map((product) => renderProductCard(product))}
				</div>

				{/* Out of Stock Section */}
				{outOfStockData.length > 0 && (
					<>
						<div className="flex items-center gap-2 mt-8 mb-3">
							<AlertTriangle className="w-4 h-4 text-red-500" />
							<h2 className="text-sm font-semibold text-gray-700">
								Stok Habis
							</h2>
							<span className="text-xs text-gray-400">
								({outOfStockData.length})
							</span>
							<div className="flex-1 h-px bg-gray-200" />
						</div>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 opacity-80">
							{outOfStockData.map((product) => renderProductCard(product))}
						</div>
					</>
				)}

				{availableData.length === 0 && outOfStockData.length === 0 && (
					<div className="flex flex-col items-center justify-center h-40 text-gray-400">
						<p>Tidak ada item ditemukan untuk filter ini.</p>
						<button
							onClick={clearFilters}
							className="mt-2 text-brand-primary font-medium text-sm hover:underline"
						>
							Hapus Filter
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default ProductCatalog;
