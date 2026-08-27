import React from "react";
import { ArrowRight } from "lucide-react";
import type { Transaction } from "@/types";
import { SalesWidget } from "@/components/widgets/SalesWidget";
import { OrderTypeChart } from "@/components/charts/OrderTypeChart";
import { PaymentStatusChart } from "@/components/charts/PaymentStatusChart";
import { MarketSalesWidget } from "@/components/widgets/MarketSalesWidget";
import { SummaryCards } from "@/components/charts/SummaryCards";
import { PaymentMethodChart } from "@/components/charts/PaymentMethodChart";
import { TopCashierWidget } from "@/components/widgets/TopCashierWidget";
import { PaymentRatioChart } from "@/components/charts/PaymentRatioChart";
import { DateRangePicker } from "@/components/ui/DateRangePicker.old";
import { Button } from "@/components/ui/button";

interface SalesDashboardProps {
	transactions: Transaction[];
	startDate: string;
	endDate: string;
	onDateChange: (start: string, end: string) => void;
	onViewDetails: () => void;
	isRestricted: boolean; // e.g. for Cashier role who can only see today's data
	filterType?: string;
	onFilterChange?: (value: string | number) => void;
}

export const SalesDashboard: React.FC<SalesDashboardProps> = ({
	transactions,
	startDate,
	endDate,
	onDateChange,
	onViewDetails,
	isRestricted,
	filterType,
	onFilterChange,
}) => {
	return (
		<div className="space-y-6">
			{/* Filters & Actions */}
			<div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
				<div className="flex items-center gap-4 w-full md:w-auto">
					<DateRangePicker
						startDate={startDate}
						endDate={endDate}
						onStartDateChange={(date: string) => onDateChange(date, endDate)}
						onEndDateChange={(date: string) => onDateChange(startDate, date)}
						disabled={isRestricted}
					/>

					{isRestricted && (
						<div className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-100 whitespace-nowrap">
							Mode Kasir: Hari Ini
						</div>
					)}
				</div>

				<div className="flex items-center gap-2 w-full md:w-auto">
					<Button
						onClick={onViewDetails}
						className=" flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 bg-white border border-gray-300 text-gray-700! rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm group"
					>
						<span>Lihat Detail Transaksi</span>
						<ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
					</Button>
				</div>
			</div>

			{/* Summary Cards (KPI) */}
			<SummaryCards data={transactions} />

			{/* Charts Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="lg:col-span-2">
					<SalesWidget
						data={transactions}
						isRestricted={isRestricted}
						filterType={filterType}
						onFilterChange={onFilterChange}
						startDate={startDate}
						endDate={endDate}
					/>
				</div>

				{/* Secondary Charts */}
				<OrderTypeChart data={transactions} />
				<PaymentStatusChart data={transactions} />

				{/* Payment Method & Ratio */}
				<PaymentMethodChart data={transactions} />
				<PaymentRatioChart data={transactions} />

				<div className="lg:col-span-2">
					<MarketSalesWidget
						data={transactions}
						filterType={filterType}
						onFilterChange={onFilterChange}
					/>
				</div>

				{/* Top Cashier Chart - Full Width */}
				<div className="lg:col-span-2">
					<TopCashierWidget data={transactions} />
				</div>
			</div>
		</div>
	);
};
