import React, { useEffect, useState } from "react";
import { Modal, ModalFooter } from "./Modal";
import type { SelectOption } from "@/components/ui/select";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ProfileService } from "@/services/profile.service";
import { storage } from "@/utils/storage";
import type { MarketProfile } from "@/types";
import { useRoleAndPermission } from "@/hooks/useRoleAndPermission";

interface ManageMarketModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave?: () => void;
}

export const ManageMarketModal: React.FC<ManageMarketModalProps> = ({
	isOpen,
	onClose,
	onSave,
}) => {
	const [profiles, setProfiles] = useState<MarketProfile[]>([]);
	const [selectedMarketId, setSelectedMarketId] = useState<string>("");
	const [persistSelection, setPersistSelection] = useState(
		storage.isMarketPersisted(),
	);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const { isAdmin, isManager } = useRoleAndPermission();

	useEffect(() => {
		if (isOpen) {
			fetchProfiles();
			const savedId = storage.getMarketId();
			if (savedId) {
				setSelectedMarketId(savedId);
			}
		}
	}, [isOpen]);

	const fetchProfiles = async () => {
		setIsLoading(true);
		try {
			const data = await ProfileService.getMarketProfiles();
			setProfiles(data.filter((p) => p.type === "OUTLET"));
		} catch (error) {
			console.error("Failed to fetch market profiles", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSave = () => {
		setIsSaving(true);
		try {
			if (selectedMarketId) {
				storage.setMarketId(selectedMarketId, persistSelection);
			} else {
				storage.removeMarketId();
			}
			onSave?.();
			onClose();
		} catch (error) {
			console.error("Failed to save market ID", error);
		} finally {
			setIsSaving(false);
		}
	};

	const options: SelectOption[] = profiles.map((profile) => ({
		value: profile.id,
		label: profile.name,
	}));

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Kelola Market"
			description="Pilih market yang ingin Anda kelola. Pengaturan ini akan disimpan di perangkat ini."
		>
			<div className="space-y-4 py-4 text-black">
				<Select
					label="Pilih Market"
					placeholder={isLoading ? "Memuat data..." : "Pilih salah satu market"}
					options={options}
					value={selectedMarketId}
					onChange={(value: any) => setSelectedMarketId(String(value))}
					disabled={isLoading}
				/>

				{(isAdmin || isManager) && (
					<label className="flex items-center gap-2 cursor-pointer pt-2">
						<input
							type="checkbox"
							checked={persistSelection}
							onChange={(e) => setPersistSelection(e.target.checked)}
							className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
						/>
						<span className="text-sm text-gray-600">
							Simpan pilihan market (tetap ada meski logout)
						</span>
					</label>
				)}
			</div>

			<ModalFooter>
				<Button variant="ghost" onClick={onClose} disabled={isSaving}>
					Batal
				</Button>
				<Button onClick={handleSave} isLoading={isSaving} disabled={isLoading}>
					Simpan
				</Button>
			</ModalFooter>
		</Modal>
	);
};
