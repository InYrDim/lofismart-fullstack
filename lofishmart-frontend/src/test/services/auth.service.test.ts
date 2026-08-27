import { describe, it, expect, vi } from "vitest";
import type { Mock } from "vitest";
import type { User } from "@/types";
import { AuthService } from "@/services/auth.service";

// Mock the storage module
vi.mock("../../utils/storage", () => ({
	storage: {
		getToken: vi.fn(),
		setToken: vi.fn(),
		removeToken: vi.fn(),
		getUser: vi.fn(),
		setUser: vi.fn(),
		removeUser: vi.fn(),
		clear: vi.fn(),
		getMarketId: vi.fn(),
		setMarketId: vi.fn(),
		removeMarketId: vi.fn(),
		isMarketPersisted: vi.fn(),
	},
}));

import { storage } from "@/utils/storage";

const s = storage as unknown as Record<string, Mock>;

describe("AuthService.isAuthenticated", () => {
	it("returns false when no token in storage", () => {
		s.getToken.mockReturnValue(null);
		expect(AuthService.isAuthenticated()).toBe(false);
	});

	it("returns true when a token exists", () => {
		s.getToken.mockReturnValue("Bearer abc123");
		expect(AuthService.isAuthenticated()).toBe(true);
	});
});

describe("AuthService.getCurrentUser", () => {
	it("returns null when no user is stored", () => {
		s.getUser.mockReturnValue(null);
		expect(AuthService.getCurrentUser()).toBeNull();
	});

	it("returns the stored user object", () => {
		const mockUser: User = {
			id: "1",
			name: "Admin",
			username: "admin1",
			email: "admin@test.com",
			login: true,
			hasPermit: ["product"],
		};
		s.getUser.mockReturnValue(mockUser);
		expect(AuthService.getCurrentUser()).toEqual(mockUser);
	});
});

describe("AuthService.hasPermission", () => {
	it("returns false when no user is logged in", () => {
		s.getUser.mockReturnValue(null);
		expect(AuthService.hasPermission("product")).toBe(false);
	});

	it("returns false when user has no hasPermit field", () => {
		const userWithoutPermits = { id: "1" } as unknown as User;
		s.getUser.mockReturnValue(userWithoutPermits);
		expect(AuthService.hasPermission("product")).toBe(false);
	});

	it("returns true when permission is in user's hasPermit list", () => {
		const mockUser: User = {
			id: "1",
			name: "Admin",
			username: "admin1",
			email: "admin@test.com",
			login: true,
			hasPermit: ["product", "product-edit", "stock"],
		};
		s.getUser.mockReturnValue(mockUser);
		expect(AuthService.hasPermission("product")).toBe(true);
		expect(AuthService.hasPermission("stock")).toBe(true);
	});

	it("returns false when permission is NOT in user's hasPermit list", () => {
		const mockUser: User = {
			id: "1",
			name: "Admin",
			username: "admin1",
			email: "admin@test.com",
			login: true,
			hasPermit: ["product"],
		};
		s.getUser.mockReturnValue(mockUser);
		expect(AuthService.hasPermission("user-edit")).toBe(false);
	});
});
