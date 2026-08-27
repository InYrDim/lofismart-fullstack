import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SupplierData, SupplierFormData } from "@/services/supplier.service";
import { toast } from "sonner";

interface SupplierFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (data: SupplierFormData) => Promise<void>;
	supplier: SupplierData | null;
}

export function SupplierFormModal({
	isOpen,
	onClose,
	onSave,
	supplier,
}: SupplierFormModalProps) {
	const [formData, setFormData] = useState<SupplierFormData>({
		name: "",
		corporation: "",
		email: "",
		phone_number: "",
		address: "",
		city: "",
		pos: "",
		bank: "",
		no_rek: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (supplier) {
			setFormData({
				name: supplier.name || "",
				corporation: supplier.corporation || "",
				email: supplier.email || "",
				phone_number: supplier.phone_number || "",
				address: supplier.address || "",
				city: supplier.city || "",
				pos: supplier.pos || "",
				bank: supplier.bank || "",
				no_rek: supplier.no_rek || "",
			});
		} else {
			setFormData({
				name: "",
				corporation: "",
				email: "",
				phone_number: "",
				address: "",
				city: "",
				pos: "",
				bank: "",
				no_rek: "",
			});
		}
	}, [supplier, isOpen]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			await onSave(formData);
			onClose();
		} catch (error) {
			console.error("Failed to save supplier", error);
			toast.error("Gagal menyimpan supplier. Silakan coba lagi.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={supplier ? "Edit Supplier" : "Tambah Supplier"}
			size="lg"
		>
			<form onSubmit={handleSubmit} className="space-y-4 mt-4">
				<div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
					<Input
						label="Nama Supplier"
						value={formData.name}
						onChange={(e) => setFormData({ ...formData, name: e.target.value })}
						required
						placeholder="Masukkan nama supplier"
					/>

					<Input
						label="Perusahaan"
						value={formData.corporation}
						onChange={(e) =>
							setFormData({ ...formData, corporation: e.target.value })
						}
						placeholder="Masukkan nama perusahaan"
					/>

					<Input
						label="Email"
						type="email"
						value={formData.email}
						onChange={(e) =>
							setFormData({ ...formData, email: e.target.value })
						}
						placeholder="Masukkan email"
					/>

					<Input
						label="Nomor Telepon"
						value={formData.phone_number}
						onChange={(e) =>
							setFormData({ ...formData, phone_number: e.target.value })
						}
						placeholder="Masukkan nomor telepon"
					/>

					<Input
						label="Alamat"
						value={formData.address}
						onChange={(e) =>
							setFormData({ ...formData, address: e.target.value })
						}
						placeholder="Masukkan alamat"
					/>

					<div className="grid grid-cols-2 gap-4">
						<Input
							label="Kota"
							value={formData.city}
							onChange={(e) =>
								setFormData({ ...formData, city: e.target.value })
							}
							placeholder="Masukkan kota"
						/>
						<Input
							label="Kode Pos"
							value={formData.pos}
							onChange={(e) =>
								setFormData({ ...formData, pos: e.target.value })
							}
							placeholder="Masukkan kode pos"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<Input
							label="Bank"
							value={formData.bank}
							onChange={(e) =>
								setFormData({ ...formData, bank: e.target.value })
							}
							placeholder="Nama Bank"
						/>
						<Input
							label="No. Rekening"
							value={formData.no_rek}
							onChange={(e) =>
								setFormData({ ...formData, no_rek: e.target.value })
							}
							placeholder="Nomor Rekening"
						/>
					</div>
				</div>

				<div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
					<Button type="button" variant="outline-primary" onClick={onClose}>
						Batal
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Menyimpan..." : "Simpan"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
