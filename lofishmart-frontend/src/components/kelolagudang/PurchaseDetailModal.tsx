import React from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Truck,
	Calendar,
	User,
	Store,
	DollarSign,
	FileText,
	ExternalLink,
	Package,
	Tag,
	Hash,
} from "lucide-react";
import { UnitType, type Purchase, type GroupedPurchase } from "@/types";
import { formatQty } from "@/utils/format";

interface PurchaseDetailModalProps {
	item: GroupedPurchase | Purchase | null;
	onClose: () => void;
}

function isGroup(item: GroupedPurchase | Purchase): item is GroupedPurchase {
	return "items" in item;
}

export const PurchaseDetailModal: React.FC<PurchaseDetailModalProps> = ({
	item,
	onClose,
}) => {
	return (
		<Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0">
				<DialogHeader className="p-6 border-b bg-slate-50/50">
					<DialogTitle className="flex items-center gap-3 text-xl">
						<div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg">
							<Truck className="w-5 h-5" />
						</div>
						Detail Transfer Supplier
					</DialogTitle>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto p-6">
					{item && isGroup(item) ? (
						<div className="space-y-6">
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
									<p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
										<Calendar className="w-3 h-3" /> Tanggal
									</p>
									<p className="text-sm font-semibold text-slate-700">
										{new Date(item.date).toLocaleDateString("id-ID", {
											day: "numeric", month: "long", year: "numeric",
										})}
									</p>
								</div>
								<div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
									<p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
										<Store className="w-3 h-3" /> Supplier
									</p>
									<p className="text-sm font-semibold text-slate-700 truncate">
										{item.supplierName}
									</p>
								</div>
								<div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
									<p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
										<User className="w-3 h-3" /> Diterima Oleh
									</p>
									<p className="text-sm font-semibold text-slate-700">
										{item.userName}
									</p>
								</div>
								<div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
									<p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
										<Hash className="w-3 h-3" /> Batch
									</p>
									<p className="text-sm font-semibold text-slate-700">
										{item.id}
									</p>
								</div>
							</div>

							{item.imageProof && (
								<div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
									<div className="flex items-center gap-3">
										<FileText className="w-5 h-5 text-blue-600" />
										<div>
											<p className="text-sm font-semibold text-blue-900">Bukti Transfer / Nota</p>
											<p className="text-xs text-blue-600">File tersedia untuk diunduh</p>
										</div>
									</div>
									<Button variant="outline" size="sm" className="bg-white border-blue-200 text-blue-600 hover:bg-blue-50"
										onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}/upload/${item.imageProof}`, "_blank")}
									>
										<ExternalLink className="w-4 h-4 mr-2" /> Buka File
									</Button>
								</div>
							)}

							<div className="space-y-3">
								<h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
									<Package className="w-3 h-3" /> Daftar Produk ({item.items.length})
								</h4>
								<div className="space-y-2">
									{item.items.map((p) => (
										<div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-brand-primary/20 transition-colors">
											<div className="flex items-center gap-4">
												<div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
													<Package className="w-6 h-6" />
												</div>
												<div className="flex flex-col">
													<span className="font-bold text-slate-700">{p.product?.name}</span>
													<div className="flex items-center gap-2 mt-0.5">
														<Badge className="bg-slate-100 text-slate-500 border-none font-normal text-[10px] h-5">
															<Tag className="w-2.5 h-2.5 mr-1" />{p.product?.category?.name || "Tanpa Kategori"}
														</Badge>
													</div>
												</div>
											</div>
											<div className="flex items-center gap-6 text-right">
												<div className="flex flex-col">
													<span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Qty</span>
													<span className="font-bold text-slate-700">
														{formatQty(Number(p.qty))}{" "}
														<span className="text-[10px] text-slate-400 font-normal">{p.unit === "1" ? "KG" : "EKOR"}</span>
													</span>
												</div>
												<div className="flex flex-col">
													<span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Harga</span>
													<span className="font-bold text-slate-700 text-sm">Rp {p.price.toLocaleString("id-ID")}</span>
												</div>
												<div className="flex flex-col">
													<span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Subtotal</span>
													<span className="font-bold text-brand-primary text-sm">Rp {(p.price * p.qty).toLocaleString("id-ID")}</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							<div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
								<span className="text-sm font-bold text-slate-600">Total Semua</span>
								<span className="text-lg font-bold text-brand-primary">Rp {item.totalAmount.toLocaleString("id-ID")}</span>
							</div>
						</div>
					) : item && !isGroup(item) ? (
						<div className="space-y-6">
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
									<p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
										<Calendar className="w-3 h-3" /> Tanggal
									</p>
									<p className="text-sm font-semibold text-slate-700">
										{new Date(item.created_at).toLocaleDateString("id-ID", {
											day: "numeric", month: "long", year: "numeric",
										})}
									</p>
								</div>
								<div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
									<p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
										<Store className="w-3 h-3" /> Supplier
									</p>
									<p className="text-sm font-semibold text-slate-700 truncate">
										{item.supplier?.name || item.supplier?.corporation || "-"}
									</p>
								</div>
								<div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
									<p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
										<User className="w-3 h-3" /> Diterima Oleh
									</p>
									<p className="text-sm font-semibold text-slate-700">
										{item.user?.name || item.user?.username || "System"}
									</p>
								</div>
								<div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
									<p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
										<Hash className="w-3 h-3" /> Batch
									</p>
									<p className="text-sm font-semibold text-slate-700">
										{item.batch || "-"}
									</p>
								</div>
							</div>

							{item.image_proof && (
								<div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
									<div className="flex items-center gap-3">
										<FileText className="w-5 h-5 text-blue-600" />
										<div>
											<p className="text-sm font-semibold text-blue-900">Bukti Transfer / Nota</p>
											<p className="text-xs text-blue-600">File tersedia untuk diunduh</p>
										</div>
									</div>
									<Button variant="outline" size="sm" className="bg-white border-blue-200 text-blue-600 hover:bg-blue-50"
										onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}/upload/${item.image_proof}`, "_blank")}
									>
										<ExternalLink className="w-4 h-4 mr-2" /> Buka File
									</Button>
								</div>
							)}

							<div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
								<div className="p-4 bg-slate-50 border-b border-slate-100">
									<h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
										<Package className="w-3 h-3" /> Detail Produk
									</h4>
								</div>
								<div className="p-4 flex items-center justify-between">
									<div className="flex items-center gap-4">
										<div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
											<Package className="w-6 h-6" />
										</div>
										<div className="flex flex-col">
											<span className="font-bold text-slate-700">{item.product?.name || "Produk Tidak Diketahui"}</span>
											<div className="flex items-center gap-2 mt-0.5">
												<Badge className="bg-slate-100 text-slate-500 border-none font-normal text-[10px] h-5">
													<Tag className="w-2.5 h-2.5 mr-1" />{item.product?.category?.name || "Tanpa Kategori"}
												</Badge>
											</div>
										</div>
									</div>
									<div className="flex items-center gap-8 text-right">
										<div className="flex flex-col">
											<span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Quantity</span>
											<span className="font-bold text-slate-700">
												{formatQty(Number(item.qty))}{" "}
												<span className="text-[10px] text-slate-400 font-normal">{item.unit === "1" ? "KG" : "EKOR"}</span>
											</span>
										</div>
										<div className="flex flex-col">
											<span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Subtotal</span>
											<span className="font-bold text-brand-primary text-sm">Rp {(item.price * item.qty).toLocaleString("id-ID")}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					) : null}
				</div>

				<div className="p-4 border-t bg-slate-50/30 flex justify-end">
					<Button variant="outline" onClick={onClose}>Tutup</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
