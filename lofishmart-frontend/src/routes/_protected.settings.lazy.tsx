import { useState } from "react";
import { Store } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_protected/settings')({
	component: SettingsPage,
});
import { Button } from "@/components/ui/button";
import { ManageMarketModal } from "@/components/ui/modals/ManageMarketModal";
import { storage } from "@/utils/storage";
import { useRoleAndPermission } from "@/hooks/useRoleAndPermission";

function SettingsPage() {
	const { isAdmin, isManager } = useRoleAndPermission();
	const { highlight } = Route.useSearch() as { highlight?: string };
	const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
	const [currentMarketId, setCurrentMarketId] = useState(storage.getMarketId());

	const handleMarketSaved = () => {
		// Refresh local state to reflect change if we want to show it.
		setCurrentMarketId(storage.getMarketId());
	}

	return (
		<div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
			<AppHeader title="Pengaturan" />

			<div className="flex-1 overflow-y-auto p-6 space-y-6">
				{/* Main Content */}
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{/* Basic Settings Card */}
					{(isAdmin || isManager) && (
						<div
							className={`bg-white p-6 rounded-2xl border shadow-sm space-y-4 transition-all duration-300 ${highlight === "market"
								? "border-brand-primary ring-4 ring-brand-primary/10 shadow-brand-primary/10"
								: "border-gray-100"
								}`}
						>
							<div className="flex items-center gap-3 mb-2">
								<div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
									<Store className="w-5 h-5" />
								</div>
								<h3 className="font-semibold text-gray-900">
									Pengaturan Market
								</h3>
							</div>

							<p className="text-sm text-gray-500">
								Atur identitas market yang aktif pada perangkat ini. Perubahan
								ini akan disimpan secara lokal.
							</p>

							{currentMarketId && (
								<div className="py-2 px-3 bg-gray-50 rounded-lg text-xs text-gray-600 font-mono break-all">
									ID: {currentMarketId}
								</div>
							)}

							<Button
								variant="outline"
								className="w-full"
								onClick={() => setIsMarketModalOpen(true)}
							>
								Kelola Market
							</Button>
						</div>
					)}
				</div>

				{(isAdmin || isManager) && (
					<ManageMarketModal
						isOpen={isMarketModalOpen}
						onClose={() => setIsMarketModalOpen(false)}
						onSave={handleMarketSaved}
					/>
				)}
			</div>
		</div>
	)
};
