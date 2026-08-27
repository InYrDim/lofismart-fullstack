import { useState, useMemo, useEffect } from "react";
import { createLazyFileRoute, useRouter } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { UserService } from "@/services/user.service";
import type { RoleData, RoleFormData } from "@/services/user.service";
import { RoleFormModal } from "@/components/ui/modals/RoleFormModal";
import { Modal } from "@/components/ui/modals/Modal";
import {
	Plus,
	Edit,
	Trash2,
	Shield,
	Search as SearchIcon,
	X,
	Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export const Route = createLazyFileRoute("/_protected/_management/roles")({
	component: RolesPage,
});

function RolesPage() {
	const router = useRouter();
	const { roles: initialRoles, permissions } = Route.useLoaderData();
	const [roles, setRoles] = useState<RoleData[]>(initialRoles);

	useEffect(() => {
		setRoles(initialRoles);
	}, [initialRoles]);

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingRole, setEditingRole] = useState<RoleData | null>(null);

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [roleToDelete, setRoleToDelete] = useState<RoleData | null>(null);

	const [searchTerm, setSearchTerm] = useState("");

	const fetchData = async () => {
		try {
			const rolesData = await UserService.getRoles();
			setRoles(rolesData);
		} catch (error) {
			console.error("Failed to refresh data", error);
		}
	}

	const handleOpenAdd = () => {
		setEditingRole(null);
		setIsFormOpen(true);
	}

	const handleOpenEdit = (role: RoleData) => {
		setEditingRole(role);
		setIsFormOpen(true);
	}

	const handleSave = async (data: RoleFormData, selectedPermissions: string[]) => {
		try {
			let roleId = data.id;
			if (editingRole) {
				await UserService.updateRole(editingRole.id, data);
				roleId = editingRole.id;
				toast.success("Role berhasil diperbarui");
			} else {
				const response = await UserService.createRole(data);
				roleId = response?.data?.id;
				toast.success("Role berhasil ditambahkan");
			}

			// Update permissions
			if (roleId) {
				await UserService.updateRolePermissions(roleId, selectedPermissions);
			}

			await router.invalidate();
			await fetchData();
			setIsFormOpen(false);
		} catch (error) {
			console.error("Failed to save role", error);
			toast.error("Gagal menyimpan data role");
		}
	}

	const handleOpenDelete = (role: RoleData) => {
		setRoleToDelete(role);
		setIsDeleteModalOpen(true);
	}

	const confirmDelete = async () => {
		if (!roleToDelete) return;
		try {
			await UserService.deleteRole(roleToDelete.id);
			setRoles((prev) => prev.filter((r) => r.id !== roleToDelete.id));
			setIsDeleteModalOpen(false);
			setRoleToDelete(null);
			toast.success("Role berhasil dihapus");
		} catch (error) {
			console.error("Failed to delete role", error);
			toast.error("Gagal menghapus role");
		}
	}

	const columns = useMemo<ColumnDef<RoleData>[]>(() => [
		{
			accessorKey: "id",
			header: "ID",
			cell: ({ getValue }) => (
				<span className="font-mono text-xs font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded leading-none uppercase">
					{getValue() as string}
				</span>
			),
		},
		{
			accessorKey: "name",
			header: "Nama Role",
			cell: ({ row }) => {
				const role = row.original;
				return (
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
							<Shield className="w-5 h-5" />
						</div>
						<div>
							<div className="font-bold text-gray-900">{role.name}</div>
							<div className="text-xs text-gray-500 font-mono italic">{role.guard_name}</div>
						</div>
					</div>
				);
			},
		},
		{
			id: "permissions_count",
			header: "Permissions",
			cell: ({ row }) => {
				const role = row.original;
				const count = role.hasPermits?.length || 0;
				return (
					<div className="flex flex-wrap gap-1">
						<span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${count > 0 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
							{count} Akses Aktif
						</span>
					</div>
				);
			},
		},
		{
			id: "actions",
			header: () => <div className="text-right uppercase">Aksi</div>,
			cell: ({ row }) => {
				const role = row.original;
				const isProtected = role.id === "ADMN";

				return (
					<div className="flex justify-end gap-1">
						{!isProtected ? (
							<>
								<Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenEdit(role); }} title="Edit">
									<Edit className="w-4 h-4 text-gray-500" />
								</Button>
								<Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenDelete(role); }} title="Hapus">
									<Trash2 className="w-4 h-4 text-red-500" />
								</Button>
							</>
						) : (
							<div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-amber-100 shadow-sm">
								<Lock className="w-3 h-3" /> System Restricted
							</div>
						)}
					</div>
				);
			},
		},
	], []);

	const filteredRoles = useMemo(() => {
		return roles.filter((role) =>
			role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			role.id.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [roles, searchTerm]);

	return (
		<div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
			<AppHeader title="Kelola Role & Hak Akses">
				<Button onClick={handleOpenAdd} className="gap-2 font-semibold">
					<Plus className="w-4 h-4" /> Tambah Role
				</Button>
			</AppHeader>

			<main className="flex-1 overflow-auto p-6 space-y-4">
				<div className="max-w-7xl mx-auto flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
					<div className="flex items-center gap-3 flex-1">
						<div className="relative w-full max-w-sm">
							<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<Input
								placeholder="Cari role (nama, kode)..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-9 bg-gray-50/50 border-gray-200"
							/>
						</div>
						{searchTerm && (
							<Button
								variant="ghost"
								onClick={() => setSearchTerm("")}
								className="text-gray-500 hover:text-gray-700"
							>
								<X className="w-4 h-4" />
							</Button>
						)}
					</div>
				</div>

				<div className="max-w-7xl mx-auto h-full flex flex-col">
					{roles.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
							<Shield className="w-16 h-16 mb-4 opacity-10" />
							<p className="text-lg font-medium text-gray-500">Belum ada role</p>
							<p className="text-sm text-gray-400 mb-6">Klik tombol "Tambah Role" untuk menambahkan role pertama.</p>
							<Button onClick={handleOpenAdd} className="gap-2">
								<Plus className="w-4 h-4" /> Tambah Role
							</Button>
						</div>
					) : (
						<DataTable
							columns={columns}
							data={filteredRoles}
							onRowClick={handleOpenEdit}
						/>
					)}
				</div>
			</main>

			<RoleFormModal
				key={editingRole?.id || "new-role"}
				isOpen={isFormOpen}
				onClose={() => {
					setIsFormOpen(false);
					setEditingRole(null);
				}}
				onSave={handleSave}
				role={editingRole}
				allPermissions={permissions}
			/>

			<Modal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				title="Hapus Role"
				description={`Apakah Anda yakin ingin menghapus role "${roleToDelete?.name}"? User yang memiliki role ini mungkin akan kehilangan akses.`}
				variant="error"
				size="sm"
			>
				<div className="flex justify-end gap-3 w-full mt-6">
					<Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
						Batal
					</Button>
					<Button className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-md" onClick={confirmDelete}>
						Hapus Role
					</Button>
				</div>
			</Modal>
		</div>
	);
}
