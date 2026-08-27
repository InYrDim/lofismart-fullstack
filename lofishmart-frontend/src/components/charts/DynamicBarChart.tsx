import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Cell,
} from "recharts";
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

interface DynamicBarChartProps {
    data: any[];
    config: ChartConfig;
    dataKey: string;
    nameKey: string;
    yAxisFormatter?: (value: any) => string;
    tooltipFormatter?: (value: any, name: any, item: any) => React.ReactNode;
}

export const DynamicBarChart: React.FC<DynamicBarChartProps> = ({
    data,
    config,
    dataKey,
    nameKey,
    yAxisFormatter,
    tooltipFormatter,
}) => {
    // Extract colors from config to use for Cell filling if config is mapping nameKey directly.
    // Since the config keys correspond to the 'nameKey' values (e.g. Market A),
    // we map them for individual cells.
    return (
        <ChartContainer config={config} className="h-full w-full">
            <BarChart
                data={data}
                margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                    dataKey={nameKey}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    dy={10}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    tickFormatter={yAxisFormatter}
                />
                <ChartTooltip
                    content={
                        <ChartTooltipContent formatter={tooltipFormatter} />
                    }
                    cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                />
                <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => {
                        const key = entry[nameKey];
                        const cellColor =
                            config[key]?.color || "var(--color-primary)";
                        return <Cell key={`cell-${index}`} fill={cellColor} />;
                    })}
                </Bar>
            </BarChart>
        </ChartContainer>
    );
};
