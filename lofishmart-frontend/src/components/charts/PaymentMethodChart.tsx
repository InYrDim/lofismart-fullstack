import React, { useMemo } from "react";
import {
	PieChart,
	Pie,
	Cell,
} from "recharts";
import type { Transaction } from "@/types";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
} from "@/components/ui/chart";

interface PaymentMethodChartProps {
	data: Transaction[];
}

const COLORS: Record<string, string> = {
	CASH: "#10b981",
	QRIS: "#3b82f6",
	OTHER: "#f59e0b",
};

const DEFAULT_COLOR = "#94a3b8";

export const PaymentMethodChart: React.FC<PaymentMethodChartProps> = ({
	data,
}) => {
	const chartData = useMemo(() => {
		const grouped: Record<string, number> = {};

		data.forEach((trx) => {
			const method = (trx.payment_method || "Lainnya").toUpperCase();
			if (!grouped[method]) grouped[method] = 0;
			grouped[method] += 1;
		});

		return Object.entries(grouped)
			.map(([name, value]) => ({ name, value }))
			.sort((a, b) => b.value - a.value);
	}, [data]);

	if (data.length === 0) {
		return (
			<div className="flex h-64 items-center justify-center bg-gray-50 rounded-xl border border-gray-100 border-dashed">
				<p className="text-gray-400">Tidak ada data metode pembayaran</p>
			</div>
		);
	}

	return (
		<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
			<div className="mb-4">
				<h3 className="text-gray-900 text-lg font-bold mb-1">
					Metode Pembayaran
				</h3>
				<p className="text-gray-500 text-sm">Distribusi metode pembayaran</p>
			</div>

			<div className="h-72 w-full">
				<ChartContainer
					config={Object.entries(COLORS).reduce((acc, [key, color]) => {
						acc[key] = {
							label: key,
							color: color,
						};
						acc["Lainnya"] = {
							label: "Lainnya",
							color: DEFAULT_COLOR,
						};
						return acc;
					}, {} as ChartConfig)}
					className="h-full w-full mx-auto"
				>
					<PieChart>
						<Pie
							data={chartData}
							cx="50%"
							cy="50%"
							innerRadius={60}
							outerRadius={100}
							paddingAngle={4}
							dataKey="value"
							stroke="none"
						>
							{chartData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={COLORS[entry.name] || DEFAULT_COLOR}
								/>
							))}
						</Pie>
						<ChartTooltip
							content={<ChartTooltipContent nameKey="name" />}
						/>
						<ChartLegend
							content={<ChartLegendContent />}
							className="text-sm mt-4"
						/>
					</PieChart>
				</ChartContainer>
			</div>
		</div>
	);
};
