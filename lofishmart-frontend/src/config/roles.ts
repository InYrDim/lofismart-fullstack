export const ROLES = {
	CASHIER: "KSR",
	ADMIN: "ADMN",
	MANAGER: "MNGR",
	SUPERVISOR: "SPVR",
	GUDANG: "GDNG",
	USER: "USER",
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];
