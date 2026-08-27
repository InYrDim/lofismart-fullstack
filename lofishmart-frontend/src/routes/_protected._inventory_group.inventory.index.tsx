import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/_inventory_group/inventory/")({
	beforeLoad: () => {
		throw redirect({ to: "/inventory-stock" });
	},
	component: () => null,
});
