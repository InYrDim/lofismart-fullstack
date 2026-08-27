import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/config/roles";
import { ProfileService } from "@/services/profile.service";
import { Card, CardContent } from "@/components/ui/card";
import { Warehouse } from "lucide-react";
import { Select } from "@/components/ui/select";
import type { MarketProfile } from "@/types";

interface GudangSelectorProps {
	selectedGudangId: string;
	onSelect: (gudangId: string) => void;
}

export const AdminGudangSelector: React.FC<GudangSelectorProps> = ({
	selectedGudangId,
	onSelect,
}) => {
	const { roleId: userRole } = useAuth();
	const [gudangs, setGudangs] = useState<MarketProfile[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		let isMounted = true;
		
		if (userRole === ROLES.ADMIN) {
			// Make loading state update asynchronous to avoid cascading render warning
			Promise.resolve().then(() => {
				if (isMounted) setLoading(true);
			});

			ProfileService.getMarketProfiles()
				.then((profiles) => {
					if (!isMounted) return;
					const gudangList = profiles.filter((m) => m.type === "GUDANG");
					setGudangs(gudangList);
				})
				.catch(console.error)
				.finally(() => {
					if (isMounted) setLoading(false);
				});
		}
		
		return () => { isMounted = false; };
	}, [userRole]);

	// Separate effect for auto-selection to avoid cascading renders
	useEffect(() => {
		if (gudangs.length > 0 && !selectedGudangId) {
			onSelect(gudangs[0].id);
		}
	}, [gudangs, selectedGudangId, onSelect]);

	if (userRole !== ROLES.ADMIN) return null;

	return (
		<Card className="border-none shadow-sm mb-6 bg-white">
			<CardContent className="p-6">
				<div className="flex items-center gap-4">
					<div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
						<Warehouse className="w-5 h-5" />
					</div>
					<div className="flex-1">
						<label className="text-sm font-medium text-slate-700 mb-2 block">
							Pilih Gudang
						</label>
						<Select
							value={selectedGudangId}
							onChange={(value: string | number) => onSelect(String(value))}
							placeholder={loading ? "Memuat gudang..." : "Pilih gudang..."}
							options={gudangs.map((g) => ({
								value: g.id,
								label: g.name,
							}))}
							disabled={loading}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
