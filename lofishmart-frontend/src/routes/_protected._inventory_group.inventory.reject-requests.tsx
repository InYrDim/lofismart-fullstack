import { useState, useEffect, useCallback } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { InventoryService, type RejectRequest } from "@/services/inventory.service";
import { Button } from "@/components/ui/button";
import { Modal, ModalFooter } from "@/components/ui/modals/Modal";
import { formatQty } from "@/utils/format";
import {
  ArrowLeft,
  Check,
  X,
  AlertCircle,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute(
	"/_protected/_inventory_group/inventory/reject-requests",
)({
	component: RejectRequestsPage,
});

function RejectRequestsPage() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<RejectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected request for side panel
  const [selectedRequest, setSelectedRequest] = useState<RejectRequest | null>(null);
  // For image preview modal (still keep for zoom)
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await InventoryService.getRejectList();
      setRequests(data || []);
    } catch (err: any) {
      setError(err?.message || "Gagal memuat daftar permintaan reject.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleAction = async (requestId: string, action: 'APPROVED' | 'REJECTED') => {
    if (!confirm(`Apakah Anda yakin ingin ${action === 'APPROVED' ? 'MENYETUJUI' : 'MENOLAK'} permintaan ini?`)) {
      return;
    }

    try {
      await InventoryService.approveReject(requestId, action);
      // Reload the list
      loadRequests();
    } catch (err: any) {
      toast.error(err?.message || "Gagal memproses permintaan.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Disetujui
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 mr-1" />
            Menunggu
          </span>
        );
    }
  };

  return (
    <div className="flex bg-gray-50 w-full h-full overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Header ── */}
        <AppHeader
          title="Permintaan Reject Stok"
          description="Kelola pengajuan barang rusak dari outlet"
        >
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => navigate({ to: "/markets" })}
            className="hidden sm:flex"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </AppHeader>

        {/* ── Content ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm sm:text-base">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap">Tanggal</th>
                    <th className="px-4 py-3 whitespace-nowrap">Outlet</th>
                    <th className="px-4 py-3 whitespace-nowrap">Produk</th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">Qty</th>
                    <th className="px-4 py-3 min-w-[150px]">Keterangan</th>
                    <th className="px-4 py-3 whitespace-nowrap text-center">Bukti</th>
                    <th className="px-4 py-3 whitespace-nowrap text-center">Status</th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                          <span className="ml-2">Memuat data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-900">Belum ada permintaan</p>
                        <p className="text-sm">Tidak ada pengajuan reject stok saat ini.</p>
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr 
                        key={req.id} 
                        className={`hover:bg-gray-50/80 transition-colors cursor-pointer ${
                          selectedRequest?.id === req.id ? "bg-emerald-50/50" : ""
                        }`}
                        onClick={() => setSelectedRequest(req)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600 font-medium">
                          {format(new Date(req.created_at), "dd MMM yyyy", { locale: id })}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                          {req.stock?.market?.name || req.stock?.werehouse?.name || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                          {req.stock?.product?.name || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right font-bold text-red-600">
                          {formatQty(req.qty)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">
                          {req.desc}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          {req.proof_file ? (
                            <div className="flex justify-center">
                              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          {getStatusBadge(req.approval_status)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                          {req.approval_status === "PENDING" && (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 w-8 p-0"
                                onClick={() => handleAction(req.id, "REJECTED")}
                                title="Tolak Pengajuan"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white w-8 p-0"
                                onClick={() => handleAction(req.id, "APPROVED")}
                                title="Setujui (Stok akan dipotong)"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ── Side Panel Details ── */}
      <div 
        className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 flex flex-col ${
          selectedRequest ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="font-bold text-gray-900">Detail Permintaan</h2>
          <Button variant="ghost" size="icon-sm" onClick={() => setSelectedRequest(null)}>
            <X className="w-5 h-5 text-gray-400" />
          </Button>
        </div>

        {selectedRequest && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Status Section */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Status</p>
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedRequest.approval_status)}
                <span className="text-xs text-gray-400">
                  {format(new Date(selectedRequest.updated_at), "dd MMM yyyy, HH:mm", { locale: id })}
                </span>
              </div>
              {selectedRequest.approved_by && (
                <p className="mt-2 text-sm text-gray-600">
                  Diproses oleh: <span className="font-medium">{selectedRequest.approved_by.username}</span>
                </p>
              )}
            </div>

            {/* Product & Market Info */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Produk</p>
                <p className="text-lg font-bold text-gray-900">{selectedRequest.stock?.product?.name || "-"}</p>
                <p className="text-sm text-gray-500">ID Stok: {selectedRequest.stock?.id?.slice(0, 8)}...</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Asal Lokasi</p>
                  <p className="font-medium text-gray-900">{selectedRequest.stock?.market?.name || selectedRequest.stock?.werehouse?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Jumlah (Qty)</p>
                  <p className="font-bold text-red-600 text-lg">
                    {formatQty(selectedRequest.qty)} {selectedRequest.stock?.unit === "1" ? "KG" : "Ekor"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Pelapor</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                    {selectedRequest.user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedRequest.user?.name || selectedRequest.user?.username}</p>
                    <p className="text-xs text-gray-500">Reported on {format(new Date(selectedRequest.created_at), "dd MMM yyyy")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Keterangan / Alasan</p>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-700 leading-relaxed italic">
                "{selectedRequest.desc}"
              </div>
            </div>

            {/* Evidence Image */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bukti Foto</p>
              {selectedRequest.proof_file ? (
                <div 
                  className="relative group cursor-zoom-in overflow-hidden rounded-xl border border-gray-200"
                  onClick={() => {
                    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/reject/${selectedRequest.proof_file}`;
                    setPreviewImage(url);
                  }}
                >
                  <img 
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/reject/${selectedRequest.proof_file}`} 
                    alt="Bukti foto"
                    className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Gambar+Tidak+Ada';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm" className="bg-white/90 backdrop-blur-sm">
                      Perbesar Gambar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-xs">Tidak ada bukti foto dilampirkan</p>
                </div>
              )}
            </div>

            {/* Actions (if Pending) */}
            {selectedRequest.approval_status === "PENDING" && (
              <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleAction(selectedRequest.id, "REJECTED")}
                >
                  <X className="w-4 h-4 mr-2" />
                  Tolak
                </Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleAction(selectedRequest.id, "APPROVED")}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Setujui
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Backdrop for mobile */}
      {selectedRequest && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 sm:hidden"
          onClick={() => setSelectedRequest(null)}
        />
      )}

      {/* Image Preview Modal */}
      <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} title="Bukti Kerusakan">
        <div className="p-4 flex justify-center bg-gray-50">
          {previewImage && (
            <img 
              src={previewImage} 
              alt="Bukti" 
              className="max-w-full max-h-[60vh] object-contain rounded-md shadow-sm border border-gray-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/400x300?text=Gambar+Tidak+Ditemukan';
              }}
            />
          )}
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setPreviewImage(null)}>
            Tutup
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
