import { createFileRoute } from "@tanstack/react-router";
import { UserService } from "@/services/user.service";

export const Route = createFileRoute("/_protected/_management/roles")({
	loader: async () => {
		const [roles, permissions] = await Promise.all([
			UserService.getRoles(),
			UserService.getPermissions(),
		]);
		return { roles, permissions };
	},
});
