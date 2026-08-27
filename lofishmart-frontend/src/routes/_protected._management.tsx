import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AuthService } from "@/services/auth.service";
import { ROLES } from "@/config/roles";
import { getRoleId, checkRoleAny } from "@/hooks/useRoleAndPermission";

export const Route = createFileRoute("/_protected/_management")({
	beforeLoad: () => {
		const user = AuthService.getCurrentUser();
		const roleId = getRoleId(user);
		if (!checkRoleAny(roleId, ROLES.ADMIN, ROLES.MANAGER, ROLES.GUDANG, ROLES.SUPERVISOR)) {
			throw redirect({ to: "/forbidden" });
		}
	},
	component: () => <Outlet />,
});
