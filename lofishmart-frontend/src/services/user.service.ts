/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/utils/api";

export interface UserData {
	id: string;
	name: string;
	username: string;
	email: string;
	role_id: string;
	market_id: string | null;
	role?: {
		id: string;
		name: string;
	};
	market?: {
		id: string;
		name: string;
	};
	permissions?: string[] | null;
	image?: string | null;
}

export interface RoleData {
	id: string;
	name: string;
	guard_name: string;
	hasPermits?: {
		id: string;
		permission: PermissionData;
	}[];
}

export interface RoleFormData {
	id?: string;
	name: string;
	guard_name: string;
}

export interface ProfileData {
	id: string;
	name: string;
	type?: "OUTLET" | "GUDANG" | string;
}

export interface PermissionData {
	id: string;
	name: string;
	guard_name: string;
}

export interface UserFormData {
	name: string;
	username: string;
	email: string;
	password?: string;
	role_id: string;
	market_id: string | null;
	permissions?: string[] | null;
	image?: File | string | null;
}

export const UserService = {
	getUsers: async (): Promise<UserData[]> => {
		const response = await api.get<any>(`/user/user/list?_t=${Date.now()}`);
		return response.data || response || [];
	},

	getRoles: async (): Promise<RoleData[]> => {
		const response = await api.get<any>(`/user/role/list?_t=${Date.now()}`);
		return response.data || response || [];
	},

	createRole: async (data: RoleFormData) => {
		return api.post<any>("/user/role/create", data);
	},

	updateRole: async (id: string, data: Partial<RoleFormData>) => {
		return api.patch(`/user/role/update/${id}`, data);
	},

	deleteRole: async (id: string) => {
		return api.delete(`/user/role/delete/${id}`);
	},

	updateRolePermissions: async (roleId: string, permissionIds: string[]) => {
		return api.post("/user/has-permit/edit", {
			role: roleId,
			hasPermit: permissionIds,
		});
	},

	getMembers: async (): Promise<any[]> => {
		const response = await api.get<any>("/user/member-list");
		return response.data || response || [];
	},

	getProfiles: async (): Promise<ProfileData[]> => {
		const response = await api.get<any>(`/feature/profile/list?_t=${Date.now()}`);
		return response.data || response || [];
	},

	getPermissions: async (): Promise<PermissionData[]> => {
		const response = await api.get<any>("/user/permission/list");
		return response.data || response || [];
	},

	createUser: async (data: UserFormData) => {
		const formData = new FormData();
		Object.entries(data).forEach(([key, value]) => {
			if (value !== undefined) {
				if (key === "permissions" && Array.isArray(value)) {
					value.forEach((p) => formData.append("permissions[]", p));
				} else if (value === null) {
					formData.append(key, "");
				} else {
					formData.append(key, value as any);
				}
			}
		});
		return api.post("/user/user/create", formData);
	},

	updateUser: async (id: string, data: Partial<UserFormData>) => {
		const formData = new FormData();
		Object.entries(data).forEach(([key, value]) => {
			if (value !== undefined) {
				if (key === "permissions" && Array.isArray(value)) {
					value.forEach((p) => formData.append("permissions[]", p));
				} else if (value === null) {
					formData.append(key, "null");
				} else {
					formData.append(key, value as any);
				}
			}
		});
		return api.patch(`/user/user/update/${id}`, formData);
	},

	deleteUser: async (id: string) => {
		return api.delete(`/user/user/delete/${id}`);
	},
};
