import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { UserService, type UserData } from "@/services/user.service";
import { getRoleId } from "@/hooks/useRoleAndPermission";
import type { User } from "@/types";
import { ProfileService } from "@/services/profile.service";
import type { MarketProfile } from "@/types";
import { toast } from "sonner";
import { User as UserIcon, ShieldCheck, Loader2 } from "lucide-react";

interface SupervisorAssignModalProps {
	isOpen: boolean;
	onClose: () => void;
	outlet: MarketProfile | null;
	onAssigned: () => void;
}

export function SupervisorAssignModal({
	isOpen,
	onClose,
	outlet,
	onAssigned,
}: SupervisorAssignModalProps) {
	const [users, setUsers] = useState<UserData[]>([]);
	const [selectedUserId, setSelectedUserId] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (isOpen) {
			fetchUsers();
			if (outlet?.id) {
				// We don't have current supervisor ID in outlet object yet
				// Ideally the backend returns current_supervisor
			}
		}
	}, [isOpen, outlet]);

	const fetchUsers = async () => {
		setIsLoading(true);
		try {
			const allUsers = await UserService.getUsers();
			// Filter for SPVR role (assuming role.id === 'SPVR' or similar)
			const supervisors = allUsers.filter(u =>
				getRoleId(u as User) === 'SPVR'
			);
			setUsers(supervisors);
		} catch (error) {
			console.error("Failed to fetch users", error);
			toast.error("Gagal mengambil daftar supervisor");
		} finally {
			setIsLoading(false);
		}
	};

	const handleAssign = async () => {
		if (!outlet || !selectedUserId) return;

		setIsSubmitting(true);
		try {
			await ProfileService.assignSupervisor(outlet.id, selectedUserId);
			toast.success(`Supervisor berhasil ditugaskan ke ${outlet.name}`);
			onAssigned();
			onClose();
		} catch (error) {
			console.error("Failed to assign supervisor", error);
			toast.error("Gagal menugaskan supervisor");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Tugaskan Supervisor"
			description={`Pilih supervisor yang akan bertanggung jawab untuk outlet "${outlet?.name}"`}
			size="md"
		>
			<div className="space-y-6 mt-4">
				<div className="flex items-center gap-4 p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/10">
					<div className="w-12 h-12 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
						<ShieldCheck className="w-6 h-6" />
					</div>
					<div>
						<div className="text-xs text-brand-primary font-bold uppercase tracking-wider">
							Target Outlet
						</div>
						<div className="text-lg font-bold text-gray-900">{outlet?.name}</div>
					</div>
				</div>

				<div className="space-y-2">
					<label className="block text-sm font-medium text-gray-700">
						Pilih Supervisor
					</label>
					{isLoading ? (
						<div className="flex items-center justify-center py-4 text-gray-400 gap-2">
							<Loader2 className="w-4 h-4 animate-spin" />
							Memuat daftar supervisor...
						</div>
					) : (
						<Select
							value={selectedUserId}
							onChange={(val) => setSelectedUserId(val as string)}
							placeholder="Pilih user..."
							options={users.map(u => ({
								label: `${u.name} (@${u.username})`,
								value: u.id
							}))}
						/>
					)}
					{users.length === 0 && !isLoading && (
						<p className="text-xs text-amber-600 mt-1">
							Tidak ada user dengan role Supervisor (SPVR) ditemukan.
						</p>
					)}
				</div>

				<div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
					<Button variant="outline" onClick={onClose}>
						Batal
					</Button>
					<Button
						onClick={handleAssign}
						disabled={!selectedUserId || isSubmitting}
						className="gap-2"
					>
						{isSubmitting ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<UserIcon className="w-4 h-4" />
						)}
						Tugaskan Supervisor
					</Button>
				</div>
			</div>
		</Modal>
	);
}
