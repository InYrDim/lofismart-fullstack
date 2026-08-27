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

interface PaymentRatioChartProps {
	data: Transaction[];
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
	"3": { label: "Lunas", color: "#22c55e" },
	"2": { label: "Belum Bayar", color: "#ef4444" },
	"1": { label: "Overview", color: "#f59e0b" },
};

export const PaymentRatioChart: React.FC<PaymentRatioChartProps> = ({
	data,
}) => {
	const chartData = useMemo(() => {
		const grouped: Record<string, number> = {};

		data.forEach((trx) => {
			const status = trx.is_paid || "0";
			const label = STATUS_MAP[status]?.label || "Lainnya";
			if (!grouped[label]) grouped[label] = 0;
			grouped[label] += 1;
		});

		return Object.entries(grouped).map(([name, value]) => ({
			name,
			value,
		}));
	}, [data]);

	const total = data.length;
	const lunas = chartData.find((d) => d.name === "Lunas")?.value || 0;
	const percentage = total > 0 ? ((lunas / total) * 100).toFixed(1) : "0";

	if (data.length === 0) {
		return (
			<div className="flex h-64 items-center justify-center bg-gray-50 rounded-xl border border-gray-100 border-dashed">
				<p className="text-gray-400">Tidak ada data rasio pembayaran</p>
			</div>
		);
	}

	const getColor = (name: string) => {
		const entry = Object.values(STATUS_MAP).find((s) => s.label === name);
		return entry?.color || "#94a3b8";
	};

	return (
		<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
			<div className="mb-4">
				<h3 className="text-gray-900 text-lg font-bold mb-1">
					Rasio Pembayaran
				</h3>
				<p className="text-gray-500 text-sm">Lunas vs Belum Bayar</p>
			</div>

			<div className="h-72 w-full relative">
				<ChartContainer
					config={Object.entries(STATUS_MAP).reduce((acc, [_, config]) => {
						acc[config.label] = {
							label: config.label,
							color: config.color,
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
								<Cell key={`cell-${index}`} fill={getColor(entry.name)} />
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
				{/* Center label */}
				<div
					className="absolute inset-0 flex items-center justify-center pointer-events-none"
					style={{ marginBottom: "30px" }}
				>
					<div className="text-center">
						<p className="text-2xl font-bold text-gray-900">{percentage}%</p>
						<p className="text-xs text-gray-500">Lunas</p>
					</div>
				</div>
			</div>
		</div>
	);
};
