import React from "react";
import { Menu, RefreshCw, ShoppingCart, Settings, Store } from "lucide-react";
import { SerialSettingsModal } from "./ui/modals/SerialSettingsModal";
import { useSerial } from "@/hooks/useSerial";
import Brand from "./brand/Brand";
import SearchBar from "./SearchBar";

export default function PosHeader({
	isSidebarOpen,
	setIsSidebarOpen,
	isCartOpen,
	setIsCartOpen,
	totalItems,
	handleRefresh,
	searchQuery,
	setSearchQuery,
	marketName,
}: {
	isSidebarOpen: boolean;
	setIsSidebarOpen: (open: boolean) => void;
	isCartOpen: boolean;
	setIsCartOpen: (open: boolean) => void;
	totalItems: number;
	handleRefresh: () => void;
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	marketName?: string;
}) {
	// Local state for settings modal
	const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
	const { isConnected } = useSerial();

	return (
		<>
			<header className="px-6 py-4 flex items-center justify-between shrink-0 bg-transparent">
				<div className="flex items-center gap-4">
					<button
						onClick={() => setIsSidebarOpen(!isSidebarOpen)}
						className="p-2 -ml-2 text-gray-500 hover:bg-white hover:shadow-sm rounded-lg transition-all hidden md:block"
					>
						<Menu className="w-6 h-6" />
					</button>
					<Brand />
					{marketName && (
						<div
							className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-xs font-bold text-brand-primary"
							title={marketName}
						>
							<Store className="w-3.5 h-3.5" />
							<span className="max-w-[160px] truncate">{marketName}</span>
						</div>
					)}
				</div>
				<SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
				<div className="flex gap-2 opacity-100 hover:opacity-100 transition-opacity">
					{/* Serial Status Badge */}
					<div
						className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${isConnected
							? "bg-green-100 text-green-700 border-green-200"
							: "bg-red-50 text-red-600 border-red-100"
							}`}
						title={
							isConnected
								? "Timbangan Serial Terhubung"
								: "Timbangan Serial Terputus"
						}
					>
						<div
							className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-400"
								}`}
						/>
						<span className="hidden md:inline">
							{isConnected ? "Terhubung" : "Tidak Ada Perangkat"}
						</span>
					</div>

					{/* Serial Settings Toggle */}
					<button
						onClick={() => setIsSettingsOpen(true)}
						className="p-2 transition-all hover:bg-white rounded-lg shadow-sm text-gray-500"
						title="Pengaturan Perangkat"
					>
						<Settings className="w-4 h-4" />
					</button>

					<button
						onClick={handleRefresh}
						className="p-2 transition-all hover:bg-white rounded-lg shadow-sm text-gray-500 "
						title="Muat Ulang Katalog"
					>
						<RefreshCw className="w-4 h-4" />
					</button>
					<button
						onClick={() => setIsCartOpen(!isCartOpen)}
						className={`relative p-2 transition-all rounded-lg shadow-sm ${isCartOpen
							? "bg-brand-primary/10 text-brand-primary"
							: "hover:bg-white text-gray-500"
							}`}
						title={isCartOpen ? "Sembunyikan Keranjang" : "Tampilkan Keranjang"}
					>
						<ShoppingCart className="w-4 h-4" />
						{totalItems > 0 && (
							<span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
								{totalItems > 99 ? "99+" : totalItems}
							</span>
						)}
					</button>
				</div>
			</header>

			{/* Settings Modal */}
			<SerialSettingsModal
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
			/>
		</>
	);
}
