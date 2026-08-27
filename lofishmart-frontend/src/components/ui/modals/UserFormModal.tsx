import { useState, useEffect, useRef } from "react";
import { Modal } from "./Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type {
	UserData,
	UserFormData,
	RoleData,
	ProfileData,
} from "@/services/user.service";
import type { User } from "@/types";
import { Pencil, X, Camera } from "lucide-react";
import { ImageCropModal } from "./ImageCropModal";
import { useImageEditor } from "@/hooks/useImageEditor";
import { getRoleId, isSuperAdminUser } from "@/hooks/useRoleAndPermission";
import { toast } from "sonner";

interface UserFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (data: UserFormData) => Promise<void>;
	user: UserData | null;
	roles: RoleData[];
	profiles: ProfileData[];
}

export function UserFormModal({
	isOpen,
	onClose,
	onSave,
	user,
	roles,
	profiles,
}: UserFormModalProps) {
	const lastSyncedUserId = useRef<string | null | undefined>(undefined);
	const userPropRef = useRef<UserData | null>(user);

	// Keep ref in sync
	useEffect(() => {
		if (user) userPropRef.current = user;
	}, [user]);

	const [formData, setFormData] = useState<UserFormData>(() => {
		// Try to initialize directly on mount if user is available
		if (user) {
			const mIdVal = user.market?.id || user.market_id || "";
			const rIdVal = getRoleId(user as User);
			const marketId =
				mIdVal === null ||
				mIdVal === "null" ||
				mIdVal === "undefined" ||
				!mIdVal
					? ""
					: mIdVal.toString();
			const roleId =
				rIdVal === null ||
				rIdVal === "null" ||
				rIdVal === "undefined" ||
				!rIdVal
					? ""
					: rIdVal.toString();
			return {
				name: user.name || "",
				username: user.username || "",
				email: user.email || "",
				password: "",
				role_id: roleId,
				market_id: marketId,
				permissions: user.permissions || [],
			};
		}
		return {
			name: "",
			username: "",
			email: "",
			password: "",
			role_id: "",
			market_id: "",
			permissions: [],
		};
	});

	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const imageEditor = useImageEditor();
	const closeEditorRef = imageEditor.closeEditor;

	// Prop change sync (handles cases where prop updates after mount)
	useEffect(() => {
		if (!isOpen) {
			lastSyncedUserId.current = undefined;
			return;
		}

		const effectiveUser = user || userPropRef.current;
		const currentUserId = effectiveUser?.id || "new";

		if (lastSyncedUserId.current === currentUserId) return;

		if (effectiveUser) {
			const mIdVal = effectiveUser.market?.id || effectiveUser.market_id || "";
			const rIdVal = getRoleId(effectiveUser as User);
			const marketId =
				mIdVal === null ||
				mIdVal === "null" ||
				mIdVal === "undefined" ||
				!mIdVal
					? ""
					: mIdVal.toString();
			const roleId =
				rIdVal === null ||
				rIdVal === "null" ||
				rIdVal === "undefined" ||
				!rIdVal
					? ""
					: rIdVal.toString();

			setFormData({
				name: effectiveUser.name || "",
				username: effectiveUser.username || "",
				email: effectiveUser.email || "",
				password: "",
				role_id: roleId,
				market_id: marketId,
				permissions: effectiveUser.permissions || [],
			});

			setImagePreview(
				effectiveUser.image
					? `${import.meta.env.VITE_API_BASE_URL}/upload/user/${effectiveUser.image}`
					: null,
			);

			lastSyncedUserId.current = currentUserId;
		} else {
			setFormData({
				name: "",
				username: "",
				email: "",
				password: "",
				role_id: "",
				market_id: "",
				permissions: [],
			});
			setImagePreview(null);

			lastSyncedUserId.current = "new";
		}
	}, [user, isOpen]);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) imageEditor.openEditor(file);
		e.target.value = "";
	};

	const handleCropConfirm = async () => {
		const result = await imageEditor.confirmCrop();
		if (result) {
			setImagePreview(result.previewUrl);
			setImageFile(result.file);
		}
	};

	const handleRemoveImage = () => {
		setImagePreview(null);
		setImageFile(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const submitData: UserFormData = {
				...formData,
				image: imageFile || (imagePreview ? undefined : null), // null means delete, undefined means keep existing if no new file
			};

			// If we had an image preview but no image file, and it was a URL (not a blob/base64), we keep it
			if (imagePreview && !imageFile && imagePreview.startsWith("http")) {
				delete (submitData as any).image;
			}

			if (!submitData.password) {
				delete submitData.password;
			}
			if (!submitData.market_id) {
				submitData.market_id = null;
			}
			await onSave(submitData);
			onClose();
		} catch (error) {
			console.error("Failed to save user", error);
			toast.error("Gagal menyimpan user. Silakan coba lagi.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const isReadOnly = isSuperAdminUser(user);

	const renderProfilePhoto = () => (
		<div className="flex flex-col items-center mb-8">
			<div className="relative group">
				<div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
					{imagePreview ? (
						<img
							src={imagePreview}
							alt="Profile"
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="flex flex-col items-center text-gray-400">
							{formData.name ? (
								<span className="text-4xl font-bold text-brand-primary/40 uppercase">
									{formData.name.charAt(0)}
								</span>
							) : (
								<Camera className="w-10 h-10 opacity-20" />
							)}
						</div>
					)}

					{!isReadOnly && (
						<div
							className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
							onClick={() =>
								document.getElementById("user-image-input")?.click()
							}
						>
							<Pencil className="w-8 h-8 text-white" />
						</div>
					)}
				</div>

				{!isReadOnly && (
					<>
						<button
							type="button"
							onClick={() =>
								document.getElementById("user-image-input")?.click()
							}
							className="absolute bottom-1 right-1 p-2 bg-brand-primary text-white rounded-full shadow-md hover:bg-brand-dark transition-colors"
							title="Ubah Foto"
						>
							<Pencil className="w-4 h-4" />
						</button>

						{imagePreview && (
							<button
								type="button"
								onClick={handleRemoveImage}
								className="absolute -top-1 -right-1 p-1.5 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
								title="Hapus Foto"
							>
								<X className="w-3.5 h-3.5" />
							</button>
						)}
					</>
				)}
			</div>

			{!isReadOnly && (
				<div className="mt-3 flex flex-col items-center">
					<p className="text-xs text-gray-500 font-medium">
						Klik untuk mengubah foto profil
					</p>
					<input
						id="user-image-input"
						type="file"
						className="hidden"
						accept="image/*"
						onChange={handleImageChange}
					/>
				</div>
			)}
		</div>
	);

	const renderBasicInfo = () => (
		<div className="space-y-4">
			<div className="pb-2 border-b border-gray-100 mb-2">
				<h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
					Informasi Dasar
				</h4>
			</div>

			<Input
				label="Nama Lengkap"
				value={formData.name}
				onChange={(e) => setFormData({ ...formData, name: e.target.value })}
				required
				placeholder="Masukkan nama lengkap"
				disabled={isReadOnly}
			/>

			<Input
				label="Username"
				value={formData.username}
				onChange={(e) => setFormData({ ...formData, username: e.target.value })}
				required
				placeholder="Masukkan username"
				disabled={isReadOnly}
			/>

			<Input
				label="Email"
				type="email"
				value={formData.email}
				onChange={(e) => setFormData({ ...formData, email: e.target.value })}
				required
				placeholder="Masukkan email"
				disabled={isReadOnly}
			/>

			<Input
				label="Password"
				type="password"
				value={formData.password || ""}
				onChange={(e) => setFormData({ ...formData, password: e.target.value })}
				required={!user}
				placeholder={
					user ? "Kosongkan jika tidak ingin mengubah" : "Masukkan password"
				}
				disabled={isReadOnly}
			/>
		</div>
	);

	const renderOutletAssignment = () =>
		formData.role_id !== "USER" && (
			<div className="space-y-1.5">
				{(() => {
					const selectedRole = roles.find((r) => r.id === formData.role_id);
					const isSupervisor = selectedRole?.id === "SPVR";
					const isGudang = selectedRole?.id === "GDNG";
					const isCashier = selectedRole?.id === "KSR";
					const isScopedRole = isSupervisor || isCashier || selectedRole?.id === "MNGR";
					const isMarketRole = isSupervisor || isGudang || isScopedRole;

					let filteredProfiles: ProfileData[];
					let label: React.ReactNode;
					let placeholder: string;
					let emptyLabel: string;
					let warningMessage: string;

					if (isSupervisor) {
						filteredProfiles = profiles.filter(
							(p) => !p.type || p.type === "OUTLET",
						);
						label = (
							<span className="flex items-center gap-1.5">
								Penugasan Outlet <span className="text-red-500">*</span>
								<span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded uppercase tracking-wider">
									{selectedRole?.name}
								</span>
							</span>
						);
						placeholder = `Pilih outlet untuk ${selectedRole?.name}`;
						emptyLabel = "— Belum Ditugaskan —";
						warningMessage = `${selectedRole?.name} wajib ditugaskan ke outlet agar bisa mengakses inventori`;
					} else if (isGudang) {
						filteredProfiles = profiles.filter((p) => p.type === "GUDANG");
						label = (
							<span className="flex items-center gap-1.5">
								Penugasan Gudang <span className="text-red-500">*</span>
								<span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded uppercase tracking-wider">
									{selectedRole?.name}
								</span>
							</span>
						);
						placeholder = `Pilih gudang untuk ${selectedRole?.name}`;
						emptyLabel = "— Belum Ditugaskan —";
						warningMessage = `${selectedRole?.name} wajib ditugaskan ke gudang agar bisa mengakses inventori`;
					} else if (isScopedRole) {
						filteredProfiles = profiles.filter(
							(p) => !p.type || p.type === "OUTLET",
						);
						label = (
							<span className="flex items-center gap-1.5">
								Penugasan Outlets <span className="text-red-500">*</span>
								<span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded uppercase tracking-wider">
									{selectedRole?.name}
								</span>
							</span>
						);
						placeholder = `Pilih outlet untuk ${selectedRole?.name}`;
						emptyLabel = "— Belum Ditugaskan —";
						warningMessage = `${selectedRole?.name} wajib ditugaskan ke outlet agar bisa mengakses inventori`;
					} else {
						filteredProfiles = profiles;
						label = "Market / Outlet";
						placeholder = "Tidak ada (Akses Semua)";
						emptyLabel = "Tidak ada (Akses Semua)";
						warningMessage = "";
					}

					const hasNoAssignment =
						isMarketRole &&
						(!formData.market_id || formData.market_id === "");

					return (
						<>
							<label className="block text-sm font-medium text-gray-700">
								{label}
							</label>
							{isMarketRole && hasNoAssignment && (
								<div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
									⚠️ {warningMessage}
								</div>
							)}

							<Select
								value={formData.market_id || "__none__"}
								onChange={(val) =>
									setFormData({
										...formData,
										market_id: val === "__none__" ? "" : val.toString(),
									})
								}
								placeholder={
									isMarketRole
										? placeholder
										: "Tidak ada (Akses Semua)"
								}
								options={[
									{
										value: "__none__",
										label: isMarketRole ? emptyLabel : "Tidak ada (Akses Semua)",
									},
									...(filteredProfiles).map((p) => ({
										value: p.id,
										label: p.name,
									})),
								]}
								disabled={isReadOnly}
							/>

							{isMarketRole &&
								formData.market_id &&
								formData.market_id !== "__none__" && (
									<p className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
										✅ Akan ditempatkan di:{" "}
										<strong>
											{profiles.find((p) => p.id === formData.market_id)?.name}
										</strong>
									</p>
								)}
						</>
					);
				})()}
			</div>
		);

	const renderAccessAssignment = () => (
		<div className="space-y-6">
			<div className="pb-2 border-b border-gray-100 mb-2">
				<h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
					Akses & Penugasan
				</h4>
			</div>
			{/* Role — shadcn Select */}
			<div className="space-y-1.5">
				<label className="block text-sm font-medium text-gray-700">
					Role <span className="text-red-500">*</span>
				</label>
				<Select
					value={formData.role_id}
					onChange={(val) =>
						setFormData({ ...formData, role_id: val.toString() })
					}
					placeholder="Pilih Role"
					options={roles.map((r) => ({ value: r.id, label: r.name }))}
					disabled={isReadOnly}
				/>
			</div>
			{/* Market / Outlet — dengan context untuk SPVR/GDNG */}
			{renderOutletAssignment()}
		</div>
	);

	const renderFormActions = () => (
		<div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
			<Button
				type="button"
				variant="outline-primary"
				onClick={onClose}
				className="px-6"
			>
				{isReadOnly ? "Tutup" : "Batal"}
			</Button>
			{!isReadOnly && (
				<Button
					type="submit"
					disabled={isSubmitting}
					className="px-8 shadow-md hover:shadow-lg transition-shadow"
				>
					{isSubmitting
						? "Menyimpan..."
						: user
							? "Simpan Perubahan"
							: "Tambah User"}
				</Button>
			)}
		</div>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={
				user
					? isReadOnly
						? "Detail User (Protected)"
						: "Edit User"
					: "Tambah User"
			}
			size="3xl"
		>
			<form onSubmit={handleSubmit} className="mt-4">
				{renderProfilePhoto()}

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
					{renderBasicInfo()}
					{renderAccessAssignment()}
				</div>

				{renderFormActions()}
			</form>

			<ImageCropModal
				isOpen={imageEditor.isModalOpen}
				imageSrc={imageEditor.imageSrc}
				crop={imageEditor.crop}
				zoom={imageEditor.zoom}
				onCropChange={imageEditor.setCrop}
				onZoomChange={imageEditor.setZoom}
				onCropComplete={imageEditor.handleCropComplete}
				onConfirm={handleCropConfirm}
				onCancel={imageEditor.closeEditor}
			/>
		</Modal>
	);
}
