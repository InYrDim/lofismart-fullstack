import React, { useState } from "react";
import type { Transaction } from "@/types";
import { formatCompactCurrency, formatCurrency } from "@/utils/format";
import { Select } from "@/components/ui/select";
import { useMarketSalesMetrics } from "@/hooks/charts/useMarketSalesMetrics";
import { DynamicBarChart } from "@/components/charts/DynamicBarChart";
import { type ChartConfig } from "@/components/ui/chart";

const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#6366f1",
];

interface MarketSalesWidgetProps {
    data: Transaction[];
    filterType?: string;
    onFilterChange?: (value: string | number) => void;
}

export const MarketSalesWidget: React.FC<MarketSalesWidgetProps> = ({
    data,
    filterType,
    onFilterChange,
}) => {
    const [metric, setMetric] = useState<"revenue" | "count">("count");
    const chartData = useMarketSalesMetrics(data, metric);

    const formatValue = (value: number) => {
        if (metric === "revenue") return formatCompactCurrency(value);
        return value.toString();
    };

    const formatTooltip = (value: number) => {
        if (metric === "revenue") return formatCurrency(value);
        return `${value} Transaksi`;
    };

    if (data.length === 0) {
        return (
            <div className="flex flex-col h-64 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900 text-lg font-bold">
                        Penjualan per Market
                    </h3>
                    {onFilterChange && (
                        <div className="w-32">
                            <Select
                                options={[
                                    { label: "Hari Ini", value: "today" },
                                    { label: "Minggu Ini", value: "week" },
                                    { label: "Bulan Ini", value: "month" },
                                    { label: "Tahun Ini", value: "year" },
                                    { label: "Semua", value: "all" },
                                ]}
                                value={filterType || "month"}
                                onChange={onFilterChange}
                                className="bg-gray-50 border-none text-xs py-1"
                            />
                        </div>
                    )}
                </div>
                <div className="flex-1 flex items-center justify-center border border-gray-100 border-dashed rounded-xl">
                    <p className="text-gray-400">Tidak ada data penjualan per market</p>
                </div>
            </div>
        );
    }

    const chartConfig = chartData.reduce((acc, curr, index) => {
        const color = COLORS[index % COLORS.length];
        acc[curr.name] = {
            label: curr.name,
            color: color,
        };
        return acc;
    }, {} as ChartConfig);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-gray-900 text-lg font-bold mb-1">
                        Penjualan per Market
                    </h3>
                    <p className="text-gray-500 text-sm">
                        {metric === "revenue" ? "Total Pendapatan" : "Jumlah Transaksi"}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-40">
                        <Select
                            options={[
                                { label: "Total Transaksi", value: "count" },
                                { label: "Total Pendapatan", value: "revenue" },
                            ]}
                            value={metric}
                            onChange={(v) => setMetric(v as "revenue" | "count")}
                            className="bg-white text-sm"
                        />
                    </div>
                    {onFilterChange && (
                        <div className="w-32">
                            <Select
                                options={[
                                    { label: "Hari Ini", value: "today" },
                                    { label: "Minggu Ini", value: "week" },
                                    { label: "Bulan Ini", value: "month" },
                                    { label: "Tahun Ini", value: "year" },
                                    { label: "Semua", value: "all" },
                                ]}
                                value={filterType || "month"}
                                onChange={onFilterChange}
                                className="bg-white text-sm"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="h-72 w-full">
                <DynamicBarChart
                    data={chartData}
                    config={chartConfig}
                    dataKey="total"
                    nameKey="name"
                    yAxisFormatter={formatValue}
                    tooltipFormatter={(value, _, item) => {
                        const color = item.payload.fill || item.color;
                        return (
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-2.5 w-2.5 rounded-[2px]"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="text-muted-foreground">
                                    {metric === "revenue" ? "Total:" : "Jumlah:"}
                                </span>
                                <span className="font-mono font-medium text-foreground">
                                    {formatTooltip(Number(value || 0))}
                                </span>
                            </div>
                        );
                    }}
                />
            </div>
        </div>
    );
};
