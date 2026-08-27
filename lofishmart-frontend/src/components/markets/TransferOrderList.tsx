import { useState } from "react";
import {
  Truck, Clock, CheckCircle2, XCircle, RefreshCw,
  AlertCircle, Printer, ChevronDown, ChevronUp, Package, Calendar
} from "lucide-react";
import { TransferOrderService, type StockTransfer } from "@/services/inventory.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatQty } from "@/utils/format";

interface TransferOrderListProps {
  transfers: StockTransfer[];
  userRole: string | undefined;
  onSuccess: () => void;
  onPrint: (transfer: StockTransfer, type: "delivery" | "receipt") => void;
}

const STATUS_CONFIG = {
  SENDING: {
    label: "Mengirim",
    icon: Truck,
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    dot: "bg-orange-400",
  },
  WAITING_VERIFICATION: {
    label: "Menunggu Verifikasi Outlet",
    icon: Clock,
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  DONE: {
    label: "Selesai",
    icon: CheckCircle2,
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-400",
  },
  CANCELLED: {
    label: "Dibatalkan",
    icon: XCircle,
    badge: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-300",
  },
};

function StatusBadge({ status }: { status: StockTransfer["status"] }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function TransferOrderRow({
  transfer,
  userRole,
  onSuccess,
  onPrint,
}: {
  transfer: StockTransfer;
  userRole: string | undefined;
  onSuccess: () => void;
  onPrint: (transfer: StockTransfer, type: "delivery" | "receipt") => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedQty, setVerifiedQty] = useState<string>("");
  const [verifiedNotes, setVerifiedNotes] = useState<string>("");
  const [showVerifyForm, setShowVerifyForm] = useState(false);

  const isManagement = userRole === "ADMN" || userRole === "MGR";
  const isGudang = userRole === "GDNG" || isManagement;
  const isSPVR = userRole === "SPVR";

  const handleConfirmSend = async () => {
    setLoading(true);
    setError(null);
    try {
      await TransferOrderService.updateStatus(transfer.id, "WAITING_VERIFICATION");
      toast.success("Pengiriman berhasil dikonfirmasi");
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal mengubah status");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const qty = Number(verifiedQty);
    if (!qty || qty <= 0) {
      setError("Masukkan jumlah yang diterima");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await TransferOrderService.updateStatus(transfer.id, "DONE", qty, verifiedNotes || undefined);
      toast.success("Penerimaan berhasil diverifikasi");
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal verifikasi");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Batalkan pengiriman ini? Stok gudang akan dikembalikan.")) return;
    setLoading(true);
    setError(null);
    try {
      await TransferOrderService.cancel(transfer.id);
      toast.success("Pengiriman dibatalkan");
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal membatalkan");
    } finally {
      setLoading(false);
    }
  };

  const unit = transfer.unit === "1" ? "kg" : "ekor";
  const productName = transfer.product?.name || "Unknown";
  const outletName = transfer.target_market?.name || "Unknown";
  const senderName = transfer.created_by?.name || "-";

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-all">
      {/* Header Row */}
      <div
        className="flex items-center gap-4 px-4 py-3 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{productName}</span>
            <span className="text-gray-400 text-xs">→</span>
            <span className="text-blue-600 font-medium text-sm">{outletName}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            #{transfer.id.slice(-8).toUpperCase()} · {new Date(transfer.created_at).toLocaleDateString("id-ID")} · oleh {senderName}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-bold text-gray-700">
            {formatQty(transfer.qty)} {unit}
          </span>
          <StatusBadge status={transfer.status} />
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="px-4 pb-4 bg-gray-50/50 border-t border-gray-100 space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center gap-2 text-xs mt-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Info Detail */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Dikirim</p>
              <p className="font-bold text-gray-800">{formatQty(transfer.qty)} {unit}</p>
            </div>
            {transfer.verified_qty != null && (
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Diterima</p>
                <p className="font-bold text-emerald-700">{formatQty(transfer.verified_qty)} {unit}</p>
              </div>
            )}
            {transfer.sent_at && (
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Tgl Kirim</p>
                <p className="font-medium text-gray-700 text-sm">{new Date(transfer.sent_at).toLocaleDateString("id-ID")}</p>
              </div>
            )}
            {transfer.verified_at && (
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Tgl Terima</p>
                <p className="font-medium text-gray-700 text-sm">{new Date(transfer.verified_at).toLocaleDateString("id-ID")}</p>
              </div>
            )}
          </div>

          {transfer.notes && (
            <p className="text-xs text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-100">
              📝 <span className="font-medium">Catatan Pengirim:</span> {transfer.notes}
            </p>
          )}
          {transfer.verified_notes && (
            <p className="text-xs text-gray-500 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
              ✅ <span className="font-medium">Catatan Penerima:</span> {transfer.verified_notes}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {/* GDNG: Konfirmasi Sudah Dikirim */}
            {isGudang && transfer.status === "SENDING" && (
              <>
                <Button
                  size="sm"
                  onClick={handleConfirmSend}
                  disabled={loading}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" /> : <Truck className="w-3.5 h-3.5 mr-1" />}
                  Konfirmasi Sudah Dikirim
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Batalkan
                </Button>
              </>
            )}

            {/* Cetak Surat Jalan */}
            {(transfer.status === "WAITING_VERIFICATION" || transfer.status === "DONE") && (isGudang || isManagement) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPrint(transfer, "delivery")}
                className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs"
              >
                <Printer className="w-3.5 h-3.5 mr-1" />
                Cetak Surat Jalan
              </Button>
            )}

            {/* SPVR: ACC & Verifikasi */}
            {isSPVR && transfer.status === "WAITING_VERIFICATION" && (
              <div className="w-full space-y-2">
                {!showVerifyForm ? (
                  <Button
                    size="sm"
                    onClick={() => { setShowVerifyForm(true); setVerifiedQty(String(transfer.qty)); }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    ACC & Terima Barang
                  </Button>
                ) : (
                  <div className="bg-white border border-emerald-200 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Konfirmasi Penerimaan</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Qty Diterima ({unit}) <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          step={transfer.unit === "2" ? "1" : "0.01"}
                          value={verifiedQty}
                          onChange={(e) => setVerifiedQty(e.target.value)}
                          className="h-9 text-sm"
                          placeholder={String(transfer.qty)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Catatan</label>
                        <Input
                          value={verifiedNotes}
                          onChange={(e) => setVerifiedNotes(e.target.value)}
                          className="h-9 text-sm"
                          placeholder="Kondisi barang..."
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleVerify} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                        {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                        Konfirmasi Terima
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowVerifyForm(false)} className="text-xs">Batal</Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cetak Bukti Terima */}
            {transfer.status === "DONE" && (isSPVR || isManagement) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPrint(transfer, "receipt")}
                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs"
              >
                <Printer className="w-3.5 h-3.5 mr-1" />
                Cetak Bukti Terima
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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

function BatchCard({ group, userRole, onSuccess, onPrint }: {
  group: { groupId: string; isBatch: boolean; items: StockTransfer[] };
  userRole: string | undefined;
  onSuccess: () => void;
  onPrint: (transfer: StockTransfer, type: "delivery" | "receipt") => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isGudang = userRole === "GDNG" || userRole === "ADMN" || userRole === "MGR";
  const isSPVR = userRole === "SPVR";
  const allSending = group.items.every((t) => t.status === "SENDING");
  const allDone = group.items.every((t) => t.status === "DONE");
  const allCancelled = group.items.every((t) => t.status === "CANCELLED");
  const anyDone = group.items.some((t) => t.status === "DONE");

  const status = allSending ? "SENDING"
    : allDone ? "DONE"
    : allCancelled ? "CANCELLED"
    : anyDone ? "DONE"
    : "WAITING_VERIFICATION";
  const first = group.items[0];
  const outletName = first?.target_market?.name || "-";
  const unitLabel = (u: string) => (u === "1" ? "KG" : "Ekor");
  const fmtQty = (t: StockTransfer) => formatQty(t.qty);

  // Status-based visual styling
  const cardBorderClass: Record<string, string> = {
    SENDING: "border-l-orange-400",
    WAITING_VERIFICATION: "border-l-amber-400",
    DONE: "border-l-emerald-400",
    CANCELLED: "border-l-gray-300",
  };
  const headerBgClass: Record<string, string> = {
    SENDING: "bg-orange-50 border-b-orange-100",
    WAITING_VERIFICATION: "bg-amber-50 border-b-amber-100",
    DONE: "bg-emerald-50 border-b-emerald-100",
    CANCELLED: "bg-gray-50 border-b-gray-100",
  };
  const headerTextClass: Record<string, string> = {
    SENDING: "text-orange-700",
    WAITING_VERIFICATION: "text-amber-700",
    DONE: "text-emerald-700",
    CANCELLED: "text-gray-500",
  };

  const formattedDate = first?.created_at
    ? new Date(first.created_at).toLocaleDateString("id-ID", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "";

  const handleBulkConfirm = async () => {
    setConfirming(true);
    setError(null);
    const ids = group.items.map((t) => t.id);
    await TransferOrderService.bulkConfirmSend(ids);
    setConfirming(false);
    toast.success("Batch berhasil dikonfirmasi");
    onSuccess();
  };

  const handleCancelBatch = async () => {
    if (!confirm("Batalkan semua pengiriman dalam batch ini? Stok gudang akan dikembalikan.")) return;
    setCancelling(true);
    setError(null);
    try {
      for (const t of group.items) {
        if (t.status === "SENDING") {
          await TransferOrderService.cancel(t.id);
        }
      }
      toast.success("Batch dibatalkan");
      onSuccess();
    } catch {
      setError("Gagal membatalkan beberapa item");
    } finally {
      setCancelling(false);
    }
  };

  const handlePrintDelivery = () => {
    const now = new Date().toLocaleDateString("id-ID");
    const rows = group.items.map((t, i) => `
      <tr>
        <td style="text-align:center;padding:6px 8px;border:1px solid #d1d5db;">${i + 1}</td>
        <td style="padding:6px 8px;border:1px solid #d1d5db;">${t.product?.name || "-"}</td>
        <td style="text-align:center;padding:6px 8px;border:1px solid #d1d5db;">${unitLabel(t.unit)}</td>
        <td style="text-align:center;padding:6px 8px;border:1px solid #d1d5db;">${fmtQty(t)}</td>
      </tr>
    `).join("");

    const html = `
      <html><head><title>Surat Jalan #${group.groupId.slice(-8).toUpperCase()}</title>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 12px; padding: 30px; }
        h1 { font-size: 16px; text-align: center; margin-bottom: 4px; }
        h2 { font-size: 13px; text-align: center; color: #555; margin-top: 0; font-weight: normal; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #f3f4f6; padding: 6px 8px; border: 1px solid #d1d5db; font-size: 11px; text-align: left; }
        td { font-size: 11px; }
        .info { display: flex; justify-content: space-between; margin-top: 12px; font-size: 11px; }
        .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 11px; }
        .sign { text-align: center; }
        .sign div { margin-top: 36px; }
      </style></head><body>
        <h1>SURAT JALAN</h1>
        <h2>Transfer Gudang → Outlet</h2>
        <hr style="border-top:2px dashed #333;" />
        <div class="info">
          <div><strong>No. Batch:</strong> #${group.groupId.slice(-8).toUpperCase()}</div>
          <div><strong>Tanggal:</strong> ${now}</div>
        </div>
        <div class="info">
          <div><strong>Tujuan:</strong> ${outletName}</div>
          <div><strong>Item:</strong> ${group.items.length} produk</div>
        </div>
        ${first?.notes ? `<div class="info"><strong>Catatan:</strong> ${first.notes}</div>` : ""}
        <table>
          <thead><tr>
            <th style="text-align:center;width:40px;">No</th>
            <th>Produk</th>
            <th style="text-align:center;width:60px;">Satuan</th>
            <th style="text-align:center;width:80px;">Qty</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="footer">
          <div class="sign">Pengirim,<div>_______________</div></div>
          <div class="sign">Penerima,<div>_______________</div></div>
          <div class="sign">Mengetahui,<div>_______________</div></div>
        </div>
      </body></html>
    `;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "0";
    iframe.style.height = "0";
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
  };

  return (
    <div className={`rounded-xl border border-gray-200 border-l-4 ${cardBorderClass[status] || "border-l-gray-300"} bg-white shadow-sm overflow-hidden`}>
      {/* Header */}
      <div className={`px-4 py-2.5 border-b ${headerBgClass[status] || "bg-gray-50 border-b-gray-100"}`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Package className={`w-4 h-4 ${headerTextClass[status] || "text-gray-500"}`} />
            <span className={`text-sm font-semibold ${headerTextClass[status] || "text-gray-700"}`}>
              {group.isBatch ? "Batch Transfer" : "Transfer"}
            </span>
            <code className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              status === "SENDING" ? "bg-orange-100 text-orange-700"
              : status === "WAITING_VERIFICATION" ? "bg-amber-100 text-amber-700"
              : status === "DONE" ? "bg-emerald-100 text-emerald-700"
              : "bg-gray-100 text-gray-500"
            }`}>
              #{group.groupId.slice(-8).toUpperCase()}
            </code>
            <StatusBadge status={status} />
          </div>
          <div className="flex items-center gap-1.5">
            {allSending && isGudang && (
              <>
                <Button size="sm" onClick={handleBulkConfirm} disabled={confirming}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-7 px-3"
                >
                  {confirming ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <Truck className="w-3 h-3 mr-1" />}
                  Konfirmasi
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelBatch} disabled={cancelling}
                  className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-7 px-3"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Batal
                </Button>
              </>
            )}
            {(status !== "SENDING" && status !== "CANCELLED") && (isGudang || isSPVR) && (
              <Button size="sm" variant="outline" onClick={handlePrintDelivery}
                className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs h-7 px-3"
              >
                <Printer className="w-3.5 h-3.5 mr-1" />
                Cetak Surat Jalan
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
          <Calendar className="w-3 h-3" />
          <span>{formattedDate}</span>
          <span>•</span>
          <span>→ {outletName}</span>
          <span>•</span>
          <span>{group.items.length} produk</span>
          {first?.notes && (
            <><span>•</span><span>📝 {first.notes}</span></>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-b border-red-100 text-red-700 px-4 py-2 text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}

      {/* Product List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-8">#</th>
              <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Produk</th>
              <th className="px-4 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-16">Satuan</th>
              <th className="px-4 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-20">Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {group.items.map((t, i) => (
              <tr key={t.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-4 py-2.5 text-xs text-gray-400 font-mono">{i + 1}</td>
                <td className="px-4 py-2.5 font-medium text-gray-800">{t.product?.name || "-"}</td>
                <td className="px-4 py-2.5 text-center text-gray-500 text-xs">{unitLabel(t.unit)}</td>
                <td className="px-4 py-2.5 text-center font-semibold text-gray-700">{fmtQty(t)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TransferOrderList({ transfers, userRole, onSuccess, onPrint }: TransferOrderListProps) {
  const activeGroups = groupTransfers(transfers.filter((t) => t.status !== "CANCELLED" && t.status !== "DONE"));
  const doneGroups = groupTransfers(transfers.filter((t) => t.status === "DONE" || t.status === "CANCELLED"));

  if (transfers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Truck className="w-10 h-10 mb-3 opacity-30" />
        <p className="text-sm">Belum ada pengiriman</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeGroups.length > 0 && (
        <div className="space-y-2">
          {activeGroups.map((g) => (
            <BatchCard key={g.groupId} group={g} userRole={userRole} onSuccess={onSuccess} onPrint={onPrint} />
          ))}
        </div>
      )}
      {doneGroups.length > 0 && (
        userRole === "GDNG" ? (
          <div className="mt-4">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100/80 border border-gray-200/60 mb-3">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600 tracking-wide">
                Riwayat
              </span>
              <span className="text-xs font-semibold text-gray-500 bg-gray-200/70 px-1.5 py-0.5 rounded-full">
                {doneGroups.reduce((sum, g) => sum + g.items.length, 0)}
              </span>
              <div className="flex-1 h-px bg-gray-300/60" />
            </div>
            <div className="space-y-2 opacity-70">
              {doneGroups.map((g) => (
                <BatchCard key={g.groupId} group={g} userRole={userRole} onSuccess={onSuccess} onPrint={onPrint} />
              ))}
            </div>
          </div>
        ) : (
          <details className="group">
            <summary className="cursor-pointer px-3 py-2 rounded-lg bg-gray-100/80 border border-gray-200/60 hover:bg-gray-150 transition-colors list-none flex items-center gap-2">
              <ChevronDown className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" />
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600 tracking-wide">
                Riwayat
              </span>
              <span className="text-xs font-semibold text-gray-500 bg-gray-200/70 px-1.5 py-0.5 rounded-full">
                {doneGroups.reduce((sum, g) => sum + g.items.length, 0)}
              </span>
              <div className="flex-1" />
            </summary>
            <div className="mt-2 space-y-2 opacity-75">
              {doneGroups.map((g) => (
                <BatchCard key={g.groupId} group={g} userRole={userRole} onSuccess={onSuccess} onPrint={onPrint} />
              ))}
            </div>
          </details>
        )
      )}
    </div>
  );
}
