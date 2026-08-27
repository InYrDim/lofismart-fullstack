import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RoleData, RoleFormData, PermissionData } from "@/services/user.service";
import { Shield, ChevronDown, ChevronUp, Info } from "lucide-react";

interface RoleFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (data: RoleFormData, selectedPermissions: string[]) => Promise<void>;
	role: RoleData | null;
	allPermissions: PermissionData[];
}

export function RoleFormModal({
	isOpen,
	onClose,
	onSave,
	role,
	allPermissions,
}: RoleFormModalProps) {
	const [formData, setFormData] = useState<RoleFormData>({
		name: "",
		guard_name: "web",
	});
	const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPermissions, setShowPermissions] = useState(true);

	useEffect(() => {
		if (isOpen) {
			if (role) {
				setFormData({
					id: role.id,
					name: role.name,
					guard_name: role.guard_name || "web",
				});
				const perms = role.hasPermits?.map(p => p.permission.id) || [];
				setSelectedPermissions(perms);
			} else {
				setFormData({
					name: "",
					guard_name: "web",
				});
				setSelectedPermissions([]);
			}
		}
	}, [role, isOpen]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			await onSave(formData, selectedPermissions);
			onClose();
		} catch (error) {
			console.error("Failed to save role", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const togglePermission = (id: string) => {
		setSelectedPermissions((prev) =>
			prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
		);
	};

	const isReadOnly = role?.id === "ADMN";

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={role ? (isReadOnly ? "Detail Role (Protected)" : "Edit Role") : "Tambah Role"}
			size="2xl"
		>
			<form onSubmit={handleSubmit} className="mt-4 space-y-6">
				<div className="space-y-4">
					<div className="pb-2 border-b border-gray-100 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Shield className="w-4 h-4 text-brand-primary" />
							<h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Informasi Role</h4>
						</div>
						{role?.id && (
							<span className="text-[10px] font-mono font-bold bg-gray-100 text-gray-400 px-2 py-0.5 rounded uppercase">
								ID: {role.id}
							</span>
						)}
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Input
							label="Nama Role"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							required
							placeholder="e.g. Supervisor"
							disabled={isReadOnly}
						/>
						<Input
							label="Guard Name"
							value={formData.guard_name}
							onChange={(e) => setFormData({ ...formData, guard_name: e.target.value })}
							required
							placeholder="e.g. web"
							disabled={isReadOnly}
						/>
					</div>
				</div>

				<div className="space-y-4">
					<button
						type="button"
						onClick={() => setShowPermissions(!showPermissions)}
						className="flex items-center justify-between w-full pb-2 border-b border-gray-100 group"
					>
						<div className="flex items-center gap-2">
							<Shield className="w-4 h-4 text-brand-primary" />
							<h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Permission / Hak Akses</h4>
						</div>
						{showPermissions ? (
							<ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-brand-primary" />
						) : (
							<ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-brand-primary" />
						)}
					</button>

					{showPermissions && (
						<div className="animate-in slide-in-from-top-1 fade-in duration-300">
							<div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-4 flex gap-3">
								<Info className="w-5 h-5 text-blue-500 shrink-0" />
								<p className="text-xs text-blue-700 leading-relaxed font-medium">
									Pilih permission yang akan diberikan ke role ini. Semua user dengan role ini akan mewarisi permission yang dipilih secara otomatis.
								</p>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1">
								{allPermissions.map((perm) => (
									<label
										key={perm.id}
										className={`
											flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer
											${selectedPermissions.includes(perm.id)
												? "bg-brand-primary/5 border-brand-primary/20 text-brand-primary"
												: "bg-white border-gray-100 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
											}
											${isReadOnly ? "opacity-70 cursor-default" : ""}
										`}
									>
										<input
											type="checkbox"
											className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary/20"
											checked={selectedPermissions.includes(perm.id)}
											onChange={() => !isReadOnly && togglePermission(perm.id)}
											disabled={isReadOnly}
										/>
										<div className="flex flex-col">
											<span className="text-sm font-bold truncate" title={perm.name}>
												{perm.name}
											</span>
											<span className="text-[10px] opacity-60 uppercase font-mono">
												{perm.guard_name}
											</span>
										</div>
									</label>
								))}
							</div>
						</div>
					)}
				</div>

				<div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
					<Button type="button" variant="outline-primary" onClick={onClose} className="px-6">
						{isReadOnly ? "Tutup" : "Batal"}
					</Button>
					{!isReadOnly && (
						<Button type="submit" disabled={isSubmitting} className="px-8 shadow-md">
							{isSubmitting ? "Menyimpan..." : (role ? "Simpan Perubahan" : "Tambah Role")}
						</Button>
					)}
				</div>
			</form>
		</Modal>
	);
}
