import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AuthService } from "@/services/auth.service";

export const useLogout = () => {
	const navigate = useNavigate();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await AuthService.logout();
		} catch (error) {
			console.error("Logout failed:", error);
			// Force logout/clear even if API fails? AuthService does this in finally block.
		} finally {
			setIsLoggingOut(false);
			navigate({ to: "/" });
		}
	};

	return {
		handleLogout,
		isLoggingOut,
	};
};
