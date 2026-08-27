import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContextDef";
import type { User } from "@/types";
import { storage } from "@/utils/storage";
import { AuthService } from "@/services/auth.service";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(storage.getUser());

	// Saat app dimuat dan user sudah tersimpan, segarkan data user dari server
	// (GET /me) agar perubahan yang dilakukan Admin (mis. penambahan market_id)
	// langsung terlihat setelah halaman di-refresh, tanpa harus login ulang.
	const initialUser = storage.getUser();

	useEffect(() => {
		if (!initialUser) return;
		let cancelled = false;
		AuthService.getProfile()
			.then((fresh) => {
				if (!cancelled) setUser(fresh);
			})
			.catch(() => {
				// Token tidak valid / gagal sinkronisasi: biarkan data lama tetap berlaku.
			});
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const login = (userData: User, token: string) => {
		// Storage updates should happen in service/component calling this, but we force update state here
		// Actually, standard pattern: Service handles API -> Component calls Service -> Component updates Context
		// OR Context handles Service call.
		// For now, let's assume Service handles local storage, we just sync state.
		// BUT to be safe, let's explicitly set storage here too if passed.
		if (token) storage.setToken(token);
		if (userData) storage.setUser(userData);
		setUser(userData);
	};

	const logout = () => {
		AuthService.logout(); // Will clear storage
		setUser(null);
	};

	const refreshUser = () => {
		const storedUser = storage.getUser();
		setUser(storedUser);
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				roleId: typeof user?.role === "string" ? user.role : (user?.role?.id || user?.role_id || null),
				marketId: user?.market_id || user?.market?.id,
				marketName: user?.market?.name,
				isAuthenticated: !!user,
				login,
				logout,
				refreshUser,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
