import React, { useMemo } from "react";
import {
	XAxis,
	YAxis,
	CartesianGrid,
	LineChart,
	Line,
} from "recharts";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import type { Transaction } from "@/types";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

interface OrderTypeChartProps {
	data: Transaction[];
}

export const OrderTypeChart: React.FC<OrderTypeChartProps> = ({ data }) => {
	const chartData = useMemo(() => {
		// Map transactions to chart data points
		return data
			.map((trx) => {
				let typeValue = 0;
				let typeLabel = "";

				// Order Type mapping: 1=Offline, 2=Offline, 3=Other (Inferred from previous logic)
				if (trx.online_order === "1") {
					typeValue = 1;
					typeLabel = "Offline";
				} else if (trx.online_order === "2") {
					typeValue = 2;
					typeLabel = "Online";
				} else {
					typeValue = 3;
					typeLabel = "Lainnya";
				}

				return {
					...trx,
					typeValue,
					typeLabel,
					formattedDate: format(parseISO(trx.transaction_date), "d MMM HH:mm", {
						locale: id,
					}),
					timestamp: new Date(trx.transaction_date).getTime(),
				};
			})
			.sort((a, b) => a.timestamp - b.timestamp);
	}, [data]);

	if (data.length === 0) {
		return (
			<div className="flex h-64 items-center justify-center bg-gray-50 rounded-xl border border-gray-100 border-dashed">
				<p className="text-gray-400">Tidak ada data tipe pesanan</p>
			</div>
		);
	}

	return (
		<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
			<div className="mb-6">
				<h3 className="text-gray-900 text-lg font-bold mb-1">Tipe Pesanan</h3>
				<p className="text-gray-500 text-sm">Offline vs Online vs Lainnya</p>
			</div>

			<div className="h-72 w-full">
				<ChartContainer
					config={{
						typeValue: {
							label: "Tipe Pesanan",
							color: "#f59e0b",
						},
					} satisfies ChartConfig}
					className="h-full w-full"
				>
					<LineChart
						data={chartData}
						margin={{
							top: 10,
							right: 10,
							left: 20,
							bottom: 0,
						}}
					>
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
							minTickGap={30}
						/>
						<YAxis
							type="number"
							domain={[0, 4]}
							ticks={[1, 2, 3]}
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#9ca3af", fontSize: 12 }}
							tickFormatter={(value) => {
								if (value === 1) return "Offline";
								if (value === 2) return "Online";
								if (value === 3) return "Lainnya";
								return "";
							}}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									className="w-[150px]"
									formatter={(value, _, item) => (
										<div className="flex items-center gap-2">
											<div className="h-2.5 w-2.5 rounded-[2px] bg-[var(--color-typeValue)]" />
											<span className="text-muted-foreground">Type:</span>
											<span className="font-mono font-medium text-foreground">
												{item.payload.typeLabel || value}
											</span>
										</div>
									)}
								/>
							}
						/>
						<Line
							type="stepAfter"
							dataKey="typeValue"
							name="Type"
							stroke="#f59e0b"
							strokeWidth={2}
							dot={{ r: 3, strokeWidth: 0, fill: "var(--color-typeValue)" }}
							activeDot={{ r: 6, strokeWidth: 0 }}
						/>
					</LineChart>
				</ChartContainer>
			</div>
		</div>
	);
};
