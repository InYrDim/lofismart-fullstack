import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	RefreshCw,
	Truck,
	Search,
	Package,
	ChevronDown,
	ChevronRight,
	CheckCircle2,
	XCircle,
	Clock,
	FileText,
} from "lucide-react";
import { InventoryService } from "@/services/inventory.service";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/config/roles";
import { toast } from "sonner";
import { AdminOutletSelector } from "@/components/markets/AdminOutletSelector";
import type { StockTransfer } from "@/types";
import { TransferStatus } from "@/types";
import { formatQty } from "@/utils/format";

export const Route = createLazyFileRoute(
	"/_protected/kelolaoutlet/transfers",
)({
	component: OutletTransfersPage,
});

function groupTransfers(transfers: StockTransfer[]): { groupId: string; isBatch: boolean; items: StockTransfer[] }[] {
	const groups: { groupId: string; isBatch: boolean; items: StockTransfer[] }[] = [];
	const batchMap = new Map<string, StockTransfer[]>();
	const singles: StockTransfer[] = [];

	for (const t of transfers) {
		if (t.transfer_group) {
			const existing = batchMap.get(t.transfer_group) || [];
			existing.push(t);
			batchMap.set(t.transfer_group, existing);
		} else {
			singles.push(t);
		}
	}

	for (const [groupId, items] of batchMap) {
		groups.push({ groupId, isBatch: items.length > 1, items });
	}
	for (const item of singles) {
		groups.push({ groupId: item.id, isBatch: false, items: [item] });
	}

	return groups.sort((a, b) => {
		const aDate = a.items[0]?.created_at || "";
		const bDate = b.items[0]?.created_at || "";
		return bDate.localeCompare(aDate);
	});
}

function getStatusBadge(status: TransferStatus) {
	switch (status) {
		case TransferStatus.DONE:
			return (
				<Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
					<CheckCircle2 className="w-3 h-3 mr-1" />
					Selesai
				</Badge>
			)
		case TransferStatus.WAITING_VERIFICATION:
			return (
				<Badge className="bg-amber-100 text-amber-700 border-amber-200">
					<Clock className="w-3 h-3 mr-1" />
					Menunggu Verifikasi Outlet
				</Badge>
			)
		case TransferStatus.SENDING:
			return (
				<Badge className="bg-blue-100 text-blue-700 border-blue-200">
					<Truck className="w-3 h-3 mr-1" />
					Dikirim
				</Badge>
			)
		case TransferStatus.CANCELLED:
			return (
				<Badge variant="destructive">
					<XCircle className="w-3 h-3 mr-1" />
					Dibatalkan
				</Badge>
			)
	}
}

function unitLabel(unit: string): string {
	return unit === "1" ? "KG" : "Ekor";
}

function fmtDate(dateStr?: string | null): string {
	if (!dateStr) return "-";
	return new Date(dateStr).toLocaleDateString("id-ID", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

function BatchHistoryCard({ items }: { items: StockTransfer[] }) {
	const [expanded, setExpanded] = useState(true);
	const first = items[0];
	const batchCode = first.transfer_group
		? first.transfer_group.slice(-8).toUpperCase()
		: first.id.substring(first.id.length - 8).toUpperCase();
	const outletName = first.target_market?.name || "-";
	const itemCount = items.length;

	const batchStatus = items.every((t) => t.status === TransferStatus.DONE)
		? TransferStatus.DONE
		: items.every((t) => t.status === TransferStatus.CANCELLED)
			? TransferStatus.CANCELLED
			: items.some((t) => t.status === TransferStatus.WAITING_VERIFICATION)
				? TransferStatus.WAITING_VERIFICATION
				: TransferStatus.DONE;

	const createdAt = first.created_at;
	const verifiedAt = items.find((t) => t.verified_at)?.verified_at || null;

	return (
		<Card className="border border-slate-200 shadow-sm overflow-hidden">
			<div
				className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors"
				onClick={() => setExpanded(!expanded)}
			>
				<div className="flex items-center gap-3 min-w-0">
					{expanded ? (
						<ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
					) : (
						<ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
					)}
					<div className="flex items-center gap-2 min-w-0">
						<FileText className="w-4 h-4 text-slate-500 shrink-0" />
						<span className="font-mono text-sm font-semibold text-slate-700">
							#{batchCode}
						</span>
						{getStatusBadge(batchStatus)}
					</div>
					<span className="text-sm text-slate-500 truncate hidden sm:inline">
						{outletName}
					</span>
				</div>
				<div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
					<span>{itemCount} produk</span>
					<span>{fmtDate(createdAt)}</span>
				</div>
			</div>

			{expanded && (
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow className="border-slate-100">
								<TableHead className="text-[11px] font-bold text-slate-400 uppercase py-2 pl-4 w-10">
									#
								</TableHead>
								<TableHead className="text-[11px] font-bold text-slate-400 uppercase py-2">
									Produk
								</TableHead>
								<TableHead className="text-[11px] font-bold text-slate-400 uppercase py-2 text-center w-20">
									Satuan
								</TableHead>
								<TableHead className="text-[11px] font-bold text-slate-400 uppercase py-2 text-center w-20">
									Qty Kirim
								</TableHead>
								<TableHead className="text-[11px] font-bold text-slate-400 uppercase py-2 text-center w-20">
									Qty Terima
								</TableHead>
								<TableHead className="text-[11px] font-bold text-slate-400 uppercase py-2 text-right pr-4 w-28">
									Status
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{items.map((t, i) => (
								<TableRow key={t.id} className="hover:bg-slate-50/80 border-slate-50">
									<TableCell className="py-2 pl-4 text-xs text-slate-400">
										{i + 1}
									</TableCell>
									<TableCell className="py-2 text-sm font-medium text-slate-700">
										{t.product?.name || "Produk Tidak Ditemukan"}
									</TableCell>
									<TableCell className="py-2 text-sm text-slate-500 text-center">
										{unitLabel(t.unit)}
									</TableCell>
									<TableCell className="py-2 text-center">
										<Badge variant="outline" className="bg-slate-100 text-slate-700 text-xs">
											{formatQty(t.qty)}
										</Badge>
									</TableCell>
									<TableCell className="py-2 text-center">
										{t.verified_qty !== null && t.verified_qty !== undefined ? (
											<span className="text-sm font-bold text-emerald-600">
												{formatQty(t.verified_qty)}
											</span>
										) : (
											<span className="text-slate-300 text-sm">-</span>
										)}
									</TableCell>
									<TableCell className="py-2 text-right pr-4">
										{getStatusBadge(t.status)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					{verifiedAt && (
						<div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-400">
							Diterima: {fmtDate(verifiedAt)}
						</div>
					)}
				</CardContent>
			)}
		</Card>
	)
}

function IndividualTransferRow({ t }: { t: StockTransfer }) {
	return (
		<TableRow className="hover:bg-slate-50/80 border-slate-50">
			<TableCell className="py-3 pl-4 font-mono text-sm text-slate-500">
				...
				{t.id.substring(t.id.length - 8).toUpperCase()}
			</TableCell>
			<TableCell className="py-3 font-medium text-slate-700">
				{t.product?.name || "Produk Tidak Ditemukan"}
			</TableCell>
			<TableCell className="py-3 text-center">
				<Badge
					variant="outline"
					className="bg-slate-100 text-slate-700"
				>
					{t.qty} {unitLabel(t.unit)}
				</Badge>
			</TableCell>
			<TableCell className="py-3 text-center">
				{t.verified_qty !== null &&
				t.verified_qty !== undefined ? (
					<span className="text-sm font-bold text-emerald-600">
						{t.verified_qty} {unitLabel(t.unit)}
					</span>
				) : (
					<span className="text-slate-400 text-sm">-</span>
				)}
			</TableCell>
			<TableCell className="py-3 text-sm text-slate-600">
				<div className="flex flex-col">
					<span>{fmtDate(t.sent_at || t.created_at)}</span>
					{t.verified_at && (
						<span className="text-xs text-slate-400">
							Diterima: {fmtDate(t.verified_at)}
						</span>
					)}
				</div>
			</TableCell>
			<TableCell className="py-3 text-right pr-4">
				{getStatusBadge(t.status)}
			</TableCell>
		</TableRow>
	)
}

function OutletTransfersPage() {
	const navigate = useNavigate();
	const { roleId: userRole, marketId: userMarketId, marketName } = useAuth();

	useEffect(() => {
		if (userRole && !([ROLES.ADMIN, ROLES.SUPERVISOR] as string[]).includes(userRole)) {
			toast.error("Akses ditolak. Halaman ini hanya untuk Admin dan Supervisor.");
			navigate({ to: "/dashboard" });
		}
	}, [userRole, navigate]);

	useEffect(() => {
		if (userRole === ROLES.SUPERVISOR && !userMarketId) {
			toast.error("Supervisor tidak memiliki outlet tujuan. Hubungi admin.");
			navigate({ to: "/dashboard" });
		}
	}, [userRole, userMarketId, navigate]);

	const [transfers, setTransfers] = useState<StockTransfer[]>([]);
	const [selectedMarketId, setSelectedMarketId] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");

	const activeMarketId = userRole === ROLES.ADMIN ? selectedMarketId : userMarketId;

	const loadTransfers = useCallback(async () => {
		if (!activeMarketId) return;
		setLoading(true);
		try {
			const allTransfers = await InventoryService.getTransferList();
			const outletTransfers = allTransfers.filter(
				(t) => t.target_market?.id === activeMarketId && t.status !== TransferStatus.SENDING,
			)
			setTransfers(outletTransfers);
		} catch (error) {
			console.error("Failed to fetch transfers:", error);
		} finally {
			setLoading(false);
		}
	}, [activeMarketId]);

	useEffect(() => {
		loadTransfers();
	}, [loadTransfers]);

	const filteredGroups = useMemo(() => {
		const filtered = transfers.filter((t) => {
			const matchesSearch =
				t.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				t.target_market?.name?.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesStatus =
				statusFilter === "all" || t.status === statusFilter;

			return matchesSearch && matchesStatus;
		})
		return groupTransfers(filtered);
	}, [transfers, searchQuery, statusFilter]);

	const stats = {
		total: transfers.length,
		done: transfers.filter((t) => t.status === TransferStatus.DONE).length,
		pending: transfers.filter(
			(t) => t.status === TransferStatus.WAITING_VERIFICATION,
		).length,
		cancelled: transfers.filter((t) => t.status === TransferStatus.CANCELLED).length,
	}

	return (
		<div className="flex flex-col h-full w-full overflow-hidden">
			<AppHeader
				title="Riwayat Penerimaan"
				description={marketName ? `Outlet: ${marketName}` : "Lihat riwayat penerimaan stok dari gudang ke outlet"}
			>
				<Button
					variant="outline"
					size="sm"
					onClick={loadTransfers}
					disabled={loading}
					className="gap-2"
				>
					<RefreshCw
						className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
					/>
					Refresh
				</Button>
			</AppHeader>

			<div className="flex-1 overflow-auto p-6 bg-slate-50/50">
				<AdminOutletSelector 
					selectedMarketId={selectedMarketId} 
					onSelect={(id) => setSelectedMarketId(id)} 
				/>

				{/* Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
					<div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
								<Truck className="w-5 h-5" />
							</div>
							<div>
								<p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
									Total Transfer
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{loading ? "..." : stats.total}
								</p>
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
								<CheckCircle2 className="w-5 h-5" />
							</div>
							<div>
								<p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
									Selesai
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{loading ? "..." : stats.done}
								</p>
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
								<Clock className="w-5 h-5" />
							</div>
							<div>
								<p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
									Menunggu
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{loading ? "..." : stats.pending}
								</p>
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="p-2.5 bg-red-100 text-red-600 rounded-xl">
								<XCircle className="w-5 h-5" />
							</div>
							<div>
								<p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
									Dibatalkan
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{loading ? "..." : stats.cancelled}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Filters */}
				<Card className="border-none shadow-sm mb-4">
					<div className="p-4 border-b flex items-center justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="relative w-64 max-w-sm">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
								<Input
									placeholder="Cari produk..."
									className="pl-9 bg-slate-50 border-slate-200"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
							<Select value={statusFilter} onChange={(v) => setStatusFilter(String(v))}>
								<SelectTrigger className="w-[200px] bg-slate-50">
									<SelectValue placeholder="Semua Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Semua Status</SelectItem>
									<SelectItem value={TransferStatus.DONE}>Selesai</SelectItem>
									<SelectItem value={TransferStatus.WAITING_VERIFICATION}>
										Menunggu Verifikasi
									</SelectItem>
									<SelectItem value={TransferStatus.CANCELLED}>Dibatalkan</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Batch Groups & Individual Items */}
					<CardContent className="p-4 space-y-3">
						{loading ? (
							<div className="flex items-center justify-center py-20">
								<RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
								<p className="ml-3 text-slate-400">Memuat data...</p>
							</div>
						) : filteredGroups.length > 0 ? (
							filteredGroups.map((group) =>
								group.isBatch ? (
									<BatchHistoryCard key={group.groupId} items={group.items} />
								) : null
							)
						) : (
							<div className="flex flex-col items-center justify-center py-20 text-center">
								<Package className="w-16 h-16 mb-4 text-gray-200" />
								<p className="text-lg font-medium text-gray-500">
									Tidak ada riwayat transfer
								</p>
								<p className="text-sm text-gray-400 mt-1">
									{searchQuery || statusFilter !== "all"
										? "Coba ubah filter pencarian"
										: "Belum ada transfer dari gudang"}
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Individual (non-batch) Transfers */}
				{!loading && filteredGroups.filter((g) => !g.isBatch).length > 0 && (
					<Card className="border-none shadow-sm">
						<div className="px-4 py-3 border-b border-slate-100">
							<h3 className="text-sm font-semibold text-slate-600">
								Transfer Individual
							</h3>
						</div>
						<CardContent className="p-0">
							<Table>
								<TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
									<TableRow className="border-slate-100">
										<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 pl-4">
											ID Transfer
										</TableHead>
										<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3">
											Produk
										</TableHead>
										<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 text-center">
											Qty Dikirim
										</TableHead>
										<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 text-center">
											Qty Diterima
										</TableHead>
										<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3">
											Tanggal
										</TableHead>
										<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 text-right pr-4">
											Status
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredGroups.filter((g) => !g.isBatch).map((g) => (
										<IndividualTransferRow key={g.groupId} t={g.items[0]} />
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	)
}
