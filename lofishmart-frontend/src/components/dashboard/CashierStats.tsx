import { ShoppingCart, AlertCircle, TrendingUp } from "lucide-react";
import { StatCard } from "./StatCard";
import { formatCurrency } from "@/utils/format";

interface CashierStatsProps {
	todayRevenue: number;
	todayCount: number;
	unpaidCount: number;
}

export function CashierStats({
	todayRevenue,
	todayCount,
	unpaidCount,
}: CashierStatsProps) {
	return (
		<>
			{/* Total Pendapatan Hari Ini */}
			<StatCard
				label="Pendapatan Hari Ini"
				value={formatCurrency(todayRevenue)}
				icon={TrendingUp}
				variant="hero"
				className="col-span-4 lg:col-span-6"
			/>

			{/* Total Transaksi */}
			<StatCard
				label="Total Transaksi"
				value={todayCount}
				icon={ShoppingCart}
				className="col-span-2 lg:col-span-3"
			/>

			{/* Belum Lunas */}
			<StatCard
				label="Belum Lunas"
				value={unpaidCount}
				icon={AlertCircle}
				footer="Segera selesaikan pembayaran"
				variant="warning"
				className="col-span-2 lg:col-span-3"
			/>
		</>
	);
}
