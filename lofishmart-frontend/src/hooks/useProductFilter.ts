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

		if (isAvailableOnly) {
			data = data.filter((p) => p.is_non_stock !== "2");
		}

		return data;
	}, [products, activeFilter, selectedGrade, selectedSize, isAvailableOnly]);

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
		clearFilters,
		hasActiveSecondaryFilters,
	};
};
