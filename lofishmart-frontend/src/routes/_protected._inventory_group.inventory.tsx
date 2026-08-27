import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/_inventory_group/inventory")({
	component: () => <Outlet />,
});
