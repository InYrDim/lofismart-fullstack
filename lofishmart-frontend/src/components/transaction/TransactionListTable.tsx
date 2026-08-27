import React from "react";
import { format } from "date-fns";
import { 
	Printer, 
	RefreshCw, 
	Search,
	Edit,
	Trash2
} from "lucide-react";
import type { Transaction } from "@/types";
import { formatRupiah } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentStatusBadge } from "@/components/ui/PaymentStatusBadge.old";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

interface TransactionListTableProps {
	transactions: Transaction[];
	loading: boolean;
	searchTerm: string;
	onSearchChange: (value: string) => void;
	onRefresh: () => void;
	onPrint: () => void;
	onRowClick: (transaction: Transaction) => void;
	onEdit?: (transaction: Transaction) => void;
	onDelete?: (transaction: Transaction) => void;
	selectedTransactionId?: string | null;
	selectedIds?: string[];
	onSelectionChange?: (ids: string[]) => void;
	currentPage?: number;
	totalPages?: number;
	onPageChange?: (page: number) => void;
	groupBy?: string | null;
}

export const TransactionListTable: React.FC<TransactionListTableProps> = ({
	transactions,
	loading,
	searchTerm,
	onSearchChange,
	onRefresh,
	onPrint,
	onRowClick,
	onEdit,
	onDelete,
	selectedTransactionId,
	selectedIds = [],
	onSelectionChange,
	currentPage,
	totalPages,
	onPageChange,
	groupBy,
}) => {
	const allSelected = transactions.length > 0 && transactions.every(t => selectedIds.includes(t.id));
	const isIndeterminate = selectedIds.length > 0 && !allSelected;

	const handleSelectAll = (checked: boolean) => {
		if (onSelectionChange) {
			if (checked) {
				// Add visible transactions to selection if not already there
				const newIds = [...new Set([...selectedIds, ...transactions.map(t => t.id)])];
				onSelectionChange(newIds);
			} else {
				// Remove visible transactions from selection
				const currentPageIds = transactions.map(t => t.id);
				onSelectionChange(selectedIds.filter(id => !currentPageIds.includes(id)));
			}
		}
	};

	const handleSelectRow = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
		e.stopPropagation();
		if (onSelectionChange) {
			const newSelection = e.target.checked
				? [...selectedIds, id]
				: selectedIds.filter((sid) => sid !== id);
			onSelectionChange(newSelection);
		}
	};

	const renderPaginationItems = () => {
		if (currentPage === undefined || totalPages === undefined || !onPageChange) return null;

		const items = [];
		const maxVisible = 5;
		
		let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
		const end = Math.min(totalPages, start + maxVisible - 1);
		
		if (end - start + 1 < maxVisible) {
			start = Math.max(1, end - maxVisible + 1);
		}

		if (start > 1) {
			items.push(
				<PaginationItem key="1">
					<PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
				</PaginationItem>
			);
			if (start > 2) items.push(<PaginationEllipsis key="e1" />);
		}

		for (let i = start; i <= end; i++) {
			items.push(
				<PaginationItem key={i}>
					<PaginationLink 
						onClick={() => onPageChange(i)}
						isActive={currentPage === i}
					>
						{i}
					</PaginationLink>
				</PaginationItem>
			);
		}

		if (end < totalPages) {
			if (end < totalPages - 1) items.push(<PaginationEllipsis key="e2" />);
			items.push(
				<PaginationItem key={totalPages}>
					<PaginationLink onClick={() => onPageChange(totalPages)}>{totalPages}</PaginationLink>
				</PaginationItem>
			);
		}

		return items;
	};

	const hasActions = !!(onEdit || onDelete);

	return (
		<>
			{/* Toolbar */}
			<div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
				<div className="relative w-full md:w-96">
					<Input
						placeholder="Cari ID / Nama..."
						value={searchTerm}
						onChange={(e) => onSearchChange(e.target.value)}
						leftIcon={Search}
						className="w-full"
					/>
				</div>
				<div className="flex gap-2">
					<Button
						onClick={onPrint}
						disabled={transactions.length === 0}
						className="gap-2"
					>
						<Printer className="w-4 h-4" />
						Cetak Rekap
					</Button>
					<Button
						variant="secondary"
						onClick={onRefresh}
						className="gap-2"
						disabled={loading}
					>
						<RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
						Refresh
					</Button>
				</div>
			</div>

			{/* Table Container */}
			<div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				<div className="flex-1 overflow-auto">
					<table className="w-full text-left border-separate border-spacing-0">
						<thead className="bg-gray-50 sticky top-0 z-20">
							<tr>
								{onSelectionChange && (
									<th className="px-6 py-3 border-b border-gray-200 bg-gray-50 w-10">
										<input
											type="checkbox"
											className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
											checked={allSelected}
											ref={(el) => {
												if (el) el.indeterminate = isIndeterminate;
											}}
											onChange={(e) => handleSelectAll(e.target.checked)}
										/>
									</th>
								)}
								<th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase border-b border-gray-200 bg-gray-50">
									Kode Transaksi
								</th>
								<th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase border-b border-gray-200 bg-gray-50">
									Tanggal
								</th>
								<th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase border-b border-gray-200 bg-gray-50">
									Pelanggan
								</th>
								<th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase border-b border-gray-200 bg-gray-50">
									Kasir
								</th>
								<th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase border-b border-gray-200 bg-gray-50">
									Metode
								</th>
								<th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase border-b border-gray-200 bg-gray-50">
									Status
								</th>
								<th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase text-right border-b border-gray-200 bg-gray-50">
									Total
								</th>
								{hasActions && (
									<th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase text-center border-b border-gray-200 bg-gray-50 w-24">
										Aksi
									</th>
								)}
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{loading ? (
								<tr>
									<td
										colSpan={7 + (onSelectionChange ? 1 : 0) + (hasActions ? 1 : 0)}
										className="px-6 py-8 text-center text-gray-500"
									>
										<RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-primary" />
										<p>Memuat data transaksi...</p>
									</td>
								</tr>
							) : transactions.length === 0 ? (
								<tr>
									<td
										colSpan={7 + (onSelectionChange ? 1 : 0) + (hasActions ? 1 : 0)}
										className="px-6 py-12 text-center text-gray-500"
									>
										<Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
										<p className="text-lg font-medium text-gray-900">
											Tidak ada data transaksi.
										</p>
										<p className="text-sm">
											Coba ubah filter atau kata kunci pencarian.
										</p>
									</td>
								</tr>
							) : (
								transactions.map((trx, index) => {
									// Determine if we need a group header
									let showGroupHeader = false;
									let groupValue = "";
									
									if (groupBy) {
										const rawVal = trx[groupBy as keyof Transaction] || "Tidak ada";
										
										// Special formatting for grouping key
										if (groupBy === 'is_paid') {
											groupValue = rawVal === '1' ? 'Lunas' : rawVal === '2' ? 'Hutang' : 'Belum Lunas';
										} else {
											groupValue = String(rawVal);
										}

										if (index === 0) {
											showGroupHeader = true;
										} else {
											// Check previous row
											const prevRawVal = transactions[index - 1][groupBy as keyof Transaction] || "Tidak ada";
											let prevGroupValue = "";
											if (groupBy === 'is_paid') {
												prevGroupValue = prevRawVal === '1' ? 'Lunas' : prevRawVal === '2' ? 'Hutang' : 'Belum Lunas';
											} else {
												prevGroupValue = String(prevRawVal);
											}
											
											if (groupValue !== prevGroupValue) {
												showGroupHeader = true;
											}
										}
									}

									return (
										<React.Fragment key={trx.id}>
											{showGroupHeader && (
												<tr className="bg-brand-primary/5">
													<td 
														colSpan={7 + (onSelectionChange ? 1 : 0) + (hasActions ? 1 : 0)}
														className="px-6 py-2 border-b border-gray-100 font-medium text-brand-primary text-xs uppercase"
													>
														{groupBy === 'customer_name' && `Pelanggan: `}
														{groupBy === 'cashier_name' && `Kasir: `}
														{groupBy === 'payment_method' && `Metode: `}
														{groupBy === 'is_paid' && `Status: `}
														{groupValue}
													</td>
												</tr>
											)}
											<tr
												onClick={() => onRowClick(trx)}
												className={`
													cursor-pointer transition-colors
													${selectedIds.includes(trx.id) || selectedTransactionId === trx.id
														? "bg-brand-primary/5"
														: "hover:bg-gray-50/80"
													}
												`}
											>
												{onSelectionChange && (
													<td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
														<input
															type="checkbox"
															className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
															checked={selectedIds.includes(trx.id)}
															onChange={(e) => handleSelectRow(e, trx.id)}
														/>
													</td>
												)}
												<td className="px-6 py-3">
													<p className="font-medium text-brand-primary text-sm">
														{trx.code}
													</p>
												</td>
												<td className="px-6 py-3">
													<p className="text-gray-900 text-sm">
														{format(new Date(trx.transaction_date), "dd/MM/yyyy")}
													</p>
													<p className="text-gray-500 text-xs">
														{format(new Date(trx.transaction_date), "HH:mm")}
													</p>
												</td>
												<td className="px-6 py-3 text-sm text-gray-900">
													{trx.customer_name || "Umum"}
												</td>
												<td className="px-6 py-3 text-sm text-gray-900">
													{trx.cashier_name}
												</td>
												<td className="px-6 py-3">
													<span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
														{trx.payment_method || "N/A"}
													</span>
												</td>
												<td className="px-6 py-3">
													<PaymentStatusBadge isPaid={trx.is_paid} />
												</td>
												<td className="px-6 py-3 text-right">
													<p className="font-semibold text-gray-900">
														{formatRupiah(trx.total_price)}
													</p>
												</td>
												{hasActions && (
													<td className="px-6 py-3 text-center">
														<div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
															{onEdit && (
																<Button
																	variant="ghost"
																	size="icon-sm"
																	onClick={() => onEdit(trx)}
																	className="text-gray-500 hover:text-brand-primary hover:bg-brand-primary/10"
																	title="Edit Transaksi"
																>
																	<Edit className="w-4 h-4" />
																</Button>
															)}
															{onDelete && (
																<Button
																	variant="ghost"
																	size="icon-sm"
																	onClick={() => onDelete(trx)}
																	className="text-gray-500 hover:text-red-600 hover:bg-red-50"
																	title="Hapus Transaksi"
																>
																	<Trash2 className="w-4 h-4" />
																</Button>
															)}
														</div>
													</td>
												)}
											</tr>
										</React.Fragment>
									);
								})
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination Footer */}
				{!loading && totalPages !== undefined && totalPages > 1 && currentPage !== undefined && onPageChange && (
					<div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
						<p className="text-sm text-gray-500">
							Halaman <span className="font-medium">{currentPage}</span> dari <span className="font-medium">{totalPages}</span>
						</p>
						<Pagination className="mx-0 w-auto">
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious 
										onClick={() => onPageChange(Math.max(1, currentPage - 1))}
										className={`${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
									/>
								</PaginationItem>
								
								{renderPaginationItems()}

								<PaginationItem>
									<PaginationNext 
										onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
										className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					</div>
				)}
			</div>
		</>
	);
};
