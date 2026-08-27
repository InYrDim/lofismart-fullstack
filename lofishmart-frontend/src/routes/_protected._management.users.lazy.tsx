import { useState, useMemo, useEffect } from "react";
import { createLazyFileRoute, useRouter } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { UserService } from "@/services/user.service";
import type { UserData, UserFormData } from "@/services/user.service";
import { UserFormModal } from "@/components/ui/modals/UserFormModal";
import { Modal } from "@/components/ui/modals/Modal";
import { isSuperAdminUser } from "@/hooks/useRoleAndPermission";
import {
	Plus,
	Edit,
	Trash2,
	Mail,
	Shield,
	Store,
	Users as UsersIcon,
	Search as SearchIcon,
	Filter,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { type ColumnDef, type GroupingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export const Route = createLazyFileRoute("/_protected/_management/users")({
	component: UsersPage,
});

function UsersPage() {
	const router = useRouter();
	const { users: initialUsers, roles, profiles } = Route.useLoaderData();
	const [users, setUsers] = useState<UserData[]>(initialUsers);

	useEffect(() => {
		setUsers(initialUsers);
	}, [initialUsers]);

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<UserData | null>(null);

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

	const [grouping, setGrouping] = useState<GroupingState>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const [marketFilter, setMarketFilter] = useState("all");

	const fetchData = async () => {
		try {
			const usersData = await UserService.getUsers();
			setUsers(usersData);
		} catch (error) {
			console.error("Failed to refresh data", error);
		}
	};

	const handleOpenAdd = () => {
		setEditingUser(null);
		setIsFormOpen(true);
	};

	const handleOpenEdit = (user: UserData) => {
		setEditingUser(user);
		setIsFormOpen(true);
	};

	const handleSave = async (data: UserFormData) => {
		try {
			if (editingUser) {
				await UserService.updateUser(editingUser.id, data);
				toast.success("User berhasil diperbarui");
			} else {
				await UserService.createUser(data);
				toast.success("User berhasil ditambahkan");
			}
			await router.invalidate();
			await fetchData();
			setIsFormOpen(false);
		} catch (error) {
			console.error("Failed to save user", error);
			toast.error("Gagal menyimpan data user");
		}
	};

	const handleOpenDelete = (user: UserData) => {
		setUserToDelete(user);
		setIsDeleteModalOpen(true);
	};

	const confirmDelete = async () => {
		if (!userToDelete) return;
		try {
			await UserService.deleteUser(userToDelete.id);
			setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
			setIsDeleteModalOpen(false);
			setUserToDelete(null);
			toast.success("User berhasil dihapus");
		} catch (error) {
			console.error("Failed to delete user", error);
			toast.error("Gagal menghapus user");
		}
	};

	const columns = useMemo<ColumnDef<UserData>[]>(
		() => [
			{
				accessorKey: "name",
				header: "User",
				cell: ({ row }) => {
					const user = row.original;
					return (
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full border border-gray-100 shadow-sm overflow-hidden bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm">
								{user.image ? (
									<img
										src={`${import.meta.env.VITE_API_BASE_URL}/upload/user/${user.image}`}
										alt={user.name}
										className="w-full h-full object-cover"
									/>
								) : (
									user.name.charAt(0).toUpperCase()
								)}
							</div>
							<div>
								<div className="font-medium text-gray-900">{user.name}</div>
								<div className="text-xs text-gray-500 flex items-center gap-1">
									<Mail className="w-3 h-3" /> {user.email}
								</div>
								<div className="text-xs text-gray-400 font-mono mt-0.5">
									@{user.username}
								</div>
							</div>
						</div>
					);
				},
			},
			{
				id: "market",
				accessorFn: (row) => row.market?.name || row.market_id,
				header: "Outlet",
				cell: ({ row }) => {
					const user = row.original;
					const marketName =
						user.market?.name ||
						profiles.find((p) => p.id === user.market_id)?.name;

					if (user.role_id === "USER") {
						return (
							<div className="flex items-center gap-1.5 text-center">-</div>
						);
					}

					return (
						<div className="flex items-center gap-1.5">
							<Store className="w-4 h-4 text-brand-primary/60" />
							<span
								className={`text-sm font-medium ${marketName ? "text-gray-700" : "text-gray-400 italic"}`}
							>
								{marketName || "Tidak Ditempatkan"}
							</span>
						</div>
					);
				},
			},
			{
				id: "role",
				accessorFn: (row) => row.role?.name,
				header: "Role",
				cell: ({ getValue }) => {
					const name = getValue() as string;
					return (
						<div className="flex items-center gap-1.5">
							<Shield className="w-4 h-4 text-gray-400" />
							<span className="text-sm text-gray-700 font-medium">
								{name || "—"}
							</span>
						</div>
					);
				},
			},
			{
				id: "actions",
				header: () => <div className="text-right uppercase">Aksi</div>,
				cell: ({ row }) => {
					const user = row.original;
					const isSuperAdmin = isSuperAdminUser(user as any);

					return (
						<div className="flex justify-end gap-1">
							{!isSuperAdmin ? (
								<>
									<Button
										variant="ghost"
										size="icon"
										onClick={(e) => {
											e.stopPropagation();
											handleOpenEdit(user);
										}}
										title="Edit"
									>
										<Edit className="w-4 h-4 text-gray-500" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={(e) => {
											e.stopPropagation();
											handleOpenDelete(user);
										}}
										title="Hapus"
									>
										<Trash2 className="w-4 h-4 text-red-500" />
									</Button>
								</>
							) : (
								<div className="px-2 py-1 text-[10px] bg-gray-100 text-gray-400 rounded font-bold uppercase tracking-wider">
									Protected
								</div>
							)}
						</div>
					);
				},
			},
		],
		[],
	);

	const filteredUsers = useMemo(() => {
		return users.filter((user) => {
			const matchesSearch =
				user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
				user.username.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesRole =
				roleFilter === "all" || user.role?.name === roleFilter;
			const matchesMarket =
				marketFilter === "all" ||
				(marketFilter === "none"
					? !user.market
					: user.market?.name === marketFilter);

			return matchesSearch && matchesRole && matchesMarket;
		});
	}, [users, searchTerm, roleFilter, marketFilter]);

	return (
		<div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
			<AppHeader title="Kelola User">
				<Button onClick={handleOpenAdd} className="gap-2 font-semibold">
					<Plus className="w-4 h-4" /> Tambah User
				</Button>
			</AppHeader>

			<main className="flex-1 overflow-auto p-6 space-y-4">
				<div className="max-w-7xl mx-auto flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
					<div className="flex items-center gap-3 flex-1">
						<div className="relative w-full max-w-sm">
							<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<Input
								placeholder="Cari user (nama, email, username)..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-9 bg-gray-50/50 border-gray-200 focus:ring-brand-primary"
							/>
						</div>
						<Select
							placeholder="Filter Role"
							value={roleFilter}
							onChange={(val) => setRoleFilter(val as string)}
							options={[
								{ label: "Semua Role", value: "all" },
								...roles.map((r) => ({ label: r.name, value: r.name })),
							]}
							fullWidth={false}
							className="min-w-[150px]"
						/>
						<Select
							placeholder="Filter Outlet"
							value={marketFilter}
							onChange={(val) => setMarketFilter(val as string)}
							options={[
								{ label: "Semua Outlet", value: "all" },
								{ label: "Tanpa Outlet", value: "none" },
								...profiles.map((p) => ({ label: p.name, value: p.name })),
							]}
							fullWidth={false}
							className="min-w-[150px]"
						/>
						{(searchTerm || roleFilter !== "all" || marketFilter !== "all") && (
							<Button
								variant="ghost"
								onClick={() => {
									setSearchTerm("");
									setRoleFilter("all");
									setMarketFilter("all");
								}}
								className="text-gray-500 hover:text-gray-700 h-9 px-2 gap-1.5"
							>
								<X className="w-4 h-4" /> Hapus Filter
							</Button>
						)}
					</div>
					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
							<Filter className="w-4 h-4" /> Group by:
						</div>
						<Select
							placeholder="Group By"
							value={grouping[0] || "none"}
							onChange={(val) => {
								if (val === "none") {
									setGrouping([]);
								} else {
									setGrouping([val as string]);
								}
							}}
							options={[
								{ label: "Tanpa Grouping", value: "none" },
								{ label: "Role", value: "role" },
								{ label: "Outlet", value: "market" },
							]}
							fullWidth={false}
							className="min-w-[130px]"
						/>
					</div>
				</div>

				<div className="max-w-7xl mx-auto h-full flex flex-col">
					{users.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
							<UsersIcon className="w-16 h-16 mb-4 opacity-30" />
							<p className="text-lg font-medium text-gray-500">
								Belum ada user
							</p>
							<p className="text-sm text-gray-400 mb-6">
								Klik tombol "Tambah User" untuk menambahkan user pertama.
							</p>
							<Button onClick={handleOpenAdd} className="gap-2">
								<Plus className="w-4 h-4" /> Tambah User
							</Button>
						</div>
					) : (
						<DataTable
							columns={columns}
							data={filteredUsers}
							onRowClick={handleOpenEdit}
							grouping={grouping}
							onGroupingChange={setGrouping}
						/>
					)}
				</div>
			</main>

			<UserFormModal
				key={editingUser?.id || "new-user"}
				isOpen={isFormOpen}
				onClose={() => {
					setIsFormOpen(false);
					setEditingUser(null);
				}}
				onSave={handleSave}
				user={editingUser}
				roles={roles}
				profiles={profiles}
			/>

			<Modal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				title="Hapus User"
				description={`Apakah Anda yakin ingin menghapus user "${userToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
				variant="error"
				size="sm"
			>
				<div className="flex justify-end gap-3 w-full mt-6">
					<Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
						Batal
					</Button>
					<Button
						className="bg-red-600 hover:bg-red-700 text-white border-0"
						onClick={confirmDelete}
					>
						Hapus
					</Button>
				</div>
			</Modal>
		</div>
	);
}
