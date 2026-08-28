import { api } from "@/utils/api";
import type { Profile, MarketProfile } from "@/types";

export interface MarketFormData {
	name: string;
	address?: string;
	maps?: string;
	city?: string;
	pos?: string;
	timezone?: string;
	time_dif?: number;
	phone_number?: string;
	type?: "GUDANG" | "OUTLET";
}

export const ProfileService = {
	getMarketProfiles: async (): Promise<MarketProfile[]> => {
		try {
			const response = await api.get<MarketProfile[]>("/feature/profile/list");
			return response;
		} catch (error) {
			console.error("Failed to fetch market profiles:", error);
			throw error;
		}
	},

	getOutlets: async (): Promise<MarketProfile[]> => {
		try {
			const response = await api.get<MarketProfile[]>("/outlet");
			return response;
		} catch (error) {
			console.error("Failed to fetch outlets:", error);
			throw error;
		}
	},

	getWarehouses: async (): Promise<MarketProfile[]> => {
		try {
			const response = await api.get<MarketProfile[]>("/warehouse");
			return response;
		} catch (error) {
			console.error("Failed to fetch warehouses:", error);
			throw error;
		}
	},

	assignSupervisor: async (outletId: string, userId: string): Promise<void> => {
		try {
			// Backend contract: POST /outlet/assign-supervisor with { user_id, outlet_id }
			// (menyimpan user.market_id = outlet_id)
			await api.post("/outlet/assign-supervisor", {
				user_id: userId,
				outlet_id: outletId,
			});
		} catch (error) {
			console.error("Failed to assign supervisor:", error);
			throw error;
		}
	},

	createMarket: async (data: MarketFormData): Promise<MarketProfile> => {
		try {
			const response = await api.post<MarketProfile>(
				"/feature/profile/create",
				data,
			);
			return response;
		} catch (error) {
			console.error("Failed to create market:", error);
			throw error;
		}
	},

	updateMarket: async (
		id: string,
		data: MarketFormData,
	): Promise<MarketProfile> => {
		try {
			const response = await api.patch<MarketProfile>(
				`/feature/profile/update/${id}`,
				data,
			);
			return response;
		} catch (error) {
			console.error("Failed to update market:", error);
			throw error;
		}
	},

	deleteMarket: async (id: string): Promise<void> => {
		try {
			await api.delete(`/feature/profile/delete/${id}`);
		} catch (error) {
			console.error("Failed to delete market:", error);
			throw error;
		}
	},

	getProfiles: async (): Promise<Profile[]> => {
		try {
			const response = await api.get<Profile[]>("/profile-list");
			return response;
		} catch (error) {
			console.error("Failed to fetch profiles:", error);
			throw error;
		}
	},

	getFirstProfile: async (): Promise<Profile | null> => {
		const profiles = await ProfileService.getProfiles();
		return profiles.length > 0 ? profiles[0] : null;
	},
};
