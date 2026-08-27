import { useState } from "react";
import { useStorage } from "./useStorage";
import {
	VoucherService,
	type VoucherConfig,
	type VoucherType,
} from "@/services/voucher.service.ts";
import type { CartItem } from "@/types";

// 1. Interface for the Resulting Strategy (used by useCart)
export type VoucherStrategy = {
	calculateGlobalDiscount?: (cart: CartItem[]) => number;
	calculateItemDiscount?: (
		item: CartItem,
		price: number,
		qty: number
	) => number;
};

// 2. Strategy Implementation Registry
const STRATEGIES: Record<
	VoucherType,
	(config: VoucherConfig) => VoucherStrategy
> = {
	PERCENTAGE: (config) => ({
		calculateItemDiscount: (_item, price, qty) => price * qty * config.value,
	}),
	FIXED_CUT: (config) => ({
		calculateItemDiscount: (_item, price, qty) =>
			Math.min(price * qty, config.value * qty),
	}),
	NAME_CONTAINS_PERCENTAGE: (config) => ({
		calculateItemDiscount: (item, price, qty) => {
			if (!config.target) return 0;
			return item.name.toUpperCase().includes(config.target.toUpperCase())
				? price * qty * config.value
				: 0;
		},
	}),
	GLOBAL_FIXED: (config) => ({
		calculateGlobalDiscount: () => config.value,
	}),
};

export const useVoucher = () => {
	const [activeVoucher, setActiveVoucher] = useStorage<string>(
		"lofish_active_voucher",
		""
	);
	// Store the full config to avoid refetching on every render
	const [activeConfig, setActiveConfig] = useStorage<VoucherConfig | null>(
		"lofish_active_voucher_config",
		null
	);
	const [globalDiscount, setGlobalDiscount] = useStorage<number>(
		"lofish_voucher_discount",
		0
	);

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const checkVoucher = async (code: string) => {
		setIsLoading(true);
		setError(null);
		try {
			const config = await VoucherService.getVoucher(code);
			if (config) {
				setActiveVoucher(config.key);
				setActiveConfig(config);
				return config;
			} else {
				setError("Voucher tidak ditemukan");
				return null;
			}
		} catch (err) {
			setError("Gagal memvalidasi voucher");
			console.error(err);
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	const clearVoucher = () => {
		setActiveVoucher("");
		setActiveConfig(null);
		setGlobalDiscount(0);
		setError(null);
	};

	const getStrategy = (): VoucherStrategy | undefined => {
		if (!activeConfig) return undefined;

		// Factory: Create strategy based on type
		const strategyFactory = STRATEGIES[activeConfig.type];
		return strategyFactory ? strategyFactory(activeConfig) : undefined;
	};

	return {
		activeVoucher,
		activeConfig,
		globalDiscount,
		setGlobalDiscount,
		getStrategy, // Look up strategy from stored config
		checkVoucher, // New Async Function
		clearVoucher,
		isLoading,
		error,
	};
};
