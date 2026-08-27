import React from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "./Modal";

interface LogoutModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	isLoading: boolean;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	isLoading,
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="sm"
			variant="warning"
			layout="center"
			title="Konfirmasi Logout"
			description="Apakah anda yakin ingin keluar dari aplikasi? Anda harus login kembali untuk mengakses sistem."
		>
			<div className="flex flex-col items-center text-center w-full">
				<div className="flex gap-3 w-full mt-4">
					<Button
						type="button"
						onClick={onClose}
						disabled={isLoading}
						variant="outline"
						className="flex-1"
					>
						Batal
					</Button>

					<Button
						onClick={onConfirm}
						isLoading={isLoading}
						variant="danger"
						className="flex-1 hover:bg-red-600 hover:text-white"
					>
						Keluar
					</Button>
				</div>
			</div>
		</Modal>
	);
};
