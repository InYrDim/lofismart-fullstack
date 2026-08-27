import { createContext } from "react";
import type { User } from "@/types";

export interface AuthContextType {
	user: User | null;
	roleId: string | undefined;
	marketId: string | undefined;
	marketName: string | undefined;
	isAuthenticated: boolean;
	login: (user: User, token: string) => void;
	logout: () => void;
	refreshUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined,
);
