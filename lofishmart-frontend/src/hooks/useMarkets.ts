import { useState, useEffect, useCallback } from "react";
import { ProfileService } from "@/services/profile.service";
import type { MarketProfile } from "@/types";

export function useMarkets() {
	const [markets, setMarkets] = useState<MarketProfile[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchMarkets = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await ProfileService.getMarketProfiles();
			setMarkets(data);
		} catch (err) {
			console.error("Failed to load markets", err);
			setError(err instanceof Error ? err : new Error("Failed to load markets"));
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchMarkets();
	}, [fetchMarkets]);

	return {
		markets,
		isLoading,
		error,
		refetch: fetchMarkets,
	};
}
