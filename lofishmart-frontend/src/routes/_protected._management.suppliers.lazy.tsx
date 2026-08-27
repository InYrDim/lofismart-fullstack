import { useEffect, useState } from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { SupplierService } from "@/services/supplier.service";
import type { SupplierData, SupplierFormData } from "@/services/supplier.service";
import { SupplierFormModal } from "@/components/ui/modals/SupplierFormModal";
import { Modal } from "@/components/ui/modals/Modal";
import {
	Truck,
	Plus,
	Edit,
	Trash2,
	Mail,
	Phone,
	Building2,
	MapPin,
	CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/_protected/_management/suppliers")({
	component: SuppliersPage,
});

function SuppliersPage() {

	const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingSupplier, setEditingSupplier] = useState<SupplierData | null>(null);

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [supplierToDelete, setSupplierToDelete] = useState<SupplierData | null>(null);

	useEffect(() => {
		fetchData();
	}, []);

	async function fetchData() {
		setIsLoading(true);
		try {
			const data = await SupplierService.getSuppliers();
			setSuppliers(data);
		} catch (error) {
			console.error("Failed to load data", error);
		} finally {
			setIsLoading(false);
		}
	}

	const handleOpenAdd = () => {
		setEditingSupplier(null);
		setIsFormOpen(true);
	}

	const handleOpenEdit = (supplier: SupplierData) => {
		setEditingSupplier(supplier);
		setIsFormOpen(true);
	}

	const handleSave = async (data: SupplierFormData) => {
		if (editingSupplier) {
			await SupplierService.updateSupplier(editingSupplier.id, data);
		} else {
			await SupplierService.createSupplier(data);
		}
		await fetchData();
	}

	const handleOpenDelete = (supplier: SupplierData) => {
		setSupplierToDelete(supplier);
		setIsDeleteModalOpen(true);
	}

	const confirmDelete = async () => {
		if (!supplierToDelete) return;
		try {
			await SupplierService.deleteSupplier(supplierToDelete.id);
			setSuppliers((prev) => prev.filter((s) => s.id !== supplierToDelete.id));
			setIsDeleteModalOpen(false);
			setSupplierToDelete(null);
		} catch (error) {
		        console.error("Failed to delete supplier", error);
		        toast.error("Gagal menghapus supplier. Pastikan Anda memiliki izin akses.");
		}
		}

	function renderLoading() {
		return (
			<div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
				<div className="p-6 border-b border-gray-50">
					<div className="h-6 w-48 bg-gray-100 rounded animate-pulse" />
				</div>
				<div className="p-0">
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0 animate-pulse">
							<div className="w-10 h-10 bg-gray-100 rounded-full" />
							<div className="flex-1 space-y-2">
								<div className="h-4 w-1/4 bg-gray-100 rounded" />
								<div className="h-3 w-1/3 bg-gray-50 rounded" />
							</div>
							<div className="w-24 h-8 bg-gray-50 rounded" />
							<div className="w-24 h-8 bg-gray-50 rounded" />
						</div>
					))}
				</div>
			</div>
		)
	}

	function renderEmpty() {
		return (
			<div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
				<Truck className="w-16 h-16 mb-4 opacity-30" />
				<p className="text-lg font-medium text-gray-500">Belum ada supplier</p>
				<p className="text-sm text-gray-400 mb-6">Klik tombol "Tambah Supplier" untuk menambahkan supplier pertama.</p>
				<Button onClick={handleOpenAdd} className="gap-2">
					<Plus className="w-4 h-4" /> Tambah Supplier
				</Button>
			</div>
		)
	}

	function renderTable() {
		return (
			<div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
				<Table>
					<TableHeader>
						<TableRow className="bg-gray-50/50">
							<TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier</TableHead>
							<TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kontak</TableHead>
							<TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Alamat</TableHead>
							<TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bank</TableHead>
							<TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{suppliers.map((supplier) => (
							<TableRow key={supplier.id} className="hover:bg-gray-50/50 transition-colors group">
								<TableCell className="px-6 py-4">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm">
											{supplier.name.charAt(0).toUpperCase()}
										</div>
										<div>
											<div className="font-medium text-gray-900">{supplier.name}</div>
											{supplier.corporation && (
												<div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
													<Building2 className="w-3 h-3" /> {supplier.corporation}
												</div>
											)}
										</div>
									</div>
								</TableCell>
								<TableCell className="px-6 py-4">
									<div className="space-y-1">
										{supplier.email && <div className="flex items-center gap-1.5 text-sm text-gray-600"><Mail className="w-3.5 h-3.5 text-gray-400" />{supplier.email}</div>}
										{supplier.phone_number && <div className="flex items-center gap-1.5 text-sm text-gray-600"><Phone className="w-3.5 h-3.5 text-gray-400" />{supplier.phone_number}</div>}
										{!supplier.email && !supplier.phone_number && <span className="text-sm text-gray-400 italic">—</span>}
									</div>
								</TableCell>
								<TableCell className="px-6 py-4">
									<div className="space-y-1">
										{supplier.address && <div className="flex items-start gap-1.5 text-sm text-gray-600"><MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" /><span className="line-clamp-2">{supplier.address}</span></div>}
										{(supplier.city || supplier.pos) && <div className="text-xs text-gray-500 ml-5">{supplier.city} {supplier.pos && `(${supplier.pos})`}</div>}
										{!supplier.address && !supplier.city && <span className="text-sm text-gray-400 italic">—</span>}
									</div>
								</TableCell>
								<TableCell className="px-6 py-4">
									<div className="space-y-1">
										{supplier.bank && <div className="flex items-center gap-1.5 text-sm text-gray-600"><CreditCard className="w-3.5 h-3.5 text-gray-400" /><span className="font-medium">{supplier.bank}</span></div>}
										{supplier.no_rek && <div className="text-xs text-gray-500 font-mono ml-5">{supplier.no_rek}</div>}
										{!supplier.bank && !supplier.no_rek && <span className="text-sm text-gray-400 italic">—</span>}
									</div>
								</TableCell>
								<TableCell className="px-6 py-4 text-right">
									<div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										<Button variant="ghost" size="icon-sm" onClick={() => handleOpenEdit(supplier)} title="Edit"><Edit className="w-4 h-4 text-gray-500" /></Button>
										<Button variant="ghost" size="icon-sm" onClick={() => handleOpenDelete(supplier)} title="Hapus"><Trash2 className="w-4 h-4 text-red-500" /></Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		)
	}

	function renderDeleteModal() {
		return (
			<Modal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				title="Hapus Supplier"
				description={`Apakah Anda yakin ingin menghapus supplier "${supplierToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
				variant="error"
				size="sm"
			>
				<div className="flex justify-end gap-3 w-full mt-6">
					<Button variant="outline-primary" onClick={() => setIsDeleteModalOpen(false)}>
						Batal
					</Button>
					<Button className="bg-red-600 hover:bg-red-700 text-white border-0" onClick={confirmDelete}>
						Hapus
					</Button>
				</div>
			</Modal>
		)
	}

	return (
		<div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
			<AppHeader title="Kelola Supplier">
				<Button onClick={handleOpenAdd} className="gap-2">
					<Plus className="w-4 h-4" /> Tambah Supplier
				</Button>
			</AppHeader>

			<main className="flex-1 overflow-auto p-6">
				<div className="max-w-7xl mx-auto">
					{isLoading ? (
						renderLoading()
					) : suppliers.length === 0 ? (
						renderEmpty()
					) : (
						renderTable()
					)}
				</div>
			</main>

			<SupplierFormModal
				isOpen={isFormOpen}
				onClose={() => {
					setIsFormOpen(false);
					setEditingSupplier(null);
				}}
				onSave={handleSave}
				supplier={editingSupplier}
			/>

			{renderDeleteModal()}
		</div>
	)
}