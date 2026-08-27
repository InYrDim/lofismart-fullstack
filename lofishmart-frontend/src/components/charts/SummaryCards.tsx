import React, { useMemo } from "react";
import {
	TrendingUp,
	ShoppingCart,
	Scale,
	Package,
	DollarSign,
} from "lucide-react";
import type { Transaction } from "@/types";
import { formatCurrency, formatNumber } from "@/utils/format";

interface SummaryCardsProps {
	data: Transaction[];
}

interface CardData {
	label: string;
	value: string;
	icon: React.ElementType;
	color: string;
	bgColor: string;
}

function getAverage(data: Transaction[]) {
	const totalTransactions = data.length;
	const totalRevenue = data.reduce((sum, trx) => sum + trx.total_price, 0);
	const avgTransaction =
		totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
	const totalWeight = data.reduce(
		(sum, trx) => sum + (trx.total_weight_qty || 0),
		0,
	);
	const totalPcs = data.reduce(
		(sum, trx) => sum + (trx.total_pcs_qty || 0),
		0,
	);

	return {
		totalTransactions,
		totalRevenue,
		avgTransaction,
		totalWeight,
		totalPcs,
	};
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ data }) => {
	const stats = useMemo(() => {
		return getAverage(data);
	}, [data]);

	const cards: CardData[] = [
		{
			label: "Total Transaksi",
			value: formatNumber(stats.totalTransactions),
			icon: ShoppingCart,
			color: "text-blue-600",
			bgColor: "bg-blue-50",
		},
		{
			label: "Total Pendapatan",
			value: formatCurrency(stats.totalRevenue),
			icon: DollarSign,
			color: "text-emerald-600",
			bgColor: "bg-emerald-50",
		},
		{
			label: "Rata-rata Transaksi",
			value: formatCurrency(stats.avgTransaction),
			icon: TrendingUp,
			color: "text-amber-600",
			bgColor: "bg-amber-50",
		},
		{
			label: "Total Berat (kg)",
			value: `${formatNumber(stats.totalWeight)} kg`,
			icon: Scale,
			color: "text-purple-600",
			bgColor: "bg-purple-50",
		},
		{
			label: "Total Item (pcs)",
			value: formatNumber(stats.totalPcs),
			icon: Package,
			color: "text-rose-600",
			bgColor: "bg-rose-50",
		},
	];

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
			{cards.map((card) => {
				const Icon = card.icon;
				return (
					<div
						key={card.label}
						className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3"
					>
						<div className="flex items-center justify-between">
							<span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
								{card.label}
							</span>
							<div className={`${card.bgColor} ${card.color} p-2 rounded-lg`}>
								<Icon className="w-4 h-4" />
							</div>
						</div>
						<p className="text-xl font-bold text-gray-900 truncate">
							{card.value}
						</p>
					</div>
				);
			})}
		</div>
	);
};
