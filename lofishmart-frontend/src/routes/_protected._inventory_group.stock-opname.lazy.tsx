import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useCallback } from "react";
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
        ClipboardCheck,
        Plus,
        Search,
        Eye,
        CheckCircle2,
        AlertTriangle,
        History,
        RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { InventoryService } from "@/services/inventory.service";import { ProfileService } from "@/services/profile.service";
import { useRoleAndPermission } from "@/hooks/useRoleAndPermission";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const Route = createLazyFileRoute(
	"/_protected/_inventory_group/stock-opname",
)({
	component: StockOpnamePage,
});

type OpnameSession = {
	id: string;
	batch: string | null;
	status: "1" | "2" | "3"; // 1:Draft, 2:Approved, 3:Pending
	created_at: string;
	approved_at: string | null;
	market?: { id: string; name: string };
	user?: { id: string; username: string };
};

function StockOpnamePage() {
	const { isAdmin, isManager } = useRoleAndPermission();
	const canApprove = isAdmin || isManager;

	const [sessions, setSessions] = useState<OpnameSession[]>([]);
	const [markets, setMarkets] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	// Create Modal
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [selectedMarketId, setSelectedMarketId] = useState<string>("");
	const [batchName, setBatchName] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const loadData = useCallback(async () => {
		setLoading(true);
		try {
			const [sessionsRes, marketsRes] = await Promise.all([
				InventoryService.getStockOpnameList(),
				ProfileService.getMarketProfiles(),
			]);
			setSessions(sessionsRes || []);
			setMarkets(marketsRes || []);
		} catch (error) {
			console.error("Failed to fetch opname data:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const filteredSessions = useMemo(() => {
		return sessions.filter(
			(s) =>
				(s.market?.name || "")
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				(s.batch || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
				s.id.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [sessions, searchQuery]);

	const handleCreateSession = async () => {
		if (!selectedMarketId) return;
		setIsSubmitting(true);
		try {
			await InventoryService.createOpnameSession(selectedMarketId, batchName);
			await loadData();
			setIsCreateModalOpen(false);
			setBatchName("");
			setSelectedMarketId("");
		} catch (error) {
			toast.error("Gagal membuat sesi opname baru.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleApprove = async (id: string) => {
		if (
			!confirm(
				"Apakah Anda yakin ingin menyetujui opname ini? Stok asli di database akan langsung diperbarui!",
			)
		)
			return;
		setLoading(true);
		try {
			await InventoryService.approveOpname(id);
			await loadData();
		} catch (error) {
			toast.error("Gagal menyetujui opname.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col h-full w-full overflow-hidden">
			<AppHeader
				title="Stock Opname"
				description="Audit dan rekonsiliasi stok fisik dengan sistem"
			>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={loadData}
						disabled={loading}
					>
						<RefreshCw
							className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
						/>
						Refresh
					</Button>
					<Button
						size="sm"
						onClick={() => setIsCreateModalOpen(true)}
						className="bg-blue-600 hover:bg-blue-700 text-white"
					>
						<Plus className="w-4 h-4 mr-2" />
						Sesi Baru
					</Button>
				</div>
			</AppHeader>

			<div className="flex-1 overflow-auto p-6 bg-slate-50/50">
				<Card className="border-none shadow-sm h-full flex flex-col">
					<div className="p-4 border-b flex items-center justify-between gap-4 bg-white">
						<div className="relative w-64 max-w-sm">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
							<Input
								placeholder="Cari sesi atau lokasi..."
								className="pl-9 bg-slate-50 border-slate-200"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>

					<CardContent className="p-0 flex-1 overflow-auto">
						<Table>
							<TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
								<TableRow>
									<TableHead className="w-[180px]">Waktu Mulai</TableHead>
									<TableHead>Lokasi / Market</TableHead>
									<TableHead>Keterangan/Batch</TableHead>
									<TableHead>Petugas</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Aksi</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{loading ? (
									<TableRow>
										<TableCell
											colSpan={6}
											className="h-32 text-center text-slate-400"
										>
											<RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50 text-blue-500" />
											<p>Memuat data audit...</p>
										</TableCell>
									</TableRow>
								) : filteredSessions.length > 0 ? (
									filteredSessions.map((s) => (
										<TableRow key={s.id} className="hover:bg-slate-50/50">
											<TableCell className="font-medium text-slate-600">
												{format(new Date(s.created_at), "dd MMM yyyy, HH:mm", {
													locale: id,
												})}
											</TableCell>
											<TableCell>
												<Badge
													variant="outline"
													className="bg-blue-50 text-blue-700 border-blue-200"
												>
													{s.market?.name || "Semua Lokasi"}
												</Badge>
											</TableCell>
											<TableCell className="text-slate-600">
												{s.batch || "-"}
											</TableCell>
											<TableCell className="text-slate-500 text-sm">
												@{s.user?.username || "system"}
											</TableCell>
											<TableCell>
												{s.status === "2" ? (
													<Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1 hover:bg-emerald-100">
														<CheckCircle2 className="w-3 h-3" />
														Selesai & Sinkron
													</Badge>
												) : (
													<Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1 hover:bg-amber-100">
														<History className="w-3 h-3" />
														Draft / Berjalan
													</Badge>
												)}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button
														variant="ghost"
														size="sm"
														className="text-slate-600 hover:text-blue-600"
													>
														<Eye className="w-4 h-4 mr-1" />
														Detail
													</Button>
													{s.status !== "2" && canApprove && (
														<Button
															variant="default"
															size="sm"
															onClick={() => handleApprove(s.id)}
															className="bg-emerald-600 hover:bg-emerald-700 text-white"
														>
															<CheckCircle2 className="w-4 h-4 mr-1" />
															Approve
														</Button>
													)}
												</div>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={6}
											className="h-40 text-center text-slate-400"
										>
											<ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-10" />
											<p>Belum ada sesi stock opname yang dibuat.</p>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>

			{/* Modal Create Session */}
			<Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Mulai Sesi Opname Baru</DialogTitle>
						<DialogDescription>
							Pilih lokasi yang ingin Anda audit stoknya secara fisik hari ini.
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="market">Lokasi Audit</Label>
							<Select
								value={selectedMarketId}
								onChange={(val) => setSelectedMarketId(String(val))}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Pilih Market / Gudang" />
								</SelectTrigger>
								<SelectContent>
									{markets.map((m) => (
										<SelectItem key={m.id} value={m.id}>
											{m.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="batch">Keterangan / Nama Batch</Label>
							<Input
								id="batch"
								placeholder="Contoh: Audit Mingguan April W3"
								value={batchName}
								onChange={(e) => setBatchName(e.target.value)}
							/>
						</div>

						<div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-3">
							<AlertTriangle className="w-5 h-5 text-blue-600 shrink-0" />
							<p className="text-[12px] text-blue-700 leading-relaxed">
								Memulai sesi baru akan mengambil snapshot stok sistem saat ini
								untuk dibandingkan dengan hitungan fisik Anda nanti.
							</p>
						</div>
					</div>

					<DialogFooter>
						<Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
							Batal
						</Button>
						<Button
							onClick={handleCreateSession}
							disabled={!selectedMarketId || isSubmitting}
							className="bg-blue-600 hover:bg-blue-700"
						>
							{isSubmitting ? "Memulai..." : "Buat Sesi Sekarang"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
