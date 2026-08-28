import { api } from "@/utils/api";
import { storage } from "@/utils/storage";
import type { LoginResponse, User } from "@/types";

export const AuthService = {
	login: async (username: string, password: string): Promise<User> => {
		try {
			storage.clear(); // Clear any stale tokens before login
			const response = await api.post<LoginResponse>("/login", {
				username,
				password,
			});

			const token = response.token;
			storage.setToken(token);

			// Since token is not JWT, we use the user object from response directly
			const user = response.user;
			console.log("Logged in user:", user);

			storage.setUser(user);

			// Automatically sync market ID if assigned (SPVR/GDNG)
			const marketId = user.market?.id || user.market_id;
			if (marketId) {
				storage.setMarketId(String(marketId), true);
			} else {
				// Hapus market id lama yang tersisa dari sesi sebelumnya agar
				// localStorage tidak menyimpan nilai stale/menyesatkan.
				storage.removeMarketId();
			}

			return user;
		} catch (error) {
			console.error("Login failed:", error);
			throw error;
		}
	},

	logout: async (): Promise<void> => {
		try {
			await api.post("/logout", {});
		} catch (error) {
			console.error("Logout error:", error);
			// Force logout locally even if server fails
		} finally {
			storage.clear();
			window.location.href = "/";
		}
	},

	isAuthenticated: (): boolean => {
		return !!storage.getToken();
	},

	getCurrentUser: (): User | null => {
		return storage.getUser();
	},

	getProfile: async (): Promise<User> => {
		try {
			const response = await api.get<{ user: User }>("/me");
			const user = response.user;

			// Update local storage with fresh data
			storage.setUser(user);

			// Sync market ID
			const marketId = user.market?.id || user.market_id;
			if (marketId) {
				storage.setMarketId(String(marketId), true);
			} else {
				// Hapus market id lama yang tersisa dari sesi sebelumnya agar
				// localStorage tidak menyimpan nilai stale/menyesatkan.
				storage.removeMarketId();
			}

			return user;
		} catch (error) {
			console.error("Failed to fetch profile:", error);
			throw error;
		}
	},

	hasPermission: (permission: string): boolean => {
		const user = storage.getUser();
		if (!user || !user.hasPermit) return false;
		return user.hasPermit.includes(permission);
	},
};
