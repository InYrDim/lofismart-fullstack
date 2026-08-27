import { TrendingUp, TrendingDown, ShoppingCart, AlertCircle, Users } from "lucide-react";
import { StatCard } from "./StatCard";
import { formatCurrency } from "@/utils/format";

interface AdminStatsProps {
	todayRevenue: number;
	yesterdayRevenue: number;
	revenueChange: number;
	todayCount: number;
	countChange: number;
	unpaidCount: number;
	activeCashiers: string[];
}

export function AdminStats({
	todayRevenue,
	yesterdayRevenue,
	revenueChange,
	todayCount,
	countChange,
	unpaidCount,
	activeCashiers,
}: AdminStatsProps) {
	return (
		<>
			{/* HERO: Total Pendapatan */}
			<StatCard
				label="Total Pendapatan"
				value={formatCurrency(todayRevenue)}
				icon={revenueChange >= 0 ? TrendingUp : TrendingDown}
				trend={{
					value: Math.abs(revenueChange),
					isPositive: revenueChange >= 0,
					label: "dari kemarin",
				}}
				footer={`Kemarin: ${formatCurrency(yesterdayRevenue)}`}
				variant="hero"
				className="col-span-4 lg:col-span-5 lg:row-span-2"
			/>

			{/* Total Transaksi */}
			<StatCard
				label="Total Transaksi"
				value={todayCount}
				icon={ShoppingCart}
				trend={{
					value: Math.abs(countChange),
					isPositive: countChange >= 0,
					label: "vs kemarin",
				}}
				className="col-span-2 lg:col-span-4"
			/>

			{/* Belum Lunas */}
			<StatCard
				label="Belum Lunas"
				value={unpaidCount}
				icon={AlertCircle}
				footer="Transaksi belum dibayar"
				variant="warning"
				className="col-span-2 lg:col-span-3"
			/>

			{/* Rata-rata Transaksi */}
			<StatCard
				label="Rata-rata Transaksi"
				value={formatCurrency(todayCount > 0 ? todayRevenue / todayCount : 0)}
				icon={TrendingUp}
				footer="Per transaksi"
				className="col-span-2 lg:col-span-4"
			/>

			{/* Kasir Aktif */}
			<StatCard
				label="Kasir Aktif"
				value={activeCashiers.length}
				icon={Users}
				footer={
					activeCashiers.length > 0
						? activeCashiers.slice(0, 2).join(", ") +
						  (activeCashiers.length > 2 ? ` + ${activeCashiers.length - 2}` : "")
						: "Belum ada"
				}
				className="col-span-2 lg:col-span-3"
			/>
		</>
	);
}
