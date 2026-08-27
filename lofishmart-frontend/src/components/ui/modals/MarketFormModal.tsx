import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal, ModalFooter } from "./Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MarketProfile } from "@/types";
import type { MarketFormData } from "@/services/profile.service";

interface MarketFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (data: MarketFormData) => Promise<void>;
	market?: MarketProfile | null;
}

export const MarketFormModal: React.FC<MarketFormModalProps> = ({
	isOpen,
	onClose,
	onSave,
	market,
}) => {
	const isEdit = !!market;
	const [isSaving, setIsSaving] = useState(false);
	const [form, setForm] = useState<MarketFormData>({
		name: "",
		address: "",
		city: "",
		phone_number: "",
		maps: "",
		pos: "",
		timezone: "Asia/Jakarta",
		time_dif: 0,
	});

	useEffect(() => {
		if (isOpen) {
			if (market) {
				setForm({
					name: market.name || "",
					address: market.address || "",
					city: market.city || "",
					phone_number: market.phone_number || "",
					maps: market.maps || "",
					pos: market.pos || "",
					timezone: market.timezone || "Asia/Jakarta",
					time_dif: market.time_dif || 0,
				});
			} else {
				setForm({
					name: "",
					address: "",
					city: "",
					phone_number: "",
					maps: "",
					pos: "",
					timezone: "Asia/Jakarta",
					time_dif: 0,
				});
			}
		}
	}, [isOpen, market]);

	const handleChange = (
		field: keyof MarketFormData,
		value: string | number,
	) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async () => {
		if (!form.name.trim()) return;
		setIsSaving(true);
		try {
			await onSave(form);
			onClose();
		} catch (error) {
			console.error("Failed to save market:", error);
			toast.error("Gagal menyimpan market. Silakan coba lagi.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={isEdit ? "Edit Market" : "Tambah Market"}
			description={
				isEdit
					? "Ubah informasi market yang sudah ada."
					: "Isi data market baru untuk ditambahkan."
			}
			size="xl"
		>
			<div className="space-y-4 py-2 text-black">
				<Input
					label="Nama Market *"
					placeholder="Contoh: Lofish Mart Pusat"
					value={form.name}
					onChange={(e) => handleChange("name", e.target.value)}
				/>
				<Input
					label="Alamat"
					placeholder="Alamat lengkap market"
					value={form.address}
					onChange={(e) => handleChange("address", e.target.value)}
				/>
				<div className="grid grid-cols-2 gap-4">
					<Input
						label="Kota"
						placeholder="Contoh: Jakarta"
						value={form.city}
						onChange={(e) => handleChange("city", e.target.value)}
					/>
					<Input
						label="No. Telepon"
						placeholder="08xxxxxxxxxx"
						value={form.phone_number}
						onChange={(e) => handleChange("phone_number", e.target.value)}
					/>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<Input
						label="Kode POS"
						placeholder="Contoh: 12345"
						value={form.pos}
						onChange={(e) => handleChange("pos", e.target.value)}
					/>
					<Input
						label="Timezone"
						placeholder="Asia/Jakarta"
						value={form.timezone}
						onChange={(e) => handleChange("timezone", e.target.value)}
					/>
				</div>
				<Input
					label="Link Google Maps"
					placeholder="https://maps.google.com/..."
					value={form.maps}
					onChange={(e) => handleChange("maps", e.target.value)}
				/>
			</div>

			<ModalFooter>
				<Button variant="ghost" onClick={onClose} disabled={isSaving}>
					Batal
				</Button>
				<Button
					onClick={handleSubmit}
					isLoading={isSaving}
					disabled={!form.name.trim()}
				>
					{isEdit ? "Simpan Perubahan" : "Tambah Market"}
				</Button>
			</ModalFooter>
		</Modal>
	);
};
