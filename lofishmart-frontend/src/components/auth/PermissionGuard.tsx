import React from "react";
import { usePermission } from "@/hooks/usePermission";

interface PermissionGuardProps {
	permission: string;
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
	permission,
	children,
	fallback = null,
}) => {
	const { hasPermission } = usePermission();

	if (!hasPermission(permission)) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
};
