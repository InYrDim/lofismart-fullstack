import { createFileRoute } from "@tanstack/react-router";
import { InventoryMain } from "@/components/inventory/InventoryMain";
import { SupervisorStockView } from "@/components/inventory/SupervisorStockView";
import { useRoleAndPermission } from "@/hooks/useRoleAndPermission";

function InventoryStockPage() {
	const { isSupervisor } = useRoleAndPermission();
	
	// Use dedicated Supervisor Stock View for SPVR role
	if (isSupervisor) {
		return <SupervisorStockView />;
	}
	
	// Use existing InventoryMain for other roles (Gudang, Admin, Manager)
	return <InventoryMain activeTab="stok" />;
}

export const Route = createFileRoute("/_protected/_inventory_group/inventory-stock")({
	component: InventoryStockPage,
});
