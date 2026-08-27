import React, { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { LogoutModal } from "./ui/modals/LogoutModal";
import { useLogout } from "@/hooks/useLogout";

interface SidebarLogoutProps {
	isOpen: boolean;
}

export const SidebarLogout: React.FC<SidebarLogoutProps> = ({ isOpen }) => {
	const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
	const { handleLogout, isLoggingOut } = useLogout();

	const onConfirmLogout = async () => {
		await handleLogout();
		setIsLogoutModalOpen(false);
	};

	return (
		<>
			<Button
				variant="danger"
				onClick={() => setIsLogoutModalOpen(true)}
				className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap overflow-hidden justify-start`}
			>
				<LogOut className="w-5 h-5 shrink-0" />
				<span
					className={`transition-opacity duration-300 ${
						isOpen ? "opacity-100" : "opacity-0 w-0"
					}`}
				>
					Keluar
				</span>
			</Button>

			<LogoutModal
				isOpen={isLogoutModalOpen}
				onClose={() => setIsLogoutModalOpen(false)}
				onConfirm={onConfirmLogout}
				isLoading={isLoggingOut}
			/>
		</>
	);
};
