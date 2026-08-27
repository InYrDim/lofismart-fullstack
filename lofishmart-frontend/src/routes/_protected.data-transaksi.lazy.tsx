import { useState, useEffect, useCallback } from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { TransactionService } from "@/services/transaction.service";
import type { Transaction } from "@/types";
import { Trash2, AlertCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionEditModal } from "@/components/transaction/TransactionEditModal";
import { TransactionDetailSidebar } from "@/components/transaction/TransactionDetailSidebar";
import { useDateRangeFilter } from "@/hooks/useDateRangeFilter";
import { Modal, ModalFooter } from "@/components/ui/modals/Modal";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "@/components/transaction/columns";
import { Select } from "@/components/ui/select";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { useRoleAndPermission } from "@/hooks/useRoleAndPermission";
import { format } from "date-fns";

export const Route = createLazyFileRoute('/_protected/data-transaksi')({
	component: DataTransaksiPage,
});

function DataTransaksiPage() {
	const { user } = useAuth();
	const { isCashier } = useRoleAndPermission();

	// Use Filter Hook
	const {
		startDate,
		endDate,
		filterType,
		setFilterType,
		handleFilterChange,
		setManualDateRange,
	} = useDateRangeFilter(isCashier ? "today" : "month");

	// Force today for cashier
	useEffect(() => {
		if (isCashier) {
			const today = format(new Date(), "yyyy-MM-dd");
			setManualDateRange(today, today);
			setFilterType("today");
		}
	}, [isCashier, setManualDateRange, setFilterType]);

	// State
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	
	// Filter State
	const [filterPelanggan, setFilterPelanggan] = useState<string>("all");
	const [filterKasir, setFilterKasir] = useState<string>("all");
	const [filterMetode, setFilterMetode] = useState<string>("all");
	const [filterStatus, setFilterStatus] = useState<string>("all");
	
	const [sortBy] = useState<string>("transaction_date");
	const [sortDirection] = useState<"asc" | "desc">("desc");

	// CRUD Modals
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);
	const [selectedDetailTransaction, setSelectedDetailTransaction] = useState<Transaction | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [selectedEditTransaction, setSelectedEditTransaction] = useState<Transaction | null>(null);

	const fetchData = useCallback(async () => {
		setError(null);
		try {
			const data = await TransactionService.getTransactions({
				startDate,
				endDate,
				marketId: isCashier ? user?.market_id : undefined,
				userId: isCashier ? user?.id : undefined,
			});
			setTransactions(data);
		} catch (err) {
			console.error("Error fetching transactions:", err);
			setError("Gagal memuat data transaksi.");
		}
	}, [startDate, endDate, isCashier, user?.market_id, user?.id]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Extract unique options for filters
	const uniquePelanggan = Array.from(new Set(transactions.map(t => t.customer_name))).filter(Boolean);
	const uniqueKasir = Array.from(new Set(transactions.map(t => t.cashier_name))).filter(Boolean);
	const uniqueMetode = Array.from(new Set(transactions.map(t => t.payment_method))).filter(Boolean);

	// Processing logic: Filter -> Sort
	const processedTransactions = transactions.filter(t => {
		// 1. Search term
		const matchSearch = 
			t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(t.customer_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
			(t.cashier_name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
		if (!matchSearch) return false;

		// 2. Exact match filters
		if (filterPelanggan !== "all" && t.customer_name !== filterPelanggan) return false;
		if (filterKasir !== "all" && t.cashier_name !== filterKasir) return false;
		if (filterMetode !== "all" && t.payment_method !== filterMetode) return false;
		
		// 3. Status filter
		if (filterStatus !== "all") {
			const statusStr = t.is_paid === '1' ? 'lunas' : t.is_paid === '2' ? 'hutang' : 'belum lunas';
			if (filterStatus !== statusStr) return false;
		}

		return true;
	}).sort((a, b) => {
		let sortValA = a[sortBy as keyof Transaction] ?? "";
		let sortValB = b[sortBy as keyof Transaction] ?? "";

		if (sortBy === 'total_price') {
			sortValA = Number(sortValA) || 0;
			sortValB = Number(sortValB) || 0;
		}

		if (sortValA < sortValB) return sortDirection === "asc" ? -1 : 1;
		if (sortValA > sortValB) return sortDirection === "asc" ? 1 : -1;
		return 0;
	});

	const handleEditSave = async (id: string, updates: Partial<Transaction>) => {
		try {
			await TransactionService.updateTransaction(id, updates);
			await fetchData();
		} catch (error) {
			console.error("Failed to update transaction", error);
			throw error;
		}
	};

	const handleDeleteConfirm = async (trx: Transaction) => {
		setIsDeleting(true);
		try {
			await TransactionService.deleteTransaction(trx.id);
			setDeleteModalOpen(false);
			setSelectedTrx(null);
			await fetchData();
		} catch (error) {
			console.error("Failed to delete transaction", error);
		} finally {
			setIsDeleting(false);
		}
	};

	const columns = getColumns(
		(trx: Transaction) => {
			setSelectedEditTransaction(trx);
			setEditModalOpen(true);
		},
		(trx: Transaction) => {
			setSelectedTrx(trx);
			setDeleteModalOpen(true);
		}
	);

	return (
		<div className="flex bg-gray-50 w-full h-full overflow-hidden">
			<div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative">
				<AppHeader 
				title="Data Transaksi"
				extraHeaderContent={
					<div className="bg-white border-b border-gray-100 flex flex-col shrink-0">
						<div className="px-6 py-3 flex flex-wrap items-center gap-4 border-b border-gray-50">
							{!isCashier && (
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium text-gray-500">Periode:</span>
									<Select
										fullWidth={false}
										value={filterType}
										onChange={(val) => handleFilterChange(val.toString())}
										options={[
											{ value: "today", label: "Hari Ini" },
											{ value: "week", label: "Minggu Ini" },
											{ value: "month", label: "Bulan Ini" },
											{ value: "year", label: "Tahun Ini" },
											{ value: "all", label: "Semua" },
										]}
										className="w-[140px]"
									/>
								</div>
							)}

							<div className="h-4 w-px bg-gray-200 hidden sm:block"></div>

							<div className="relative w-full md:w-64">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
								<input
									placeholder="Cari ID / Nama..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
								/>
							</div>
						</div>

						<div className="px-6 py-2 flex flex-wrap items-center gap-3 bg-gray-50/30 text-xs">
							<div className="flex items-center gap-1.5">
								<span className="text-gray-500 font-medium">Pelanggan:</span>
								<Select
									fullWidth={false}
									value={filterPelanggan}
									onChange={(val) => setFilterPelanggan(val.toString())}
									options={[
										{ value: "all", label: "Semua" },
										...uniquePelanggan.map(p => ({ value: p, label: p }))
									]}
									className="min-w-[120px]"
								/>
							</div>
							{!isCashier && (
								<div className="flex items-center gap-1.5">
									<span className="text-gray-500 font-medium">Kasir:</span>
									<Select
										fullWidth={false}
										value={filterKasir}
										onChange={(val) => setFilterKasir(val.toString())}
										options={[
											{ value: "all", label: "Semua" },
											...uniqueKasir.map(k => ({ value: k, label: k }))
										]}
										className="min-w-[120px]"
									/>
								</div>
							)}
							<div className="flex items-center gap-1.5">
								<span className="text-gray-500 font-medium">Metode:</span>
								<Select
									fullWidth={false}
									value={filterMetode}
									onChange={(val) => setFilterMetode(val.toString())}
									options={[
										{ value: "all", label: "Semua" },
										...uniqueMetode.map(m => ({ value: m, label: m }))
									]}
									className="min-w-[120px]"
								/>
							</div>
							<div className="flex items-center gap-1.5">
								<span className="text-gray-500 font-medium">Status:</span>
								<Select
									fullWidth={false}
									value={filterStatus}
									onChange={(val) => setFilterStatus(val.toString())}
									options={[
										{ value: "all", label: "Semua" },
										{ value: "lunas", label: "Lunas" },
										{ value: "belum lunas", label: "Belum Lunas" },
										{ value: "hutang", label: "Hutang" },
									]}
									className="min-w-[120px]"
								/>
							</div>
							
							{(filterPelanggan !== 'all' || filterKasir !== 'all' || filterMetode !== 'all' || filterStatus !== 'all' || searchTerm) && (
								<button 
									className="text-brand-primary hover:text-brand-primary/80 font-medium ml-auto px-2"
									onClick={() => {
										setFilterPelanggan("all"); setFilterKasir("all"); setFilterMetode("all"); setFilterStatus("all"); setSearchTerm("");
									}}
								>
									Reset Filter
								</button>
							)}
						</div>
					</div>
				}
			>
			</AppHeader>

			<main className="flex-1 overflow-hidden p-6 flex flex-col gap-6">
				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 mb-6">
						<AlertCircle className="w-4 h-4" />
						<p className="text-sm">{error}</p>
					</div>
				)}

				<DataTable
					columns={columns}
					data={processedTransactions}
					onRowClick={(trx) => setSelectedDetailTransaction(trx)}
					selectedRowId={selectedDetailTransaction?.id}
				/>
			</main>

			<Modal
				isOpen={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				title="Konfirmasi Hapus"
				size="sm"
			>
				<div className="space-y-4">
					<p className="text-sm text-gray-600">
						Apakah Anda yakin ingin menghapus transaksi <span className="font-bold">{selectedTrx?.code}</span>?
						{" "}Tindakan ini tidak dapat dibatalkan.
					</p>
					<ModalFooter>
						<Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>
							Batal
						</Button>
						<Button 
							variant="destructive" 
							onClick={() => selectedTrx && handleDeleteConfirm(selectedTrx)} 
							disabled={isDeleting}
							className="gap-2"
						>
							<Trash2 className="w-4 h-4" />
							{isDeleting ? "Menghapus..." : "Hapus Transaksi"}
						</Button>
					</ModalFooter>
				</div>
			</Modal>

				<TransactionEditModal
					isOpen={editModalOpen}
					transaction={selectedEditTransaction}
					onClose={() => {
						setEditModalOpen(false);
						setSelectedEditTransaction(null);
					}}
					onSave={handleEditSave}
				/>
			</div>

			<TransactionDetailSidebar
				transaction={selectedDetailTransaction}
				isOpen={!!selectedDetailTransaction}
				onClose={() => setSelectedDetailTransaction(null)}
				startDate={startDate}
				endDate={endDate}
			/>
		</div>
	);
}
