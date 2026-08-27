import React from "react";
import type { Transaction } from "@/types";
import { formatCompactCurrency } from "@/utils/format";
import { useTopCashierMetrics } from "@/hooks/charts/useTopCashierMetrics";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";

interface TopCashierWidgetProps {
    data: Transaction[];
}

export const TopCashierWidget: React.FC<TopCashierWidgetProps> = ({ data }) => {
    const chartData = useTopCashierMetrics(data);

    if (data.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                <p className="text-gray-400">Tidak ada data kasir</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="mb-6">
                <h3 className="text-gray-900 text-lg font-bold mb-1">Top Kasir</h3>
                <p className="text-gray-500 text-sm">
                    Ranking kasir berdasarkan jumlah transaksi
                </p>
            </div>

            <div className="h-72 w-full">
                <HorizontalBarChart
                    data={chartData}
                    config={{
                        count: {
                            label: "Jumlah Transaksi",
                            color: "#6366f1",
                        },
                    } satisfies import("../ui/chart").ChartConfig}
                    dataKey="count"
                    nameKey="name"
                    tooltipFormatter={(value, name) => {
                        if (name === "count") return [`${value} Transaksi`, "Jumlah"];
                        if (name === "revenue")
                            return [
                                formatCompactCurrency(Number(value || 0)),
                                "Pendapatan",
                            ];
                        return [value as string, name];
                    }}
                />
            </div>
        </div>
    );
};
