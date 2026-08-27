import React from "react";
import { Banknote, Files, TrendingUp, AlertCircle } from "lucide-react";
import { formatRupiah } from "@/utils";

interface TransactionSummaryCardsProps {
	totalRevenue: number;
	totalTransactions: number;
	avgTransactionValue: number;
	unpaidTransactionsCount: number;
}

export const TransactionSummaryCards: React.FC<
	TransactionSummaryCardsProps
> = ({
	totalRevenue,
	totalTransactions,
	avgTransactionValue,
	unpaidTransactionsCount,
}) => {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
			{/* Total Revenue */}
			<div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
				<div className="flex items-center justify-between mb-2">
					<h3 className="text-sm font-medium text-gray-500">Total Omset</h3>
					<div className="p-2 bg-green-50 rounded-lg">
						<Banknote className="w-5 h-5 text-green-600" />
					</div>
				</div>
				<div>
					<span className="text-2xl font-bold text-gray-900">
						{formatRupiah(totalRevenue)}
					</span>
				</div>
			</div>

			{/* Total Transactions */}
			<div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
				<div className="flex items-center justify-between mb-2">
					<h3 className="text-sm font-medium text-gray-500">Total Transaksi</h3>
					<div className="p-2 bg-blue-50 rounded-lg">
						<Files className="w-5 h-5 text-blue-600" />
					</div>
				</div>
				<div>
					<span className="text-2xl font-bold text-gray-900">
						{totalTransactions}
					</span>
				</div>
			</div>

			{/* Average Transaction Value */}
			<div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
				<div className="flex items-center justify-between mb-2">
					<h3 className="text-sm font-medium text-gray-500">
						Rata-rata Transaksi
					</h3>
					<div className="p-2 bg-purple-50 rounded-lg">
						<TrendingUp className="w-5 h-5 text-purple-600" />
					</div>
				</div>
				<div>
					<span className="text-2xl font-bold text-gray-900">
						{formatRupiah(avgTransactionValue)}
					</span>
				</div>
			</div>

			{/* Unpaid Transactions */}
			<div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
				<div className="flex items-center justify-between mb-2">
					<h3 className="text-sm font-medium text-gray-500">Belum Lunas</h3>
					<div className="p-2 bg-red-50 rounded-lg">
						<AlertCircle className="w-5 h-5 text-red-600" />
					</div>
				</div>
				<div>
					<span className="text-2xl font-bold text-gray-900">
						{unpaidTransactionsCount}
					</span>
					<p className="text-xs text-red-500 mt-1">
						Transaksi perlu tindak lanjut
					</p>
				</div>
			</div>
		</div>
	);
};
