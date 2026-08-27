import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/_inventory_group/markets")({
	beforeLoad: () => {
		throw redirect({ to: "/inventory-stock" });
	},
});
