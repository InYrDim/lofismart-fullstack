import { api } from "@/utils/api";

export interface SupplierData {
	id: string;
	name: string;
	corporation: string;
	email: string;
	phone_number: string;
	address: string;
	city: string;
	pos: string;
	bank: string;
	no_rek: string;
}

export interface SupplierFormData {
	name: string;
	corporation: string;
	email: string;
	phone_number: string;
	address: string;
	city: string;
	pos: string;
	bank: string;
	no_rek: string;
}

export const SupplierService = {
	getSuppliers: async (): Promise<SupplierData[]> => {
		const response = await api.get<any>("/user/supplier/list");
		return response.data || response || [];
	},

	createSupplier: async (data: SupplierFormData) => {
		return api.post("/user/supplier/create", data);
	},

	updateSupplier: async (id: string, data: Partial<SupplierFormData>) => {
		return api.patch(`/user/supplier/update/${id}`, data);
	},

	deleteSupplier: async (id: string) => {
		return api.delete(`/user/supplier/delete/${id}`);
	},
};
