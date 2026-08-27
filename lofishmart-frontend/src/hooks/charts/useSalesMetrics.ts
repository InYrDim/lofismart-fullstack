import { useMemo } from "react";
import { format, parseISO, subDays } from "date-fns";
import { id } from "date-fns/locale";
import type { Transaction } from "@/types";

export interface SalesChartDataPoint {
    date: string;
    total: number | null;
    formattedDate: string;
}

export function useSalesMetrics(
    data: Transaction[],
    isRestricted: boolean = false,
    filterType?: string,
    startDate?: string,
    endDate?: string
) {
    return useMemo(() => {
        let result: SalesChartDataPoint[] = [];
        let totalSales = 0;

        const today = new Date();

        if (isRestricted || filterType === "today") {
            // Group by Hour (00 - 23)
            const hours = Array.from({ length: 24 }, (_, i) => {
                return {
                    hour: i,
                    total: 0,
                    label: `${String(i).padStart(2, "0")}:00`,
                };
            });

            data.forEach((trx) => {
                const date = parseISO(trx.transaction_date);
                const hour = date.getHours();
                if (hours[hour]) {
                    hours[hour].total += trx.total_price;
                }
            });

            result = hours.map((h) => ({
                date: String(h.hour),
                total: h.total,
                formattedDate: h.label,
            }));
        } else if (filterType === "week" || filterType === "month" || filterType === "all") {
            // Group by Date (YYYY-MM-DD)
            const groupedData: Record<string, number | null> = {};
            
            let effectiveStart = startDate;
            const todayMidnight = new Date();
            todayMidnight.setHours(0, 0, 0, 0);

            if (filterType === "all") {
                if (data.length > 0) {
                    // Find actual earliest transaction date
                    const dates = data.map(t => t.transaction_date.split('T')[0]);
                    effectiveStart = dates.reduce((a, b) => a < b ? a : b);
                } else {
                    // Fallback if no data: last 30 days
                    effectiveStart = format(subDays(todayMidnight, 30), "yyyy-MM-dd");
                }
            }

            // If we have startDate and endDate, initialize all days in between to 0 (or null if future)
            if (effectiveStart && endDate) {
                const start = new Date(effectiveStart);
                const end = new Date(endDate);
                const current = new Date(start);
                const todayStr = format(new Date(), "yyyy-MM-dd");
                
                while (current <= end) {
                    const dateStr = format(current, "yyyy-MM-dd");
                    const isFuture = dateStr > todayStr;
                    groupedData[dateStr] = isFuture ? null : 0;
                    current.setDate(current.getDate() + 1);
                }
            }

            data.forEach((trx) => {
                const date = trx.transaction_date.split("T")[0]; // YYYY-MM-DD
                // Only count if it's within our prepared range or if we didn't have a range
                // And ensure we don't overwrite null (future) with values, though there shouldn't be future transactions
                if (groupedData[date] !== undefined || !startDate) {
                    groupedData[date] = ((groupedData[date] as number) || 0) + trx.total_price;
                }
            });

            result = Object.entries(groupedData)
                .map(([date, total]) => ({
                    date,
                    total,
                    formattedDate: format(parseISO(date), "d MMM", { locale: id }),
                }))
                .sort((a, b) => a.date.localeCompare(b.date));
        } else if (filterType === "year") {
            // Group by Month (0-11)
            const months = Array.from({ length: 12 }, (_, i) => {
                const date = new Date(today.getFullYear(), i, 1);
                return {
                    month: i,
                    total: 0,
                    label: format(date, "MMM", { locale: id }),
                };
            });

            data.forEach((trx) => {
                const date = parseISO(trx.transaction_date);
                const month = date.getMonth();
                if (months[month]) {
                    months[month].total += trx.total_price;
                }
            });

            result = months.map((m) => ({
                date: String(m.month),
                total: m.total,
                formattedDate: m.label,
            }));
        } else {
            // Default / All
            const groupedData: Record<string, number> = {};
            data.forEach((trx) => {
                const date = trx.transaction_date.split("T")[0];
                if (!groupedData[date]) groupedData[date] = 0;
                groupedData[date] += trx.total_price;
            });
            result = Object.entries(groupedData)
                .map(([date, total]) => ({
                    date,
                    total,
                    formattedDate: format(parseISO(date), "d MMM", { locale: id }),
                }))
                .sort((a, b) => a.date.localeCompare(b.date));
        }

        totalSales = result.reduce((acc, curr) => acc + (curr.total || 0), 0);

        return { chartData: result, totalSales };
    }, [data, isRestricted, filterType, startDate, endDate]);
}
