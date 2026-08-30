import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import {
	LayoutDashboard,
	Store,
	Settings,
	X,
	History,
	ChevronRight,
	ShoppingCart,
	User,
	PackageSearch,
	BarChart3,
	Container,
	ShoppingBag,
	Terminal,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import { SidebarLogout } from "./SidebarLogout";
import { AuthContext } from "@/context/AuthContextDef";
import { ROLES } from "@/config/roles";

interface SubMenuItem {
	label: string;
	path: string;
}

interface MenuItem {
	icon: LucideIcon;
	label: string;
	path?: string;
	children?: SubMenuItem[];
	/** If set, only users with one of these roleIds can see this item */
	allowedRoles?: string[];
}

interface SidebarProps {
	isOpen: boolean;
	onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
	const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
	const navigate = useNavigate();
	const location = useLocation();
	const authContext = useContext(AuthContext);
	const user = authContext?.user;
	const userRoleId = authContext?.roleId || "";

	// Roles allowed to see Management section
	const MANAGEMENT_ROLES = [ROLES.ADMIN, ROLES.MANAGER];
	const GUDANG_MANAGEMENT_ROLES = [ROLES.GUDANG, ROLES.ADMIN, ROLES.MANAGER];
	const POS_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER];

	// Trigger rerender when user is ready
	useEffect(() => {
		if (authContext?.refreshUser) {
			authContext.refreshUser();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Run once on mount

	const toggleExpand = (label: string) => {
		setExpandedMenus((prev) =>
			prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
		);
	};

	const menuItems: MenuItem[] = [
		{
			icon: LayoutDashboard,
			label: "Dashboard",
			path: "/dashboard",
		},
		{
			icon: PackageSearch,
			label: "Manajemen",
			allowedRoles: MANAGEMENT_ROLES,
			children: [
				{ label: "Produk & Jasa", path: "/products" },
				{ label: "Atribut Produk", path: "/product-attributes" },
				{ label: "Outlet & Gudang", path: "/outletandgudang" },
				{ label: "Pengguna", path: "/users" },
				{ label: "Role & Permission", path: "/roles" },
				{ label: "Supplier", path: "/suppliers" },
			],
		},
		{
			icon: Container,
			label: "Kelola Gudang",
			allowedRoles: GUDANG_MANAGEMENT_ROLES,
			children: [
				{ label: "Terima Supplier", path: "/kelolagudang/receive" },
				{ label: "Stok Gudang", path: "/kelolagudang/stock" },
				{ label: "Transfer ke Outlet", path: "/kelolagudang/transfers" },
				{ label: "Riwayat Transfer Supplier", path: "/kelolagudang/purchases" },
				{ label: "Laporan Reject", path: "/kelolagudang/rejects" },
			],
		},
		{
			icon: ShoppingBag,
			label: "Kelola Outlet",
			allowedRoles: [ROLES.SUPERVISOR, ROLES.ADMIN],
			children: [
				{ label: "Terima Transfer", path: "/kelolaoutlet/receive" },
				{ label: "Stok Outlet", path: "/kelolaoutlet/stock" },
				{ label: "Riwayat Penerimaan", path: "/kelolaoutlet/transfers" },
				{ label: "Laporan Reject", path: "/kelolaoutlet/rejects" },
			],
		},
		{
			icon: Store,
			label: "POS",
			path: "/pos",
			allowedRoles: POS_ROLES,
		},
		{
			icon: History,
			label: "Riwayat Transaksi",
			// Gudang (GDNG) tidak perlu akses ke riwayat transaksi
			allowedRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPERVISOR, ROLES.CASHIER, ROLES.USER],
			children: [
				{ label: "Penjualan", path: "/transactions" },
				{ label: "Data Transaksi", path: "/data-transaksi" },
			],
		},
		{
			icon: BarChart3,
			label: "Laporan",
			allowedRoles: MANAGEMENT_ROLES,
			children: [{ label: "Laporan per Item", path: "/report-item" }],
		},

		{
			icon: Settings,
			allowedRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPERVISOR, ROLES.USER],
			label: "Pengaturan",
			path: "/settings",
		},
		{
			icon: Terminal,
			label: "Test Remote Serial",
			path: "/test-remote-serial",
			allowedRoles: [ROLES.ADMIN],
		},
	];

	/** Filter menu by role */
	const visibleMenuItems = menuItems.filter(
		(item) => !item.allowedRoles || item.allowedRoles.includes(userRoleId),
	);

	// Auto-expand parent if a child route is active
	const isChildActive = (children?: SubMenuItem[]) =>
		children?.some((c) => location.pathname === c.path) || false;

	const isExpanded = (item: MenuItem) =>
		expandedMenus.includes(item.label) || isChildActive(item.children);

	return (
		<>
			{/* Mobile Overlay */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/20 z-30 md:hidden"
					onClick={onToggle}
				/>
			)}

			{/* Sidebar Container */}
			<div
				className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ease-in-out ${isOpen
					? "w-64 translate-x-0"
					: "w-0 -translate-x-full overflow-hidden md:w-0 md:translate-x-0 md:overflow-hidden"
					}`}
			>
				{/* Header */}
				<div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 shrink-0">
					<h1
						className={`font-bold text-xl text-gray-900 whitespace-nowrap overflow-hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"
							}`}
					>
						Menu
					</h1>
					<button
						onClick={onToggle}
						className="md:hidden p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-lg"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Navigation */}
				<nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
					{visibleMenuItems.map((item) => {
						const hasChildren = item.children && item.children.length > 0;
						const expanded = isExpanded(item);
						const isActive = item.path
							? location.pathname === item.path
							: isChildActive(item.children);

						return (
							<div key={item.label}>
								{/* Parent Button */}
								<button
									onClick={() => {
										if (hasChildren) {
											toggleExpand(item.label);
										} else if (item.path) {
											navigate({ to: item.path });
										}
									}}
									className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                    whitespace-nowrap overflow-hidden
                    ${isActive
											? "bg-brand-primary/10 text-brand-primary"
											: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
										}
                  `}
								>
									<item.icon
										className={`w-5 h-5 shrink-0 ${isActive ? "text-brand-primary" : "text-gray-400"
											}`}
									/>
									<span
										className={`flex-1 text-left transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"
											}`}
									>
										{item.label}
									</span>
									{hasChildren && isOpen && (
										<ChevronRight
											className={`w-4 h-4 shrink-0 transition-transform duration-200 ${expanded ? "rotate-90" : ""
												} ${isActive ? "text-brand-primary" : "text-gray-400"}`}
										/>
									)}
								</button>

								{/* Children */}
								{hasChildren && expanded && isOpen && (
									<div className="ml-4 mt-1 space-y-0.5 border-l-2 border-gray-100 pl-3">
										{item.children!.map((child) => {
											const childActive = location.pathname === child.path;
											return (
												<button
													key={`${child.path}`}
													onClick={() => navigate({ to: child.path })}
													className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap overflow-hidden ${childActive
														? "text-brand-primary font-semibold bg-brand-primary/5"
														: "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
														}`}
												>
													<ShoppingCart
														className={`w-4 h-4 shrink-0 ${childActive ? "text-brand-primary" : "text-gray-400"}`}
													/>
													<span>{child.label}</span>
												</button>
											);
										})}
									</div>
								)}
							</div>
						);
					})}
				</nav>

				{/* Footer */}
				<div className="p-4 border-t border-gray-100 shrink-0 space-y-2">
					{/* User Profile */}
					<div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50/50">
						<div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 text-brand-primary overflow-hidden border border-white shadow-sm ring-1 ring-gray-100">
							{user?.image ? (
								<img
									src={`${import.meta.env.VITE_API_BASE_URL}/upload/user/${user.image}`}
									alt={user.name}
									className="w-full h-full object-cover"
									onError={(e) => {
										(e.target as HTMLImageElement).style.display = "none";
									}}
								/>
							) : (
								<User className="w-4 h-4" />
							)}
						</div>
						<div
							className={`flex flex-col overflow-hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 w-0"
								}`}
						>
							{user ? (
								<>
									<span className="text-sm font-medium text-gray-900 truncate">
										{user.username}
									</span>
									<span className="text-xs text-gray-500 truncate">
										{user.email}
									</span>
									{(user.market || user.market_id) && (
										<div className="flex items-center gap-1 mt-0.5 text-[10px] font-bold text-brand-primary uppercase tracking-tight">
											<Store className="w-2.5 h-2.5" />
											<span className="truncate">
												{user.market?.name || user.market_id}
											</span>
										</div>
									)}
								</>
							) : (
								<div className="flex flex-col gap-1 animate-pulse">
									<div className="h-4 w-24 bg-gray-200 rounded" />
									<div className="h-3 w-32 bg-gray-200 rounded" />
								</div>
							)}
						</div>
					</div>

					<SidebarLogout isOpen={isOpen} />
				</div>
			</div>
		</>
	);
};

export default Sidebar;
