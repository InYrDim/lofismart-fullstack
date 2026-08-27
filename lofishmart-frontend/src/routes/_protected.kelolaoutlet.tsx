import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProfileService } from "@/services/profile.service";

export const Route = createFileRoute("/_protected/kelolaoutlet")({
	loader: async () => {
		const outlets = await ProfileService.getMarketProfiles();
		return { outlets };
	},
	component: () => <Outlet />,
});
