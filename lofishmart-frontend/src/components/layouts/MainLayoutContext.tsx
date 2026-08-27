import { createContext, useContext } from "react";

export interface MainLayoutContextType {
	isSidebarOpen: boolean;
	setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MainLayoutContext = createContext<MainLayoutContextType | null>(null);

export const useMainLayout = () => {
	const ctx = useContext(MainLayoutContext);
	if (!ctx) throw new Error("Missing MainLayoutContext");
	return ctx;
};
