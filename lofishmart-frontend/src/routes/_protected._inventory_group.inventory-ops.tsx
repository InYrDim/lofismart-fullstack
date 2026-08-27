import { createFileRoute } from "@tanstack/react-router";
import { InventoryMain } from "@/components/inventory/InventoryMain";

export const Route = createFileRoute("/_protected/_inventory_group/inventory-ops")({
	component: () => <InventoryMain activeTab="ops" />,
});
