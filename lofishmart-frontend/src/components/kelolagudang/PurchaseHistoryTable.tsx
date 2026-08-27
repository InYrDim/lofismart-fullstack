import React from "react";
import {
	Table,
	TableHeader,
	TableBody,
	TableHead,
	TableRow,
	TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ShoppingBag, ChevronRight, Package } from "lucide-react";
import type { Purchase, GroupedPurchase } from "@/types";

interface PurchaseHistoryTableProps {
	loading: boolean;
	data: (GroupedPurchase | Purchase)[];
	onSelect: (item: GroupedPurchase | Purchase) => void;
}

function isGroup(item: GroupedPurchase | Purchase): item is GroupedPurchase {
	return "items" in item;
}

export const PurchaseHistoryTable: React.FC<PurchaseHistoryTableProps> = ({
	loading,
	data,
	onSelect,
}) => {
	return (
		<Table>
			<TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
				<TableRow className="border-slate-100">
					<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 pl-4">
						Tanggal
					</TableHead>
					<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3">
						Supplier
					</TableHead>
					<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3">
						Produk
					</TableHead>
					<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 text-center">
						Batch
					</TableHead>
					<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 text-center">
						Qty
					</TableHead>
					<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 text-right">
						Harga
					</TableHead>
					<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 text-right">
						Total
					</TableHead>
					<TableHead className="w-[50px]"></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{loading ? (
					<TableRow>
						<TableCell colSpan={8} className="h-32 text-center text-slate-400">
							<RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50 text-blue-500" />
							<p>Memuat riwayat transfer...</p>
						</TableCell>
					</TableRow>
				) : data.length > 0 ? (
					data.map((item) =>
						isGroup(item) ? (
							<TableRow
								key={item.id}
								className="hover:bg-slate-50/80 border-slate-50 cursor-pointer transition-colors bg-blue-50/30"
								onClick={() => onSelect(item)}
							>
								<TableCell className="py-4 pl-4">
									<div className="flex flex-col">
										<span className="font-medium text-slate-700">
											{new Date(item.date).toLocaleDateString("id-ID", {
												day: "2-digit",
												month: "long",
												year: "numeric",
											})}
										</span>
										<span className="text-[10px] text-slate-400">
											{item.userName}
										</span>
									</div>
								</TableCell>
								<TableCell className="py-4 font-medium text-slate-600">
									{item.supplierName}
								</TableCell>
								<TableCell className="py-4">
									<Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-medium">
										<Package className="w-3 h-3 mr-1" />
										{item.items.length} produk
									</Badge>
								</TableCell>
								<TableCell className="py-4 text-center">
									<Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 font-mono text-[10px]">
										{item.id}
									</Badge>
								</TableCell>
								<TableCell className="py-4 text-center text-slate-400 text-sm">
									bervariasi
								</TableCell>
								<TableCell className="py-4 text-right text-slate-400 text-sm">
									(bervariasi)
								</TableCell>
								<TableCell className="py-4 text-right font-bold text-slate-900">
									Rp {item.totalAmount.toLocaleString("id-ID")}
								</TableCell>
								<TableCell className="py-4 text-center">
									<ChevronRight className="w-4 h-4 text-slate-300" />
								</TableCell>
							</TableRow>
						) : (
							<TableRow
								key={item.id}
								className="hover:bg-slate-50/80 border-slate-50 cursor-pointer transition-colors"
								onClick={() => onSelect(item)}
							>
								<TableCell className="py-4 pl-4">
									<div className="flex flex-col">
										<span className="font-medium text-slate-700">
											{new Date(item.created_at).toLocaleDateString("id-ID", {
												day: "2-digit",
												month: "long",
												year: "numeric",
											})}
										</span>
										<span className="text-[10px] text-slate-400">
											{item.user?.name || item.user?.username || "System"}
										</span>
									</div>
								</TableCell>
								<TableCell className="py-4 font-medium text-slate-600">
									{item.supplier?.name || item.supplier?.corporation || "-"}
								</TableCell>
								<TableCell className="py-4 text-slate-700">
									{item.product?.name || "-"}
								</TableCell>
								<TableCell className="py-4 text-center">
									<span className="text-slate-300">-</span>
								</TableCell>
								<TableCell className="py-4 text-center font-semibold text-slate-700">
									{item.qty} <span className="text-[10px] text-slate-400">{item.unit === "1" ? "KG" : "Ekor"}</span>
								</TableCell>
								<TableCell className="py-4 text-right text-slate-700">
									Rp {(item.price || 0).toLocaleString("id-ID")}
								</TableCell>
								<TableCell className="py-4 text-right font-bold text-slate-900">
									Rp {((item.price || 0) * (item.qty || 0)).toLocaleString("id-ID")}
								</TableCell>
								<TableCell className="py-4 text-center">
									<ChevronRight className="w-4 h-4 text-slate-300" />
								</TableCell>
							</TableRow>
						),
					)
				) : (
					<TableRow>
						<TableCell colSpan={8} className="h-40 text-center text-slate-400">
							<ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
							<p>Belum ada riwayat transfer dalam 30 hari terakhir.</p>
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
};
