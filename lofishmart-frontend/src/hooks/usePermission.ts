import { AuthService } from "@/services/auth.service";

export const usePermission = () => {
	const hasPermission = (permission: string): boolean => {
		return AuthService.hasPermission(permission);
	};

	return { hasPermission };
};
