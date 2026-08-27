import React from "react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Area,
    AreaChart,
    ReferenceLine,
} from "recharts";
import { formatCurrency, formatCompactCurrency } from "@/utils/format";
import { id } from "date-fns/locale";
import { format } from "date-fns";
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import type { SalesChartDataPoint } from "@/hooks/charts/useSalesMetrics";

export interface AreaLineChartProps {
    data: SalesChartDataPoint[];
}

export const AreaLineChart: React.FC<AreaLineChartProps> = ({ data }) => {
    const chartConfig = {
        total: {
            label: "Total",
            color: "var(--color-brand)",
        },
    } satisfies ChartConfig;

    return (
        <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart
                data={data}
                margin={{
                    top: 10,
                    right: 0,
                    left: 0,
                    bottom: 0,
                }}
            >
                <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                />
                <XAxis
                    dataKey="formattedDate"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    dy={10}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    tickFormatter={formatCompactCurrency}
                />
                <ReferenceLine 
                    x={format(new Date(), "d MMM", { locale: id })} 
                    stroke="#0ea5e9" 
                    strokeDasharray="3 3"
                    label={{ 
                        value: 'Hari Ini', 
                        position: 'top', 
                        fill: '#0284c7', 
                        fontSize: 10,
                        fontWeight: 'bold'
                    }} 
                />
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            formatter={(value) => (
                                <div className="flex items-center gap-2">
                                    <div className="h-2.5 w-2.5 rounded-[2px] bg-[var(--color-brand)]" />
                                    <span className="text-muted-foreground">Total:</span>
                                    <span className="font-mono font-medium text-foreground">
                                        {formatCurrency(Number(value || 0))}
                                    </span>
                                </div>
                            )}
                        />
                    }
                />
                <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                    activeDot={{ r: 6, strokeWidth: 0 }}
                />
            </AreaChart>
        </ChartContainer>
    );
};
