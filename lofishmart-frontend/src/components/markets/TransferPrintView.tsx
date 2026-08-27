import { useEffect } from "react";
import type { StockTransfer } from "@/services/inventory.service";
import { formatQty } from "@/utils/format";

interface TransferPrintViewProps {
  type: "delivery" | "receipt"; // Surat Jalan | Bukti Terima
  transfer: StockTransfer;
  onClose: () => void;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function printQty(qty: number | null | undefined, unit: string) {
  if (qty == null) return "-";
  return `${formatQty(qty)} ${unit === "1" ? "kg" : "ekor"}`;
}

export function TransferPrintView({ type, transfer, onClose }: TransferPrintViewProps) {
  useEffect(() => {
    // Beri waktu render sebelum print
    const timer = setTimeout(() => window.print(), 300);
    return () => clearTimeout(timer);
  }, []);

  const unit = transfer.unit;
  const productName = transfer.product?.name || "-";
  const outletName = transfer.target_market?.name || "-";
  const gudangName = transfer.source_stock?.werehouse?.name || "Gudang Utama";
  const senderName = transfer.created_by?.name || "-";
  const receiverName = transfer.verified_by?.name || "-";
  const transferId = transfer.id.toUpperCase();

  const selisih = transfer.verified_qty != null
    ? transfer.qty - transfer.verified_qty
    : null;

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          body > *:not(#print-root) { display: none !important; }
          #print-root { display: block !important; }
          @page { margin: 20mm; size: A4; }
        }
        @media screen {
          #print-root {
            position: fixed; inset: 0; z-index: 9999;
            background: rgba(0,0,0,0.6);
            display: flex; align-items: flex-start; justify-content: center;
            overflow-y: auto; padding: 24px;
          }
        }
      `}</style>

      <div id="print-root">
        {/* Screen: card wrapper with close */}
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl print:shadow-none print:rounded-none">
          {/* Screen-only close bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 print:hidden">
            <p className="text-sm font-semibold text-gray-600">
              Preview — {type === "delivery" ? "Surat Jalan Pengiriman" : "Bukti Penerimaan Barang"}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🖨️ Cetak
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Tutup
              </button>
            </div>
          </div>

          {/* Document Body */}
          <div className="p-8 font-['Arial',sans-serif] text-gray-900 text-sm">
            {/* Header */}
            <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-gray-800">
              <div>
                <h1 className="text-xl font-black uppercase tracking-wide text-gray-900">
                  {type === "delivery" ? "Surat Jalan Pengiriman" : "Bukti Penerimaan Barang"}
                </h1>
                <p className="text-gray-500 text-xs mt-0.5">Lofishmart — Sistem Manajemen Inventori</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">No. Transfer Order</p>
                <p className="font-mono font-bold text-lg tracking-widest">{transferId}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {type === "delivery"
                    ? `Tgl Buat: ${formatDate(transfer.created_at)}`
                    : `Tgl Terima: ${formatDate(transfer.verified_at)}`}
                </p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Dari (Gudang)</p>
                <p className="font-semibold text-gray-900">{gudangName}</p>
                <p className="text-xs text-gray-500 mt-0.5">Pengirim: {senderName}</p>
                {transfer.sent_at && (
                  <p className="text-xs text-gray-500">Tgl Kirim: {formatDate(transfer.sent_at)}</p>
                )}
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Ke (Outlet)</p>
                <p className="font-semibold text-gray-900">{outletName}</p>
                {transfer.target_market?.address && (
                  <p className="text-xs text-gray-500 mt-0.5">{transfer.target_market.address}</p>
                )}
                {type === "receipt" && (
                  <p className="text-xs text-gray-500">Penerima: {receiverName}</p>
                )}
              </div>
            </div>

            {/* Product Table */}
            <table className="w-full border-collapse mb-6">
              <thead>
                <tr className="bg-gray-800 text-white text-xs">
                  <th className="px-3 py-2 text-left">No</th>
                  <th className="px-3 py-2 text-left">Nama Produk</th>
                  <th className="px-3 py-2 text-right">Qty Dikirim</th>
                  {type === "receipt" && (
                    <>
                      <th className="px-3 py-2 text-right">Qty Diterima</th>
                      <th className="px-3 py-2 text-right">Selisih</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-3 text-gray-500">1</td>
                  <td className="px-3 py-3 font-semibold">{productName}</td>
                  <td className="px-3 py-3 text-right font-mono">{printQty(transfer.qty, unit)}</td>
                  {type === "receipt" && (
                    <>
                      <td className="px-3 py-3 text-right font-mono font-semibold text-emerald-700">
                        {printQty(transfer.verified_qty, unit)}
                      </td>
                      <td className={`px-3 py-3 text-right font-mono font-semibold ${selisih && selisih > 0 ? "text-red-600" : "text-gray-500"}`}>
                        {selisih != null ? (selisih > 0 ? `-${printQty(selisih, unit)}` : "—") : "-"}
                      </td>
                    </>
                  )}
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={type === "delivery" ? 2 : 3} className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">Total</td>
                  <td className="px-3 py-2 text-right font-bold">{printQty(transfer.qty, unit)}</td>
                  {type === "receipt" && (
                    <>
                      <td className="px-3 py-2 text-right font-bold text-emerald-700">{printQty(transfer.verified_qty, unit)}</td>
                      <td className="px-3 py-2 text-right font-bold text-red-600">
                        {selisih != null && selisih > 0 ? `-${printQty(selisih, unit)}` : "—"}
                      </td>
                    </>
                  )}
                </tr>
              </tfoot>
            </table>

            {/* Status Badge (Receipt only) */}
            {type === "receipt" && (
              <div className={`text-center py-2 mb-6 rounded-lg border-2 font-bold text-sm ${selisih && selisih > 0 ? "border-red-300 bg-red-50 text-red-700" : "border-emerald-300 bg-emerald-50 text-emerald-700"}`}>
                {selisih && selisih > 0 ? "⚠️ ADA SELISIH" : "✅ DITERIMA PENUH"}
              </div>
            )}

            {/* Notes */}
            {transfer.notes && (
              <div className="mb-4 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs">
                <span className="font-semibold">Catatan Pengirim: </span>{transfer.notes}
              </div>
            )}
            {type === "receipt" && transfer.verified_notes && (
              <div className="mb-4 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded text-xs">
                <span className="font-semibold">Catatan Penerimaan: </span>{transfer.verified_notes}
              </div>
            )}

            {/* Signature Section */}
            <div className="grid grid-cols-2 gap-10 mt-8 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-14">Pengirim</p>
                <div className="border-b border-gray-800 mb-1 mx-4" />
                <p className="text-xs text-gray-700 font-medium">{senderName}</p>
                <p className="text-[10px] text-gray-400">{gudangName}</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-14">
                  {type === "delivery" ? "Penerima" : "Supervisor Penerima"}
                </p>
                <div className="border-b border-gray-800 mb-1 mx-4" />
                <p className="text-xs text-gray-700 font-medium">
                  {type === "receipt" && receiverName !== "-" ? receiverName : "................................."}
                </p>
                <p className="text-[10px] text-gray-400">{outletName}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-3 border-t border-gray-100 flex justify-between items-center">
              <p className="text-[10px] text-gray-300">Dicetak: {formatDate(new Date().toISOString())}</p>
              <p className="text-[10px] text-gray-300 font-mono">LOFISHMART · {transferId}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
