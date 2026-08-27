import { useMemo } from "react";
import type { Transaction } from "@/types";

export interface MarketSalesDataPoint {
    name: string;
    total: number;
}

export function useMarketSalesMetrics(
    data: Transaction[],
    metric: "revenue" | "count"
) {
    return useMemo(() => {
        const groupedData: Record<string, number> = {};

        data.forEach((trx) => {
            const marketName = trx.market_name || "Unknown";
            if (!groupedData[marketName]) {
                groupedData[marketName] = 0;
            }
            if (metric === "revenue") {
                groupedData[marketName] += trx.total_price;
            } else {
                groupedData[marketName] += 1; // Count transactions
            }
        });

        return Object.entries(groupedData)
            .map(([name, total]) => ({
                name,
                total,
            }))
            .sort((a, b) => b.total - a.total); // Sort by highest
    }, [data, metric]);
}
