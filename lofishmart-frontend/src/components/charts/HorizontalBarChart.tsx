import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

interface HorizontalBarChartProps {
    data: any[];
    config: ChartConfig;
    dataKey: string;
    nameKey: string;
    xAxisFormatter?: (value: any) => string;
    yAxisFormatter?: (value: any) => string;
    tooltipFormatter?: (value: any, name: any, item: any) => React.ReactNode;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
    data,
    config,
    dataKey,
    nameKey,
    xAxisFormatter,
    yAxisFormatter,
    tooltipFormatter,
}) => {
    return (
        <ChartContainer config={config} className="h-full w-full">
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#f3f4f6"
                />
                <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    tickFormatter={xAxisFormatter}
                />
                <YAxis
                    type="category"
                    dataKey={nameKey}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }}
                    tickFormatter={yAxisFormatter}
                    width={100}
                />
                <ChartTooltip
                    content={
                        <ChartTooltipContent formatter={tooltipFormatter} />
                    }
                    cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                />
                <Bar
                    dataKey={dataKey}
                    name={dataKey}
                    fill={`var(--color-${dataKey})`}
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                />
            </BarChart>
        </ChartContainer>
    );
};
