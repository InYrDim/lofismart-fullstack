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
	Search,
	AlertTriangle,
	CheckCircle2,
	Clock,
	XCircle,
	FileText,
} from "lucide-react";
import { InventoryService } from "@/services/inventory.service";
import { useAuth } from "@/hooks/useAuth";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ROLES } from "@/config/roles";
import { toast } from "sonner";
import { AdminOutletSelector } from "@/components/markets/AdminOutletSelector";

export const Route = createLazyFileRoute(
	"/_protected/kelolaoutlet/rejects",
)({
	component: OutletRejectsPage,
});

interface RejectRequest {
	id: string;
	qty: number;
	desc: string;
	approval_status: "PENDING" | "APPROVED" | "REJECTED";
	created_at: string;
	updated_at: string;
	unit?: "1" | "2";
	stock?: {
		product?: { id: string; name: string } | null;
		market?: { id: string; name: string } | null;
		werehouse?: { id: string; name: string } | null;
	} | null;
	user?: {
		id: string;
		username: string;
		name?: string;
	} | null;
	approved_by?: {
		id: string;
		username: string;
	} | null;
	image_proof?: string | null;
}

function OutletRejectsPage() {
	const navigate = useNavigate();
	const { roleId: userRole, marketId: userMarketId, marketName } = useAuth();

	// Check role permission
	useEffect(() => {
		if (userRole && !([ROLES.ADMIN, ROLES.SUPERVISOR] as string[]).includes(userRole)) {
			toast.error("Akses ditolak. Halaman ini hanya untuk Admin dan Supervisor.");
			navigate({ to: "/dashboard" });
		}
	}, [userRole, navigate]);

	// Check if user has market/outlet assigned
	useEffect(() => {
		if (userRole === ROLES.SUPERVISOR && !userMarketId) {
			toast.error("Supervisor tidak memiliki outlet tujuan. Hubungi admin.");
			navigate({ to: "/dashboard" });
		}
	}, [userRole, userMarketId, navigate]);

	const [rejects, setRejects] = useState<RejectRequest[]>([]);
	const [selectedMarketId, setSelectedMarketId] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [selectedReject, setSelectedReject] = useState<RejectRequest | null>(
		null,
	)
	const [isImageOpen, setIsImageOpen] = useState(false);

	const activeMarketId = userRole === ROLES.ADMIN ? selectedMarketId : userMarketId;

	const loadRejects = useCallback(async () => {
		if (!activeMarketId) return;
		setLoading(true);
		try {
			const allRejects = await InventoryService.getRejectList();
			// Filter rejects for this outlet only
			const outletRejects = allRejects.filter(
				(r: RejectRequest) => r.stock?.market?.id === activeMarketId,
			)
			setRejects(outletRejects);
		} catch (error) {
			console.error("Failed to fetch rejects:", error);
		} finally {
			setLoading(false);
		}
	}, [activeMarketId]);

	useEffect(() => {
		loadRejects();
	}, [loadRejects]);

	const filteredRejects = useMemo(() => {
		return rejects.filter((r) => {
			const matchesSearch =
				r.stock?.product?.name
					?.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				r.desc?.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesStatus =
				statusFilter === "all" || r.approval_status === statusFilter;

			return matchesSearch && matchesStatus;
		})
	}, [rejects, searchQuery, statusFilter]);

	const getStatusBadge = (status: RejectRequest["approval_status"]) => {
		switch (status) {
			case "APPROVED":
				return (
					<Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
						<CheckCircle2 className="w-3 h-3 mr-1" />
						Disetujui
					</Badge>
				)
			case "PENDING":
				return (
					<Badge className="bg-amber-100 text-amber-700 border-amber-200">
						<Clock className="w-3 h-3 mr-1" />
						Menunggu
					</Badge>
				)
			case "REJECTED":
				return (
					<Badge variant="destructive">
						<XCircle className="w-3 h-3 mr-1" />
						Ditolak
					</Badge>
				)
		}
	}

	const stats = {
		total: rejects.length,
		pending: rejects.filter((r) => r.approval_status === "PENDING").length,
		approved: rejects.filter((r) => r.approval_status === "APPROVED").length,
		rejected: rejects.filter((r) => r.approval_status === "REJECTED").length,
	}

	const openImage = (reject: RejectRequest) => {
		if (reject.image_proof) {
			setSelectedReject(reject);
			setIsImageOpen(true);
		}
	}

	return (
		<div className="flex flex-col h-full w-full overflow-hidden">
			<AppHeader
				title="Laporan Reject"
				description={marketName ? `Outlet: ${marketName}` : "Lihat laporan barang reject/damaged di outlet"}
			>
				<Button
					variant="outline"
					size="sm"
					onClick={loadRejects}
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
								<AlertTriangle className="w-5 h-5" />
							</div>
							<div>
								<p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
									Total Reject
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{loading ? "..." : stats.total}
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
							<div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
								<CheckCircle2 className="w-5 h-5" />
							</div>
							<div>
								<p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
									Disetujui
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{loading ? "..." : stats.approved}
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
									{loading ? "..." : stats.rejected}
								</p>
							</div>
						</div>
					</div>
				</div>

				<Card className="border-none shadow-sm">
					<div className="p-4 border-b flex items-center justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="relative w-64 max-w-sm">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
								<Input
									placeholder="Cari produk/keterangan..."
									className="pl-9 bg-slate-50 border-slate-200"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
							<Select value={statusFilter} onChange={(v: string | number) => setStatusFilter(String(v))}>
								<SelectTrigger className="w-[200px] bg-slate-50">
									<SelectValue placeholder="Semua Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Semua Status</SelectItem>
									<SelectItem value="PENDING">Menunggu</SelectItem>
									<SelectItem value="APPROVED">Disetujui</SelectItem>
									<SelectItem value="REJECTED">Ditolak</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<CardContent className="p-0">
						{loading ? (
							<div className="flex items-center justify-center py-20">
								<RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
								<p className="ml-3 text-slate-400">Memuat data...</p>
							</div>
						) : filteredRejects.length > 0 ? (
							<Table>
								<TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
									<TableRow className="border-slate-100">
										<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 pl-4">
											ID Reject
										</TableHead>
										<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3">
											Produk
										</TableHead>
										<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 text-center">
											Qty Reject
										</TableHead>
										<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3">
											Keterangan
										</TableHead>
										<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3">
											Tanggal
										</TableHead>
										<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 text-center">
											Bukti Foto
										</TableHead>
										<TableHead className="text-[12px] font-bold text-slate-500 uppercase py-3 text-right pr-4">
											Status
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredRejects.map((r) => (
										<TableRow
											key={r.id}
											className="hover:bg-slate-50/80 border-slate-50"
										>
											<TableCell className="py-3 pl-4 font-mono text-sm text-slate-500">
												...
												{r.id.substring(r.id.length - 8).toUpperCase()}
											</TableCell>
											<TableCell className="py-3 font-medium text-slate-700">
												<div className="flex flex-col">
													<span>
														{r.stock?.product?.name || "Produk Tidak Ditemukan"}
													</span>
													<span className="text-xs text-slate-400">
														{r.user?.name || r.user?.username || "Unknown"}
													</span>
												</div>
											</TableCell>
											<TableCell className="py-3 text-center">
												<Badge
													variant="outline"
													className="bg-red-50 text-red-700 border-red-200"
												>
													{r.qty} {r.unit === "1" ? "KG" : "Ekor"}
												</Badge>
											</TableCell>
											<TableCell className="py-3 text-sm text-slate-600 max-w-xs">
												<p className="truncate" title={r.desc}>
													{r.desc || "-"}
												</p>
											</TableCell>
											<TableCell className="py-3 text-sm text-slate-600">
												{new Date(r.created_at).toLocaleDateString("id-ID", {
													day: "numeric",
													month: "short",
													year: "numeric",
												})}
											</TableCell>
											<TableCell className="py-3 text-center">
												{r.image_proof ? (
													<Button
														variant="ghost"
														size="sm"
														onClick={() => openImage(r)}
														className="text-blue-600 hover:text-blue-700"
													>
														<FileText className="w-4 h-4" />
													</Button>
												) : (
													<span className="text-slate-400 text-xs">-</span>
												)}
											</TableCell>
											<TableCell className="py-3 text-right pr-4">
												{getStatusBadge(r.approval_status)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<div className="flex flex-col items-center justify-center py-20 text-center">
								<AlertTriangle className="w-16 h-16 mb-4 text-gray-200" />
								<p className="text-lg font-medium text-gray-500">
									Tidak ada laporan reject
								</p>
								<p className="text-sm text-gray-400 mt-1">
									{searchQuery || statusFilter !== "all"
										? "Coba ubah filter pencarian"
										: "Belum ada laporan reject"}
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Image Preview Dialog */}
			<Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Bukti Foto Reject</DialogTitle>
					</DialogHeader>
					<div className="mt-4">
						{selectedReject?.image_proof && (
							<img
								src={`${import.meta.env.VITE_API_BASE_URL}/upload/reject/${selectedReject.image_proof}`}
								alt="Bukti reject"
								className="w-full h-auto rounded-lg border"
							/>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
