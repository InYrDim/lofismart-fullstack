import type { User } from "@/types";

const TOKEN_KEY = "lofish_token";
const USER_KEY = "lofish_user";

export const storage = {
	getToken: (): string | null => {
		return localStorage.getItem(TOKEN_KEY);
	},

	setToken: (token: string) => {
		// Ensure 'Bearer ' prefix is consistent
		const formattedToken = token.startsWith("Bearer ")
			? token
			: `Bearer ${token}`;
		localStorage.setItem(TOKEN_KEY, formattedToken);
	},

	removeToken: () => {
		localStorage.removeItem(TOKEN_KEY);
	},

	getUser: (): User | null => {
		const userStr = localStorage.getItem(USER_KEY);
		if (!userStr) return null;
		try {
			return JSON.parse(userStr);
		} catch {
			return null;
		}
	},

	setUser: (user: User) => {
		localStorage.setItem(USER_KEY, JSON.stringify(user));
	},

	removeUser: () => {
		localStorage.removeItem(USER_KEY);
	},

	clear: () => {
		const shouldPersistMarket =
			localStorage.getItem("lofish_persist_market_id") === "true";

		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(USER_KEY);
		// Clear Cart & Voucher Data
		localStorage.removeItem("lofish_cart");
		localStorage.removeItem("lofish_active_voucher");
		localStorage.removeItem("lofish_active_voucher_config");
		localStorage.removeItem("lofish_voucher_discount");

		if (!shouldPersistMarket) {
			localStorage.removeItem("lofish_market_id");
			localStorage.removeItem("lofish_persist_market_id");
		}
	},

	// Market ID Persistence
	getMarketId: (): string | null => {
		return localStorage.getItem("lofish_market_id");
	},

	setMarketId: (id: string, persist: boolean = false) => {
		localStorage.setItem("lofish_market_id", id);
		localStorage.setItem("lofish_persist_market_id", String(persist));
	},

	removeMarketId: () => {
		localStorage.removeItem("lofish_market_id");
		localStorage.removeItem("lofish_persist_market_id");
	},

	isMarketPersisted: (): boolean => {
		return localStorage.getItem("lofish_persist_market_id") === "true";
	},
};
