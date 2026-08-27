import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Modal } from "./Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { MarketProfile } from "@/types";
import type { MarketFormData } from "@/services/profile.service";

interface OutletFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (data: MarketFormData) => Promise<void>;
	outlet: MarketProfile | null;
}

export function OutletFormModal({
	isOpen,
	onClose,
	onSave,
	outlet,
}: OutletFormModalProps) {
	const [formData, setFormData] = useState<MarketFormData>({
		name: "",
		address: "",
		maps: "",
		city: "",
		pos: "",
		timezone: "Asia/Jakarta",
		time_dif: 0,
		phone_number: "",
		type: "OUTLET",
	});

	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (isOpen && outlet) {
			setFormData({
				name: outlet.name || "",
				address: outlet.address || "",
				maps: outlet.maps || "",
				city: outlet.city || "",
				pos: outlet.pos || "",
				timezone: outlet.timezone || "Asia/Jakarta",
				time_dif: outlet.time_dif || 0,
				phone_number: outlet.phone_number || "",
				type: outlet.type || "OUTLET",
			});
		} else if (isOpen && !outlet) {
			setFormData({
				name: "",
				address: "",
				maps: "",
				city: "",
				pos: "",
				timezone: "Asia/Jakarta",
				time_dif: 0,
				phone_number: "",
				type: "OUTLET",
			});
		}
	}, [isOpen, outlet]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		console.log(formData);

		setIsSubmitting(true);
		try {
			await onSave(formData);
			onClose();
		} catch (error) {
			console.error("Failed to save outlet", error);
			toast.error("Gagal menyimpan outlet. Silakan coba lagi.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderBasicInfo = () => (
		<div className="space-y-4">
			<div className="pb-2 border-b border-gray-100 mb-2">
				<h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
					Informasi Dasar
				</h4>
			</div>

			<div className="space-y-1.5">
				<label className="block text-sm font-medium text-gray-700">
					Tipe Lokasi
				</label>
				<Select
					value={formData.type || "OUTLET"}
					onChange={(val) =>
						setFormData({ ...formData, type: val as "GUDANG" | "OUTLET" })
					}
					options={[
						{ label: "Outlet / Market", value: "OUTLET" },
						{ label: "Gudang / Inventory", value: "GUDANG" },
					]}
				/>
			</div>

			<Input
				label="Nama Outlet"
				value={formData.name}
				onChange={(e) => setFormData({ ...formData, name: e.target.value })}
				required
				placeholder="Masukkan nama outlet"
			/>

			<Input
				label="Nomor Telepon"
				value={formData.phone_number || ""}
				onChange={(e) =>
					setFormData({ ...formData, phone_number: e.target.value })
				}
				placeholder="Masukkan nomor telepon"
			/>

			<div className="grid grid-cols-2 gap-4">
				<Input
					label="Kota"
					value={formData.city || ""}
					onChange={(e) => setFormData({ ...formData, city: e.target.value })}
					placeholder="Masukkan kota"
				/>
				<Input
					label="Kode Pos"
					value={formData.pos || ""}
					onChange={(e) => setFormData({ ...formData, pos: e.target.value })}
					placeholder="Masukkan kode pos"
				/>
			</div>
		</div>
	);

	const renderLocationInfo = () => (
		<div className="space-y-4">
			<div className="pb-2 border-b border-gray-100 mb-2">
				<h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
					Lokasi & Waktu
				</h4>
			</div>

			<Input
				label="Alamat Lengkap"
				value={formData.address || ""}
				onChange={(e) => setFormData({ ...formData, address: e.target.value })}
				placeholder="Masukkan alamat lengkap"
			/>

			<Input
				label="URL Google Maps"
				value={formData.maps || ""}
				onChange={(e) => setFormData({ ...formData, maps: e.target.value })}
				placeholder="Masukkan link Google Maps"
			/>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-1.5">
					<label className="block text-sm font-medium text-gray-700">
						Timezone
					</label>
					<Select
						value={formData.timezone || "Asia/Jakarta"}
						onChange={(val) =>
							setFormData({ ...formData, timezone: val as string })
						}
						options={[
							{ label: "WIB (UTC+7)", value: "Asia/Jakarta" },
							{ label: "WITA (UTC+8)", value: "Asia/Makassar" },
							{ label: "WIT (UTC+9)", value: "Asia/Jayapura" },
						]}
					/>
				</div>
				<Input
					label="Time Diff (Hours)"
					type="number"
					value={formData.time_dif || 0}
					onChange={(e) =>
						setFormData({
							...formData,
							time_dif: parseInt(e.target.value) || 0,
						})
					}
				/>
			</div>
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
				Batal
			</Button>
			<Button
				type="submit"
				disabled={isSubmitting}
				className="px-8 shadow-md hover:shadow-lg transition-shadow"
			>
				{isSubmitting
					? "Menyimpan..."
					: outlet
						? "Simpan Perubahan"
						: "Tambah Outlet"}
			</Button>
		</div>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={outlet ? "Edit Outlet" : "Tambah Outlet"}
			size="2xl"
		>
			<form onSubmit={handleSubmit} className="mt-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
					{renderBasicInfo()}
					{renderLocationInfo()}
				</div>

				{renderFormActions()}
			</form>
		</Modal>
	);
}
