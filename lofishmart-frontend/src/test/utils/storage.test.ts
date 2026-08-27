import { describe, it, expect } from "vitest";
import type { User } from "@/types";
import { storage } from "@/utils/storage";

const mockUser: User = {
	id: "1",
	name: "Test User",
	username: "testuser",
	email: "test@test.com",
	login: true,
	hasPermit: ["product", "product-edit"],
	role_id: "ADMN",
	role: "ADMN",
};

describe("storage.token", () => {
	it("returns null when no token set", () => {
		expect(storage.getToken()).toBeNull();
	});

	it("stores token with 'Bearer ' prefix", () => {
		storage.setToken("abc123");
		expect(storage.getToken()).toBe("Bearer abc123");
	});

	it("does not double-prefix if 'Bearer ' already present", () => {
		storage.setToken("Bearer abc123");
		expect(storage.getToken()).toBe("Bearer abc123");
	});

	it("removeToken clears the token", () => {
		storage.setToken("abc123");
		storage.removeToken();
		expect(storage.getToken()).toBeNull();
	});
});

describe("storage.user", () => {
	it("returns null when no user set", () => {
		expect(storage.getUser()).toBeNull();
	});

	it("stores and retrieves user object", () => {
		storage.setUser(mockUser);
		const retrieved = storage.getUser();
		expect(retrieved).toEqual(mockUser);
	});

	it("returns null for corrupt JSON in localStorage", () => {
		localStorage.setItem("lofish_user", "not-valid-json{{{");
		expect(storage.getUser()).toBeNull();
	});

	it("removeUser clears the user", () => {
		storage.setUser(mockUser);
		storage.removeUser();
		expect(storage.getUser()).toBeNull();
	});
});

describe("storage.clear", () => {
	it("removes token and user on clear", () => {
		storage.setToken("abc");
		storage.setUser(mockUser);
		storage.clear();
		expect(storage.getToken()).toBeNull();
		expect(storage.getUser()).toBeNull();
	});

	it("removes cart and voucher keys on clear", () => {
		localStorage.setItem("lofish_cart", JSON.stringify([]));
		localStorage.setItem("lofish_active_voucher", "ITEM10");
		storage.clear();
		expect(localStorage.getItem("lofish_cart")).toBeNull();
		expect(localStorage.getItem("lofish_active_voucher")).toBeNull();
	});

	it("preserves market_id when persist flag is true", () => {
		localStorage.setItem("lofish_persist_market_id", "true");
		localStorage.setItem("lofish_market_id", "MKT001");
		storage.clear();
		expect(localStorage.getItem("lofish_market_id")).toBe("MKT001");
	});

	it("removes market_id when persist flag is false", () => {
		localStorage.setItem("lofish_persist_market_id", "false");
		localStorage.setItem("lofish_market_id", "MKT001");
		storage.clear();
		expect(localStorage.getItem("lofish_market_id")).toBeNull();
	});
});

describe("storage.marketId", () => {
	it("returns null initially", () => {
		expect(storage.getMarketId()).toBeNull();
	});

	it("sets and gets market ID", () => {
		storage.setMarketId("MKT001");
		expect(storage.getMarketId()).toBe("MKT001");
	});

	it("persist flag stored correctly", () => {
		storage.setMarketId("MKT002", true);
		expect(storage.isMarketPersisted()).toBe(true);
	});

	it("defaults persist to false", () => {
		storage.setMarketId("MKT003");
		expect(storage.isMarketPersisted()).toBe(false);
	});

	it("removeMarketId clears market", () => {
		storage.setMarketId("MKT001");
		storage.removeMarketId();
		expect(storage.getMarketId()).toBeNull();
	});
});
