import { useState, useMemo } from "react";
import type { Product } from "@/types";

export type FilterType = "ALL" | "PRODUCT" | "SERVICE";

export const useProductFilter = (products: Product[]) => {
	const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
	const [selectedGrade, setSelectedGrade] = useState<string>("");
	const [selectedSize, setSelectedSize] = useState<string>("");
	const [isAvailableOnly, setIsAvailableOnly] = useState<boolean>(false);

	// Extract unique grades and sizes
	const uniqueGrades = useMemo(() => {
		const grades = products.map((p) => p.grade).filter((g): g is string => !!g);
		return Array.from(new Set(grades)).sort();
	}, [products]);

	const uniqueSizes = useMemo(() => {
		const sizes = products.map((p) => p.size).filter((s): s is string => !!s);
		return Array.from(new Set(sizes)).sort();
	}, [products]);

	/**
	 * A product is treated as "stok habis" (out of stock) when it is a real
	 * product (not a service, not pre-order/non-stock) with zero available stock.
	 * Consistent with the "Stok Habis" badge logic in ProductCard.
	 */
	const isOutOfStock = (p: Product): boolean => {
		const isService = p.type === "SERVICE";
		const isNonStock = p.is_non_stock === "2" || (p as Product & { isNonStock?: boolean }).isNonStock;
		const stock = p.stock || 0;
		return !isService && !isNonStock && stock <= 0;
	};

	const filteredData = useMemo(() => {
		let data = products;

		// 1. Primary Filter (Type)
		if (activeFilter !== "ALL") {
			data = data.filter((p) => p.type === activeFilter);
		}

		// Filter hidden products
		data = data.filter((p) => p.isShow !== false);

		// 2. Secondary Filters
		if (selectedGrade) {
			data = data.filter((p) => p.grade === selectedGrade);
		}

		if (selectedSize) {
			data = data.filter((p) => p.size === selectedSize);
		}

		return data;
	}, [products, activeFilter, selectedGrade, selectedSize]);

	/**
	 * Products that are currently available (in stock): excludes out-of-stock
	 * products. Pre-order/non-stock items are kept here.
	 */
	const availableData = useMemo(() => {
		return filteredData.filter((p) => !isOutOfStock(p));
	}, [filteredData]);

	/**
	 * Out-of-stock products, shown in a separate section.
	 * Hidden entirely when "Tersedia Saja" is active.
	 */
	const outOfStockData = useMemo(() => {
		if (isAvailableOnly) return [];
		return filteredData.filter((p) => isOutOfStock(p));
	}, [filteredData, isAvailableOnly]);

	const clearFilters = () => {
		setSelectedGrade("");
		setSelectedSize("");
		setIsAvailableOnly(false);
	};

	const hasActiveSecondaryFilters =
		!!selectedGrade || !!selectedSize || isAvailableOnly;

	return {
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
		filteredData,
		availableData,
		outOfStockData,
		clearFilters,
		hasActiveSecondaryFilters,
	};
};
