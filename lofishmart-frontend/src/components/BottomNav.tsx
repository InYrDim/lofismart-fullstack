import React, { useContext } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Store, History, BarChart3, Menu } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AuthContext } from "@/context/AuthContextDef";
import { ROLES } from "@/config/roles";
import { useMainLayout } from "./layouts/MainLayoutContext";

interface BottomNavItem {
    icon: LucideIcon;
    label: string;
    path: string;
    allowedRoles?: string[];
}

// ponytail: mirrors Sidebar.tsx top-level allowedRoles; expand when more quick tabs are needed
const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
    { icon: LayoutDashboard, label: "Beranda", path: "/dashboard" },
    {
        icon: Store,
        label: "POS",
        path: "/pos",
        allowedRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
    },
    {
        icon: History,
        label: "Riwayat",
        path: "/transactions",
        allowedRoles: [
            ROLES.ADMIN,
            ROLES.MANAGER,
            ROLES.SUPERVISOR,
            ROLES.CASHIER,
            ROLES.USER,
        ],
    },
    {
        icon: BarChart3,
        label: "Laporan",
        path: "/report-item",
        allowedRoles: [ROLES.ADMIN, ROLES.MANAGER],
    },
];

export const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const authContext = useContext(AuthContext);
    const userRoleId = authContext?.roleId || "";
    const { setIsSidebarOpen } = useMainLayout();

    const visibleItems = BOTTOM_NAV_ITEMS.filter(
        (item) => !item.allowedRoles || item.allowedRoles.includes(userRoleId),
    );

    const isActive = (path: string) =>
        location.pathname === path || location.pathname.startsWith(path + "/");

    return (
        <nav
            className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-100 flex items-stretch justify-around h-16"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
            {visibleItems.map((item) => {
                const active = isActive(item.path);
                return (
                    <button
                        key={item.path}
                        onClick={() => navigate({ to: item.path })}
                        className={`flex flex-col items-center justify-center gap-1 flex-1 text-[11px] font-medium transition-colors ${active ? "text-brand-primary" : "text-gray-500"
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </button>
                );
            })}
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex flex-col items-center justify-center gap-1 flex-1 text-[11px] font-medium text-gray-500"
            >
                <Menu className="w-5 h-5" />
                <span>Menu</span>
            </button>
        </nav>
    );
};
