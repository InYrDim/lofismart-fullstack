import React, { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@/components/ui/modals/Modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { UserService } from "@/services/user.service";
import { TransactionService } from "@/services/transaction.service";
import type { Transaction } from "@/types";

interface TransactionEditModalProps {
	isOpen: boolean;
	transaction: Transaction | null;
	onClose: () => void;
	onSave: (id: string, updates: Partial<Transaction>) => Promise<void>;
}

export const TransactionEditModal: React.FC<TransactionEditModalProps> = ({
	isOpen,
	transaction,
	onClose,
	onSave,
}) => {
	const [isPaid, setIsPaid] = useState<string>("default");
	const [note, setNote] = useState<string>("");
	const [paymentMethodId, setPaymentMethodId] = useState<string>("");
	const [memberId, setMemberId] = useState<string>("");
	
	const [isSaving, setIsSaving] = useState(false);
	
	const [paymentOptions, setPaymentOptions] = useState<{label: string, value: string}[]>([]);
	const [memberOptions, setMemberOptions] = useState<{label: string, value: string}[]>([]);

	// Fetch reference data when modal first opens
	useEffect(() => {
		if (isOpen) {
			const fetchOptions = async () => {
				try {
					const [payments, members] = await Promise.all([
						TransactionService.getPaymentMethods(),
						UserService.getMembers(),
					]);
					
					setPaymentOptions(
						payments.map((p) => ({ label: p.name, value: p.id }))
					);
					
					// Add "Umum" as empty/null member option at top
					const memOpts = members.map((m) => ({ label: m.name, value: m.id }));
					setMemberOptions([{ label: "Umum (Tidak ada member)", value: "" }, ...memOpts]);
				} catch (err) {
					console.error("Failed to fetch options for edit modal", err);
				}
			};
			fetchOptions();
		}
	}, [isOpen]);

	// Reset form when modal opens or transaction changes
	useEffect(() => {
		if (isOpen && transaction) {
			setIsPaid(String(transaction.is_paid || "0"));
			setNote(transaction.note || "");
			setPaymentMethodId(transaction.payment_method_id || "");
			setMemberId(transaction.member_id || "");
			setIsSaving(false);
		}
	}, [isOpen, transaction]);

	const handleSave = async () => {
		if (!transaction) return;
		setIsSaving(true);
		try {
			// Only submit fields that we are actively editing
			const updates: Partial<Transaction> & { payment_method_id?: string, member_id?: string | null } = {
				is_paid: isPaid,
				note: note || null, // convert empty string back to null if needed
				payment_method_id: paymentMethodId || "", // empty means clear? normally payment is required but handled by backend
				member_id: memberId || null, 
			};

			await onSave(transaction.id, updates);
			onClose();
		} catch (error) {
			console.error("Failed to save transaction updates", error);
			// Optionally show a toast here
		} finally {
			setIsSaving(false);
		}
	};

	if (!transaction) return null;

	return (
		<Modal 
			isOpen={isOpen} 
			onClose={onClose} 
			size="md"
			title={`Edit Transaksi: ${transaction.code}`}
		>
			<div className="space-y-4">
				<div className="space-y-2">
					<Label>Status Pembayaran</Label>
					<Select
						value={isPaid}
						onChange={(val) => setIsPaid(String(val))}
						options={[
							{ label: "Lunas", value: "1" },
							{ label: "Belum Lunas", value: "0" },
							{ label: "Hutang", value: "2" },
						]}
					/>
				</div>

				<div className="space-y-2">
					<Label>Metode Pembayaran</Label>
					<Select
						value={paymentMethodId}
						onChange={(val) => setPaymentMethodId(String(val))}
						options={paymentOptions}
					/>
				</div>

				<div className="space-y-2">
					<Label>Member / Pelanggan</Label>
					<Select
						value={memberId}
						onChange={(val) => setMemberId(String(val))}
						options={memberOptions}
					/>
				</div>

				<div className="space-y-2">
					<Label>Catatan</Label>
					<Input
						value={note}
						onChange={(e) => setNote(e.target.value)}
						placeholder="Tambahkan catatan opsional"
					/>
				</div>
			</div>
			
			<ModalFooter>
				<Button variant="secondary" onClick={onClose} disabled={isSaving}>
					Batal
				</Button>
				<Button
					onClick={handleSave}
					disabled={isSaving}
					className="bg-brand-primary text-white hover:bg-brand-primary/90"
				>
					{isSaving ? "Menyimpan..." : "Simpan Perubahan"}
				</Button>
			</ModalFooter>
		</Modal>
	);
};
