import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	RefreshCw,
	Search,
	ShoppingBag,
	Package,
	DollarSign,
} from "lucide-react";
import { InventoryService } from "@/services/inventory.service";
import { AdminGudangSelector } from "@/components/markets/AdminGudangSelector";
import { PurchaseDetailModal } from "@/components/kelolagudang/PurchaseDetailModal";
import { PurchaseHistoryTable } from "@/components/kelolagudang/PurchaseHistoryTable";
import { useAuth } from "@/hooks/useAuth";
import type { Purchase, GroupedPurchase } from "@/types";

export const Route = createLazyFileRoute("/_protected/kelolagudang/purchases")({
	component: GudangPurchasesPage,
});

function groupByBatch(purchases: Purchase[]): (GroupedPurchase | Purchase)[] {
	const batchMap = new Map<string, Purchase[]>();
	const singles: Purchase[] = [];

	for (const p of purchases) {
		if (p.batch) {
			const existing = batchMap.get(p.batch) || [];
			existing.push(p);
			batchMap.set(p.batch, existing);
		} else {
			singles.push(p);
		}
	}

	const groups: (GroupedPurchase | Purchase)[] = [];

	for (const [batch, items] of batchMap) {
		groups.push({
			id: batch,
			date: items[0].created_at,
			supplierName: items[0].supplier?.name || items[0].supplier?.corporation || "Unknown Supplier",
			warehouseName: items[0].warehouse?.name || "Unknown Warehouse",
			imageProof: items[0].image_proof,
			totalAmount: items.reduce((sum, p) => sum + (p.price || 0) * (p.qty || 0), 0),
			items,
			userName: items[0].user?.name || items[0].user?.username || "System",
		});
	}

	const sorted = [...groups, ...singles].sort((a, b) => {
		const aDate = "created_at" in a ? a.created_at : a.date;
		const bDate = "created_at" in b ? b.created_at : b.date;
		return new Date(bDate).getTime() - new Date(aDate).getTime();
	});

	return sorted;
}

function GudangPurchasesPage() {
	const { marketId: userMarketId } = useAuth();
	const [purchases, setPurchases] = useState<Purchase[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedGudangId, setSelectedGudangId] = useState<string>("");
	const [selectedItem, setSelectedItem] = useState<GroupedPurchase | Purchase | null>(null);

	const activeGudangId = selectedGudangId || userMarketId || "";

	const loadPurchases = useCallback(async () => {
		if (!activeGudangId) return;
		setLoading(true);
		try {
			const data = await InventoryService.getIntakeHistory(activeGudangId);
			setPurchases(data || []);
		} catch (error) {
			console.error("Failed to fetch purchases:", error);
		} finally {
			setLoading(false);
		}
	}, [activeGudangId]);

	useEffect(() => {
		loadPurchases();
	}, [loadPurchases]);

	const filteredData = useMemo(() => {
		const query = searchQuery.toLowerCase();
		const filtered = purchases.filter((p) => {
			return (
				p.supplier?.name?.toLowerCase().includes(query) ||
				p.supplier?.corporation?.toLowerCase().includes(query) ||
				p.batch?.toLowerCase().includes(query) ||
				p.product?.name?.toLowerCase().includes(query) ||
				p.warehouse?.name?.toLowerCase().includes(query)
			);
		});
		return groupByBatch(filtered);
	}, [purchases, searchQuery]);

	const totalSpend = filteredData.reduce((sum, item) => {
		if ("items" in item) {
			return sum + item.items.reduce((s, p) => s + (p.price || 0) * (p.qty || 0), 0);
		}
		return sum + (item.price || 0) * (item.qty || 0);
	}, 0);
	const totalTransactions = filteredData.length;

	return (
		<div className="flex flex-col h-full w-full overflow-hidden">
			<AppHeader
				title="Riwayat Transfer Supplier"
				description="Daftar barang yang diterima dari supplier (30 hari terakhir)"
			>
				<Button
					variant="outline"
					size="sm"
					onClick={loadPurchases}
					disabled={loading}
					className="gap-2"
				>
					<RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
					Refresh
				</Button>
			</AppHeader>

			<div className="flex-1 overflow-auto p-6 bg-slate-50/50">
				<AdminGudangSelector
					selectedGudangId={selectedGudangId}
					onSelect={(id) => setSelectedGudangId(id)}
				/>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
								<ShoppingBag className="w-5 h-5" />
							</div>
							<div>
								<p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
									Total Transaksi
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{loading ? "..." : totalTransactions}
								</p>
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
								<DollarSign className="w-5 h-5" />
							</div>
							<div>
								<p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
									Total Pengeluaran
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{loading ? "..." : `Rp ${totalSpend.toLocaleString("id-ID")}`}
								</p>
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
								<Package className="w-5 h-5" />
							</div>
							<div>
								<p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
									Total Item
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{loading ? "..." : filteredData.reduce((sum, item) => {
										if ("items" in item) return sum + item.items.length;
										return sum + 1;
									}, 0)}
								</p>
							</div>
						</div>
					</div>
				</div>

				<Card className="border-none shadow-sm flex flex-col flex-1">
					<div className="p-4 border-b flex items-center justify-between gap-4">
						<div className="relative w-72 max-sm:w-full">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
							<Input
								placeholder="Cari produk, supplier, atau batch..."
								className="pl-9 bg-slate-50 border-slate-200"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
						<span className="text-xs text-slate-400">
							{totalTransactions} transaksi
						</span>
					</div>

					<CardContent className="p-0">
						<PurchaseHistoryTable
							loading={loading}
							data={filteredData}
							onSelect={setSelectedItem}
						/>
					</CardContent>
				</Card>
			</div>

			<PurchaseDetailModal
				item={selectedItem}
				onClose={() => setSelectedItem(null)}
			/>
		</div>
	);
}
