import { useState, useMemo, useEffect } from "react";
import { createLazyFileRoute, useRouter } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { ProfileService } from "@/services/profile.service";
import type { MarketFormData } from "@/services/profile.service";
import type { MarketProfile } from "@/types";
import { OutletFormModal } from "@/components/ui/modals/OutletFormModal";
import { Modal } from "@/components/ui/modals/Modal";
import {
	Plus,
	Edit,
	Trash2,
	Store,
	Warehouse,
	Search as SearchIcon,
	MapPin,
	Phone,
	X,
	ExternalLink,
	LayoutGrid,
	Table,
	UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { SupervisorAssignModal } from "@/components/ui/modals/SupervisorAssignModal";

export const Route = createLazyFileRoute(
	"/_protected/_management/outletandgudang",
)({
	component: OutletAndGudangManagementPage,
});

function OutletAndGudangManagementPage() {
	const router = useRouter();
	const { outlets: initialOutlets } = Route.useLoaderData();

	const [profiles, setProfiles] = useState<MarketProfile[]>(initialOutlets);
	const [activeTab, setActiveTab] = useState<"OUTLET" | "GUDANG">("OUTLET");

	useEffect(() => {
		setProfiles(initialOutlets);
	}, [initialOutlets]);

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingProfile, setEditingProfile] = useState<MarketProfile | null>(
		null,
	);

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [profileToDelete, setProfileToDelete] = useState<MarketProfile | null>(
		null,
	);

	const [searchTerm, setSearchTerm] = useState("");
	const [viewMode, setViewMode] = useState<"table" | "grid">("table");

	const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
	const [profileToAssign, setProfileToAssign] = useState<MarketProfile | null>(
		null,
	);

	const fetchData = async () => {
		try {
			const data = await ProfileService.getMarketProfiles();
			setProfiles(data);
		} catch (error) {
			console.error("Failed to refresh data", error);
		}
	};

	const handleOpenAdd = () => {
		setEditingProfile(null);
		setIsFormOpen(true);
	};

	const handleOpenEdit = (profile: MarketProfile) => {
		setEditingProfile(profile);
		setIsFormOpen(true);
	};

	const handleSave = async (data: MarketFormData) => {
		const finalData = { ...data };
		const type = finalData.type;

		try {
			if (editingProfile) {
				await ProfileService.updateMarket(editingProfile.id, finalData);
				toast.success(
					`${type === "OUTLET" ? "Outlet" : "Gudang"} berhasil diperbarui`,
				);
			} else {
				await ProfileService.createMarket(finalData);
				toast.success(
					`${type === "OUTLET" ? "Outlet" : "Gudang"} berhasil ditambahkan`,
				);
			}
			await router.invalidate();
			await fetchData();
			setIsFormOpen(false);
		} catch (error) {
			console.error("Failed to save profile", error);
			toast.error(
				`Gagal menyimpan data ${type === "OUTLET" ? "outlet" : "gudang"}`,
			);
		}
	};

	const handleOpenDelete = (profile: MarketProfile) => {
		setProfileToDelete(profile);
		setIsDeleteModalOpen(true);
	};

	const confirmDelete = async () => {
		if (!profileToDelete) return;
		try {
			await ProfileService.deleteMarket(profileToDelete.id);
			setProfiles((prev) => prev.filter((o) => o.id !== profileToDelete.id));
			setIsDeleteModalOpen(false);
			setProfileToDelete(null);
			toast.success(
				`${activeTab === "OUTLET" ? "Outlet" : "Gudang"} berhasil dihapus`,
			);
		} catch (error) {
			console.error("Failed to delete profile", error);
			toast.error(
				`Gagal menghapus ${activeTab === "OUTLET" ? "outlet" : "gudang"}`,
			);
		}
	};

	const columns = useMemo<ColumnDef<MarketProfile>[]>(
		() => [
			{
				accessorKey: "name",
				header: activeTab === "OUTLET" ? "Outlet" : "Gudang",
				cell: ({ row }) => {
					const profile = row.original;
					return (
						<div className="flex items-center gap-3">
							<div
								className={`w-10 h-10 rounded-lg border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center ${
									activeTab === "OUTLET"
										? "bg-brand-primary/10 text-brand-primary"
										: "bg-amber-100 text-amber-700"
								}`}
							>
								{activeTab === "OUTLET" ? (
									<Store className="w-5 h-5" />
								) : (
									<Warehouse className="w-5 h-5" />
								)}
							</div>
							<div>
								<div className="font-medium text-gray-900">{profile.name}</div>
								<div className="text-xs text-gray-500 flex items-center gap-1">
									<MapPin className="w-3 h-3" /> {profile.city || "—"}
								</div>
							</div>
						</div>
					);
				},
			},
			{
				accessorKey: "phone_number",
				header: "Kontak",
				cell: ({ getValue }) => {
					const phone = getValue() as string;
					return (
						<div className="flex items-center gap-1.5 text-sm text-gray-600">
							<Phone className="w-3.5 h-3.5 opacity-40" />
							{phone || "—"}
						</div>
					);
				},
			},
			{
				accessorKey: "address",
				header: "Alamat",
				cell: ({ row }) => {
					const profile = row.original;
					return (
						<div className="max-w-[200px] truncate text-sm text-gray-600 flex items-center gap-2">
							<span className="truncate">{profile.address || "—"}</span>
							{profile.maps && (
								<a
									href={profile.maps}
									target="_blank"
									rel="noopener noreferrer"
									onClick={(e) => e.stopPropagation()}
									className={`${activeTab === "OUTLET" ? "text-brand-primary hover:text-brand-dark" : "text-amber-700 hover:text-amber-900"}`}
									title="Lihat di Maps"
								>
									<ExternalLink className="w-3 h-3" />
								</a>
							)}
						</div>
					);
				},
			},
			{
				id: "actions",
				header: () => <div className="text-right uppercase">Aksi</div>,
				cell: ({ row }) => {
					const profile = row.original;
					return (
						<div className="flex justify-end gap-1">
							{activeTab === "OUTLET" && (
								<Button
									variant="ghost"
									size="icon"
									onClick={(e) => {
										e.stopPropagation();
										setProfileToAssign(profile);
										setIsAssignModalOpen(true);
									}}
									title="Tugaskan Supervisor"
								>
									<UserPlus className="w-4 h-4 text-brand-primary" />
								</Button>
							)}
							<Button
								variant="ghost"
								size="icon"
								onClick={(e) => {
									e.stopPropagation();
									handleOpenEdit(profile);
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
									handleOpenDelete(profile);
								}}
								title="Hapus"
							>
								<Trash2 className="w-4 h-4 text-red-500" />
							</Button>
						</div>
					);
				},
			},
		],
		[activeTab],
	);

	const filteredProfiles = useMemo(() => {
		return profiles
			.filter((p) => p.type === activeTab)
			.filter((p) => {
				const matchesSearch =
					p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(p.city || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
					(p.address || "").toLowerCase().includes(searchTerm.toLowerCase());

				return matchesSearch;
			});
	}, [profiles, activeTab, searchTerm]);

	const renderGridView = () => {
		if (filteredProfiles.length === 0) return null;

		return (
			<div className="space-y-6">
				<div className="bg-white flex items-center justify-between p-3 border-b border-gray-200/60 rounded-xl">
					<div className="flex items-center gap-3.5">
						<div>
							<h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
								{activeTab === "OUTLET"
									? "Outlet / Market"
									: "Gudang / Inventory"}
							</h2>
							<p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-0.5">
								Manajemen {activeTab === "OUTLET" ? "Outlet" : "Gudang"} Aktif
							</p>
						</div>
					</div>
					<div
						className={`px-4 py-1.5 rounded-full text-xs font-black shadow-sm flex items-center gap-2 ${
							activeTab === "OUTLET"
								? "bg-emerald-100 text-emerald-700"
								: "bg-amber-100 text-amber-700"
						}`}
					>
						<span className="opacity-50 uppercase tracking-wider">Total:</span>
						{filteredProfiles.length} Units
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
					{filteredProfiles.map((profile) => (
						<div
							key={profile.id}
							className={`group relative bg-white rounded-2xl border-2 transition-all hover:shadow-md ${
								activeTab === "OUTLET"
									? "border-emerald-50 hover:border-emerald-200"
									: "border-amber-50 hover:border-amber-200"
							}`}
						>
							<div
								className={`p-5 rounded-t-xl flex items-start justify-between ${
									activeTab === "OUTLET" ? "bg-emerald-50/50" : "bg-amber-50/50"
								}`}
							>
								<div className="flex gap-4">
									<div
										className={`w-12 h-12 rounded-xl shadow-sm flex items-center justify-center ${
											activeTab === "OUTLET"
												? "bg-emerald-100 text-emerald-700"
												: "bg-amber-100 text-amber-700"
										}`}
									>
										{activeTab === "OUTLET" ? (
											<Store className="w-6 h-6" />
										) : (
											<Warehouse className="w-6 h-6" />
										)}
									</div>
									<div>
										<h3 className="font-bold text-gray-900 text-lg">
											{profile.name}
										</h3>
										<div className="flex items-center gap-1.5 mt-0.5">
											<span className="text-xs text-gray-500 font-medium flex items-center gap-1">
												<MapPin className="w-3 h-3" /> {profile.city || "—"}
											</span>
										</div>
									</div>
								</div>

								<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleOpenEdit(profile)}
										className="h-8 w-8 hover:bg-white/80"
									>
										<Edit className="w-4 h-4 text-gray-500" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleOpenDelete(profile)}
										className="h-8 w-8 hover:bg-red-50"
									>
										<Trash2 className="w-4 h-4 text-red-500" />
									</Button>
								</div>
							</div>

							<div className="p-5 space-y-3">
								<div className="flex items-start gap-3">
									<MapPin className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
									<p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
										{profile.address || "Belum ada alamat"}
									</p>
								</div>

								<div className="flex items-center justify-between pt-3 border-t border-gray-50">
									<div className="flex items-center gap-2 text-sm text-gray-600">
										<Phone className="w-4 h-4 text-gray-400" />
										{profile.phone_number || "—"}
									</div>

									{profile.maps && (
										<a
											href={profile.maps}
											target="_blank"
											rel="noopener noreferrer"
											className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
												activeTab === "OUTLET"
													? "text-emerald-700 hover:text-emerald-900"
													: "text-amber-700 hover:text-amber-900"
											}`}
										>
											Lihat Rute <ExternalLink className="w-3 h-3" />
										</a>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	};

	const renderToolbar = () => (
		<div className="mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
			<div className="flex p-1 bg-gray-100 rounded-lg shrink-0">
				<button
					onClick={() => setActiveTab("OUTLET")}
					className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${
						activeTab === "OUTLET"
							? "bg-white shadow-sm text-brand-primary"
							: "text-gray-500 hover:text-gray-700"
					}`}
				>
					<Store className="w-4 h-4" /> Outlet
				</button>
				<button
					onClick={() => setActiveTab("GUDANG")}
					className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${
						activeTab === "GUDANG"
							? "bg-white shadow-sm text-amber-700"
							: "text-gray-500 hover:text-gray-700"
					}`}
				>
					<Warehouse className="w-4 h-4" /> Gudang
				</button>
			</div>

			<div className="flex items-center gap-3 flex-1">
				<div className="relative w-full max-w-sm">
					<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
					<Input
						placeholder={`Cari ${activeTab === "OUTLET" ? "outlet" : "gudang"}...`}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-9 bg-gray-50/50 border-gray-200 focus:ring-brand-primary"
					/>
				</div>
				{searchTerm && (
					<Button
						variant="ghost"
						onClick={() => setSearchTerm("")}
						className="text-gray-500 hover:text-gray-700 h-9 px-2 gap-1.5"
					>
						<X className="w-4 h-4" />
					</Button>
				)}
			</div>

			<div className="flex items-center p-1 bg-gray-100 rounded-lg shrink-0">
				<button
					onClick={() => setViewMode("table")}
					className={`p-2 rounded-md transition-all ${
						viewMode === "table"
							? "bg-white shadow-sm text-brand-primary"
							: "text-gray-500 hover:text-gray-700"
					}`}
					title="Table View"
				>
					<Table className="w-4 h-4" />
				</button>
				<button
					onClick={() => setViewMode("grid")}
					className={`p-2 rounded-md transition-all ${
						viewMode === "grid"
							? "bg-white shadow-sm text-brand-primary"
							: "text-gray-500 hover:text-gray-700"
					}`}
					title="Grid View"
				>
					<LayoutGrid className="w-4 h-4" />
				</button>
			</div>
		</div>
	);

	const renderEmptyState = () => (
		<div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
			{activeTab === "OUTLET" ? (
				<Store className="w-16 h-16 mb-4 opacity-30" />
			) : (
				<Warehouse className="w-16 h-16 mb-4 opacity-30" />
			)}
			<p className="text-lg font-medium text-gray-500">
				Belum ada {activeTab === "OUTLET" ? "outlet" : "gudang"}
			</p>
			<p className="text-sm text-gray-400 mb-6">
				Klik tombol "Tambah" untuk menambahkan{" "}
				{activeTab === "OUTLET" ? "outlet" : "gudang"} pertama.
			</p>
			<Button onClick={handleOpenAdd} className="gap-2">
				<Plus className="w-4 h-4" /> Tambah{" "}
				{activeTab === "OUTLET" ? "Outlet" : "Gudang"}
			</Button>
		</div>
	);

	const renderMainContent = () => {
		if (filteredProfiles.length === 0 && searchTerm === "")
			return renderEmptyState();

		return viewMode === "table" ? (
			<DataTable
				columns={columns}
				data={filteredProfiles}
				onRowClick={handleOpenEdit}
			/>
		) : (
			renderGridView()
		);
	};

	const renderModals = () => (
		<>
			<OutletFormModal
				key={editingProfile?.id || `new-${activeTab}`}
				isOpen={isFormOpen}
				onClose={() => {
					setIsFormOpen(false);
					setEditingProfile(null);
				}}
				onSave={handleSave}
				outlet={editingProfile}
			/>

			<Modal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				title={`Hapus ${activeTab === "OUTLET" ? "Outlet" : "Gudang"}`}
				description={`Apakah Anda yakin ingin menghapus ${activeTab === "OUTLET" ? "outlet" : "gudang"} "${profileToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
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

			<SupervisorAssignModal
				isOpen={isAssignModalOpen}
				onClose={() => setIsAssignModalOpen(false)}
				outlet={profileToAssign}
				onAssigned={fetchData}
			/>
		</>
	);

	return (
		<div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
			<AppHeader title="Outlet & Gudang">
				<Button onClick={handleOpenAdd} className="gap-2 font-semibold">
					<Plus className="w-4 h-4" /> Tambah{" "}
					{activeTab === "OUTLET" ? "Outlet" : "Gudang"}
				</Button>
			</AppHeader>

			<main className="flex-1 overflow-auto p-6 space-y-4">
				{renderToolbar()}

				<div className="mx-auto w-full h-full flex flex-col">
					{renderMainContent()}
				</div>
			</main>

			{renderModals()}
		</div>
	);
}
