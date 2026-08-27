import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AuthService } from "@/services/auth.service";
import { ROLES } from "@/config/roles";
import { getRoleId, checkRoleAny } from "@/hooks/useRoleAndPermission";

export const Route = createFileRoute("/_protected/kelolagudang")({
	beforeLoad: () => {
		const user = AuthService.getCurrentUser();
		const roleId = getRoleId(user);

		// Admin memilih gudang lewat selector, sehingga tidak memerlukan gudang terikat.
		if (checkRoleAny(roleId, ROLES.ADMIN)) {
			return;
		}

		// Role lain (GUDANG/MANAGER/SUPERVISOR) menurunkan gudang dari market_id
		// akun. Jika tidak ada gudang yang terikat, tolak akses ke kelola gudang.
		const userMarketId = user?.market_id || user?.market?.id;
		if (!roleId || !userMarketId) {
			throw redirect({ to: "/forbidden", search: { reason: "no-gudang" } });
		}
	},
	component: () => <Outlet />,
});
