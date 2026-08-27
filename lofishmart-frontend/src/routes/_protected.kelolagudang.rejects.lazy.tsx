import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback } from "react";
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
	RefreshCw,
	Search,
	Ban,
	CheckCircle2,
	Clock,
	XCircle,
} from "lucide-react";
import {
	InventoryService,
	type RejectRequest,
} from "@/services/inventory.service";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { formatQty } from "@/utils/format";
import { ROLES } from "@/config/roles";
import { AdminGudangSelector } from "@/components/markets/AdminGudangSelector";

export const Route = createLazyFileRoute("/_protected/kelolagudang/rejects")({
	component: GudangRejectsPage,
});

const APPROVAL_CONFIG = {
	PENDING: {
		label: "Menunggu",
		icon: Clock,
		className: "bg-amber-100 text-amber-700 border-amber-200",
	},
	APPROVED: {
		label: "Disetujui",
		icon: CheckCircle2,
		className: "bg-emerald-100 text-emerald-700 border-emerald-200",
	},
	REJECTED: {
		label: "Ditolak",
		icon: XCircle,
		className: "bg-red-100 text-red-700 border-red-200",
	},
};

function GudangRejectsPage() {
	const { roleId: userRole, marketId: userMarketId } = useAuth();
	const isManagement = userRole === ROLES.ADMIN || userRole === ROLES.MANAGER;

	const [rejects, setRejects] = useState<RejectRequest[]>([]);
	const [selectedGudangId, setSelectedGudangId] = useState("");
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [processingId, setProcessingId] = useState<string | null>(null);

	const activeGudangId =
		userRole === ROLES.ADMIN ? selectedGudangId : userMarketId;

	const loadRejects = useCallback(async () => {
		if (!activeGudangId) return;
		setLoading(true);
		try {
			const data = await InventoryService.getRejectList({
				market_id: activeGudangId,
			});
			setRejects(data || []);
		} catch (error) {
			console.error("Failed to fetch rejects:", error);
		} finally {
			setLoading(false);
		}
	}, [activeGudangId]);

	useEffect(() => {
		loadRejects();
	}, [loadRejects]);

	const handleApproval = async (
		id: string,
		action: "APPROVED" | "REJECTED",
	) => {
		setProcessingId(id);
		try {
			await InventoryService.approveReject(id, action);
			toast.success(
				action === "APPROVED" ? "Reject disetujui" : "Reject ditolak",
			);
			await loadRejects();
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Gagal memproses reject";
			toast.error(message);
		} finally {
			setProcessingId(null);
		}
	};

	const filtered = useMemo(() => {
		return rejects.filter((r) => {
			const productName = r.stock?.product?.name || "";
			const userName = r.user?.name || r.user?.username || "";
			const query = searchQuery.toLowerCase();
			return (
				productName.toLowerCase().includes(query) ||
				userName.toLowerCase().includes(query)
			);
		});
	}, [rejects, searchQuery]);

	// Summary
	const pending = rejects.filter((r) => r.approval_status === "PENDING").length;
	const approved = rejects.filter(
		(r) => r.approval_status === "APPROVED",
	).length;
	const rejected = rejects.filter(
		(r) => r.approval_status === "REJECTED",
	).length;

	return (
		<div className="flex flex-col h-full w-full overflow-hidden">
			<AppHeader
				title="Laporan Reject"
				description="Daftar barang yang di-reject dari stok gudang"
			>
				<Button
					variant="outline"
					size="sm"
					onClick={loadRejects}
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

				{/* Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
									{loading ? "..." : pending}
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
									Disetujui
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{loading ? "..." : approved}
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
									Ditolak
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{loading ? "..." : rejected}
								</p>
							</div>
						</div>
					</div>
				</div>

				<Card className="border-none shadow-sm flex flex-col flex-1">
					<div className="p-4 border-b flex items-center justify-between gap-4">
						<div className="relative w-72 max-w-sm">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
							<Input
								placeholder="Cari produk atau pelapor..."
								className="pl-9 bg-slate-50 border-slate-200"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>

					<CardContent className="p-0 flex-1 overflow-auto">
						<Table>
							<TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
								<TableRow className="border-slate-100">
									<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 pl-4">
										Tanggal
									</TableHead>
									<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3">
										Produk
									</TableHead>
									<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3">
										Lokasi
									</TableHead>
									<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 text-right">
										Qty
									</TableHead>
									<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3">
										Keterangan
									</TableHead>
									<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3">
										Pelapor
									</TableHead>
									<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 text-center">
										Status
									</TableHead>
									{isManagement && (
										<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 text-right pr-4">
											Aksi
										</TableHead>
									)}
								</TableRow>
							</TableHeader>
							<TableBody>
								{loading ? (
									<TableRow>
										<TableCell
											colSpan={isManagement ? 8 : 7}
											className="h-32 text-center text-slate-400"
										>
											<RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50 text-blue-500" />
											<p>Memuat data reject...</p>
										</TableCell>
									</TableRow>
								) : filtered.length > 0 ? (
									filtered.map((r) => {
										const cfg = APPROVAL_CONFIG[r.approval_status];
										const StatusIcon = cfg.icon;
										const unitLabel = r.stock?.unit === "1" ? "KG" : "EKOR";
										const locationName =
											r.stock?.market?.name || r.stock?.werehouse?.name || "—";

										return (
											<TableRow
												key={r.id}
												className="hover:bg-slate-50/80 border-slate-50"
											>
												<TableCell className="py-3 pl-4 text-sm text-slate-500">
													{new Date(r.created_at).toLocaleDateString("id-ID", {
														day: "2-digit",
														month: "short",
														year: "numeric",
													})}
												</TableCell>
												<TableCell className="py-3 font-medium text-slate-700">
													{r.stock?.product?.name || "—"}
												</TableCell>
												<TableCell className="py-3">
													<Badge
														variant="outline"
														className="font-normal text-slate-600 bg-slate-100 border-slate-200 text-xs"
													>
														{locationName}
													</Badge>
												</TableCell>
												<TableCell className="py-3 text-right font-semibold text-red-600">
													{formatQty(Number(r.qty))}{" "}
													<span className="text-xs text-slate-400 font-normal">
														{unitLabel}
													</span>
												</TableCell>
												<TableCell className="py-3 text-sm text-slate-600 max-w-[200px] truncate">
													{r.desc || "—"}
												</TableCell>
												<TableCell className="py-3 text-sm text-slate-600">
													{r.user?.name || r.user?.username || "—"}
												</TableCell>
												<TableCell className="py-3 text-center">
													<span
														className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${cfg.className}`}
													>
														<StatusIcon className="w-3 h-3" />
														{cfg.label}
													</span>
												</TableCell>
												{isManagement && (
													<TableCell className="py-3 text-right pr-4">
														{r.approval_status === "PENDING" && (
															<div className="flex items-center gap-1 justify-end">
																<Button
																	size="sm"
																	variant="ghost"
																	onClick={() =>
																		handleApproval(r.id, "APPROVED")
																	}
																	disabled={processingId === r.id}
																	className="text-emerald-600 hover:bg-emerald-50 text-xs h-7 px-2"
																>
																	<CheckCircle2 className="w-3.5 h-3.5 mr-1" />
																	ACC
																</Button>
																<Button
																	size="sm"
																	variant="ghost"
																	onClick={() =>
																		handleApproval(r.id, "REJECTED")
																	}
																	disabled={processingId === r.id}
																	className="text-red-600 hover:bg-red-50 text-xs h-7 px-2"
																>
																	<XCircle className="w-3.5 h-3.5 mr-1" />
																	Tolak
																</Button>
															</div>
														)}
													</TableCell>
												)}
											</TableRow>
										);
									})
								) : (
									<TableRow>
										<TableCell
											colSpan={isManagement ? 8 : 7}
											className="h-40 text-center text-slate-400"
										>
											<Ban className="w-12 h-12 mx-auto mb-3 opacity-20" />
											<p>Belum ada data reject.</p>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
