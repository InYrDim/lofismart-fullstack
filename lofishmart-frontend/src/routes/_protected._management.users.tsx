import { createFileRoute } from "@tanstack/react-router";
import { UserService } from "@/services/user.service";

export const Route = createFileRoute("/_protected/_management/users")({
	loader: async () => {
		const [users, roles, profiles, permissions] = await Promise.all([
			UserService.getUsers(),
			UserService.getRoles(),
			UserService.getProfiles(),
			UserService.getPermissions(),
		]);
		return { users, roles, profiles, permissions };
	},
});
