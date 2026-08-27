import React, { useState } from "react";
import { Outlet } from "@tanstack/react-router";
import Sidebar from "@/components/Sidebar";
import { MainLayoutContext } from "./MainLayoutContext";

export const MainLayout: React.FC = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

	return (
		<MainLayoutContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
			<div className="flex h-screen bg-gray-100 font-sans overflow-hidden text-gray-800">
				<Sidebar
					isOpen={isSidebarOpen}
					onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
				/>
				<Outlet />
			</div>
		</MainLayoutContext.Provider>
	);
};
