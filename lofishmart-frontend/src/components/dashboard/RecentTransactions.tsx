import { Clock } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/format";
import type { Transaction } from "@/types";

interface RecentTransactionsProps {
	transactions: Transaction[];
	onNavigate: (path: string) => void;
}

export function RecentTransactions({
	transactions,
	onNavigate,
}: RecentTransactionsProps) {
	return (
		<div className="col-span-4 lg:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-base font-bold text-gray-900">
					Transaksi Terbaru
				</h3>
				<button
					onClick={() => onNavigate("/transactions")}
					className="text-xs text-blue-600 hover:text-blue-700 font-medium"
				>
					Lihat Semua →
				</button>
			</div>
			{transactions.length === 0 ? (
				<div className="flex items-center justify-center h-32 text-gray-400 text-sm">
					Belum ada transaksi
				</div>
			) : (
				<div className="space-y-2.5">
					{transactions.map((trx) => (
						<div
							key={trx.id}
							className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
						>
							<div className="flex items-center gap-3 min-w-0">
								<div className="p-1.5 bg-blue-50 rounded-lg shrink-0">
									<Clock className="w-3.5 h-3.5 text-blue-500" />
								</div>
								<div className="min-w-0">
									<p className="text-sm font-medium text-gray-900 truncate">
										{trx.code || `TRX - ${trx.id.slice(0, 8)}`}
									</p>
									<p className="text-xs text-gray-500">
										{format(new Date(trx.transaction_date), "HH:mm")} ·{" "}
										{trx.cashier_name || "—"}
									</p>
								</div>
							</div>
							<div className="text-right shrink-0 ml-3">
								<p className="text-sm font-semibold text-gray-900">
									{formatCurrency(trx.total_price)}
								</p>
								<span
									className={`text-xs px-1.5 py-0.5 rounded-full ${
										trx.is_paid === "3"
											? "bg-emerald-50 text-emerald-600"
											: trx.is_paid === "2"
											? "bg-red-50 text-red-600"
											: "bg-amber-50 text-amber-600"
									} `}
								>
									{trx.is_paid === "3"
										? "Lunas"
										: trx.is_paid === "2"
										? "Belum Bayar"
										: "Overview"}
								</span>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
