import { ROLES } from "@/config/roles";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@/types";

/**
 * Extract roleId from a User object, handling all backend response formats.
 * Use this in non-hook contexts (beforeLoad, utils, callbacks).
 */
export const getRoleId = (user: User | null): string => {
	if (!user) return "";
	if (typeof user.role === "string") return user.role;
	return user.role?.id || user.role_id || "";
};

/**
 * Check if a roleId matches any of the allowed roles using explicit ===.
 * Use this in non-hook contexts (beforeLoad, utils, callbacks).
 */
export const checkRoleAny = (roleId: string | null | undefined, ...roles: string[]): boolean => {
	if (!roleId) return false;
	for (const role of roles) {
		if (roleId === role) return true;
	}
	return false;
};

/**
 * Check if a user is a super admin (ADMN role or ADMN001 id).
 * Use this in non-hook contexts (beforeLoad, utils, callbacks).
 */
export const isSuperAdminUser = (user: User | null): boolean => {
	return getRoleId(user) === ROLES.ADMIN || user?.id === "ADMN001";
};

export const useRoleAndPermission = () => {
	const { user, roleId } = useAuth();

	const hasRole = (role: string) => roleId === role;

	const hasAnyRole = (...roles: string[]): boolean => {
		return checkRoleAny(roleId, ...roles);
	};

	// Derived boolean flags for convenience
	const isCashier = roleId === ROLES.CASHIER;
	const isAdmin = roleId === ROLES.ADMIN;
	const isManager = roleId === ROLES.MANAGER;
	const isUser = roleId === ROLES.USER;
	const isSupervisor = roleId === ROLES.SUPERVISOR;
	const isGudang = roleId === ROLES.GUDANG;
	const isSuperAdmin = isAdmin || user?.id === "ADMN001";

	const hasPermission = (permission: string) => {
		if (!user || !user.hasPermit) return false;
		return user.hasPermit.includes(permission);
	};

	return {
		roleId,
		hasRole,
		hasAnyRole,
		hasPermission,
		isCashier,
		isAdmin,
		isManager,
		isUser,
		isSupervisor,
		isGudang,
		isSuperAdmin,
	};
};
