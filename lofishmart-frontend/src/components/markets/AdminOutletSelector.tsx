import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContextDef";
import { ROLES } from "@/config/roles";
import { ProfileService } from "@/services/profile.service";
import { Card, CardContent } from "@/components/ui/card";
import { Store } from "lucide-react";
import { Select } from "@/components/ui/select";
import type { MarketProfile } from "@/types";

interface OutletSelectorProps {
	selectedMarketId: string;
	onSelect: (marketId: string) => void;
}

export const AdminOutletSelector: React.FC<OutletSelectorProps> = ({
	selectedMarketId,
	onSelect,
}) => {
	const auth = useContext(AuthContext);
	const userRole = auth?.roleId;
	const [outlets, setOutlets] = useState<MarketProfile[]>([]);
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
					const outletList = profiles.filter((m) => m.type === "OUTLET");
					setOutlets(outletList);
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
		if (outlets.length > 0 && !selectedMarketId) {
			onSelect(outlets[0].id);
		}
	}, [outlets, selectedMarketId, onSelect]);

	if (userRole !== ROLES.ADMIN) return null;

	return (
		<Card className="border-none shadow-sm mb-6 bg-white">
			<CardContent className="p-6">
				<div className="flex items-center gap-4">
					<div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl">
						<Store className="w-5 h-5" />
					</div>
					<div className="flex-1">
						<label className="text-sm font-medium text-slate-700 mb-2 block">
							Pilih Outlet Tujuan
						</label>
						<Select
							value={selectedMarketId}
							onChange={(value: string | number) => onSelect(String(value))}
							placeholder={loading ? "Memuat outlet..." : "Pilih outlet..."}
							options={outlets.map((o) => ({
								value: o.id,
								label: o.name,
							}))}
							disabled={loading}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
