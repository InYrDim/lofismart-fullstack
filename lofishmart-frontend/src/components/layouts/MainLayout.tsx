import React, { useState } from "react";
import { Outlet } from "@tanstack/react-router";
import Sidebar from "@/components/Sidebar";
import { MainLayoutContext } from "./MainLayoutContext";
import { UnassignedOutletModal } from "@/components/ui/modals/UnassignedOutletModal";
import { useAuth } from "@/hooks/useAuth";
import { useRoleAndPermission } from "@/hooks/useRoleAndPermission";
import { AuthService } from "@/services/auth.service";

export const MainLayout: React.FC = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const { marketId, refreshUser } = useAuth();
	const { isCashier, isSupervisor } = useRoleAndPermission();

	// Kasir atau Supervisor tanpa market/outlet ditetapkan tidak dapat mengakses
	// halaman apa pun. Modal tampil dan tombol "Saya Mengerti" bertindak sebagai
	// penyegar data: setelah Admin memperbarui outlet, user menekan tombol untuk
	// mengambil data terbaru dan modal tertutup otomatis begitu market terisi.
	const lockForUnassignedRole = (isCashier || isSupervisor) && !marketId;

	const handleRetry = async () => {
		if (isRefreshing) return;
		setIsRefreshing(true);
		try {
			// Ambil data user terbaru dari server (GET /me) dan sinkronkan
			// ke localStorage + state React.
			await AuthService.getProfile();
			refreshUser();
		} catch (error) {
			console.error("Gagal menyinkronkan data user:", error);
		} finally {
			setIsRefreshing(false);
		}
	};

	return (
		<MainLayoutContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
			<div className="flex h-screen bg-gray-100 font-sans overflow-hidden text-gray-800">
				<Sidebar
					isOpen={isSidebarOpen}
					onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
				/>
				<Outlet />
			</div>
			<UnassignedOutletModal
				isOpen={lockForUnassignedRole}
				onClose={handleRetry}
				isLoading={isRefreshing}
			/>
		</MainLayoutContext.Provider>
	);
};
