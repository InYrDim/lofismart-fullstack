import React from "react";
import type { Transaction } from "@/types";
import { formatCurrency } from "@/utils/format";
import { useRoleAndPermission } from "@/hooks/useRoleAndPermission";
import { Select } from "@/components/ui/select";
import { useSalesMetrics } from "@/hooks/charts/useSalesMetrics";
import { AreaLineChart } from "@/components/charts/AreaLineChart";

interface SalesWidgetProps {
    data: Transaction[];
    isRestricted?: boolean;
    filterType?: string;
    onFilterChange?: (value: string | number) => void;
    startDate?: string;
    endDate?: string;
}

export const SalesWidget: React.FC<SalesWidgetProps> = ({
    data,
    isRestricted = false,
    filterType,
    onFilterChange,
    startDate,
    endDate,
}) => {
    const { chartData, totalSales } = useSalesMetrics(
        data,
        isRestricted,
        filterType,
        startDate,
        endDate
    );
    const { isAdmin, isManager } = useRoleAndPermission();

    function renderFilterOptions() {
        if ((isAdmin || isManager) && onFilterChange) {
            return (
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
            );
        }
        return null;
    }


    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <div className="flex items-center gap-4 mb-1">
                        <h3 className="text-gray-500 text-sm font-medium">
                            Total Pendapatan
                        </h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(totalSales)}
                    </p>
                </div>

                {renderFilterOptions()}
            </div>

            <div className="h-72 w-full">
                <AreaLineChart data={chartData} />
            </div>
        </div>
    );
};
