import { useMemo } from "react";
import type { Transaction } from "@/types";

export interface TopCashierDataPoint {
    name: string;
    count: number;
    revenue: number;
}

export function useTopCashierMetrics(data: Transaction[]) {
    return useMemo(() => {
        const grouped: Record<string, { count: number; revenue: number }> = {};

        data.forEach((trx) => {
            const name = trx.cashier_name || "Unknown";
            if (!grouped[name]) grouped[name] = { count: 0, revenue: 0 };
            grouped[name].count += 1;
            grouped[name].revenue += trx.total_price;
        });

        return Object.entries(grouped)
            .map(([name, stats]) => ({
                name,
                count: stats.count,
                revenue: stats.revenue,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Top 10
    }, [data]);
}
