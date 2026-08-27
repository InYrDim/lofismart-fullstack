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
	ChartLegend,
	ChartLegendContent,
} from "@/components/ui/chart";

interface PaymentStatusChartProps {
	data: Transaction[];
}

export const PaymentStatusChart: React.FC<PaymentStatusChartProps> = ({
	data,
}) => {
	const chartData = useMemo(() => {
		// Group transactions by date and status
		const groupedData: Record<
			string,
			{ overview: number; unpaid: number; paid: number }
		> = {};

		data.forEach((trx) => {
			const date = trx.transaction_date.split("T")[0]; // YYYY-MM-DD
			if (!groupedData[date]) {
				groupedData[date] = { overview: 0, unpaid: 0, paid: 0 };
			}

			// Status mapping: 1=Overview, 2=Unpaid, 3=Paid
			if (trx.is_paid === "1") {
				groupedData[date].overview += 1;
			} else if (trx.is_paid === "2") {
				groupedData[date].unpaid += 1;
			} else if (trx.is_paid === "3") {
				groupedData[date].paid += 1;
			}
		});

		// Convert to array and sort by date
		return Object.entries(groupedData)
			.map(([date, counts]) => ({
				date,
				...counts,
				formattedDate: format(parseISO(date), "d MMM", { locale: id }),
			}))
			.sort((a, b) => a.date.localeCompare(b.date));
	}, [data]);

	if (data.length === 0) {
		return (
			<div className="flex h-64 items-center justify-center bg-gray-50 rounded-xl border border-gray-100 border-dashed">
				<p className="text-gray-400">Tidak ada data status pembayaran</p>
			</div>
		);
	}

	return (
		<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
			<div className="mb-6">
				<h3 className="text-gray-900 text-lg font-bold mb-1">
					Status Pembayaran
				</h3>
				<p className="text-gray-500 text-sm">Overview vs Unpaid vs Paid</p>
			</div>

			<div className="h-72 w-full">
				<ChartContainer
					config={{
						overview: { label: "Overview", color: "#3b82f6" },
						unpaid: { label: "Unpaid", color: "#ef4444" },
						paid: { label: "Paid", color: "#22c55e" },
					} satisfies ChartConfig}
					className="h-full w-full"
				>
					<LineChart
						data={chartData}
						margin={{
							top: 10,
							right: 10,
							left: 0,
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
						/>
						<YAxis
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#9ca3af", fontSize: 12 }}
						/>
						<ChartTooltip content={<ChartTooltipContent />} />
						<ChartLegend content={<ChartLegendContent />} />
						<Line
							type="monotone"
							dataKey="overview"
							name="overview"
							stroke="var(--color-overview)"
							strokeWidth={2}
							dot={{ r: 3, strokeWidth: 0, fill: "var(--color-overview)" }}
							activeDot={{ r: 6, strokeWidth: 0 }}
						/>
						<Line
							type="monotone"
							dataKey="unpaid"
							name="unpaid"
							stroke="var(--color-unpaid)"
							strokeWidth={2}
							dot={{ r: 3, strokeWidth: 0, fill: "var(--color-unpaid)" }}
							activeDot={{ r: 6, strokeWidth: 0 }}
						/>
						<Line
							type="monotone"
							dataKey="paid"
							name="paid"
							stroke="var(--color-paid)"
							strokeWidth={2}
							dot={{ r: 3, strokeWidth: 0, fill: "var(--color-paid)" }}
							activeDot={{ r: 6, strokeWidth: 0 }}
						/>
					</LineChart>
				</ChartContainer>
			</div>
		</div>
	);
};
