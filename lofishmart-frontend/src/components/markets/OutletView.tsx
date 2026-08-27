import { Package, Store, CheckCircle2, Trash2, Truck, Printer } from "lucide-react";
import { TransferOrderList } from "./TransferOrderList";
import { type StockItem, type StockTransfer } from "@/services/inventory.service";
import { formatQty } from "@/utils/format";

interface OutletViewProps {
  stockList: StockItem[];
  incomingTransfers: StockTransfer[]; // Status WAITING_VERIFICATION ke outlet ini
  marketName: string;
  userRole: string | undefined;
  transferOrders: StockTransfer[];
  activeTab: "stok" | "ops";
  onSuccess: () => void;
  onVerify: () => void;
  onReject: () => void;
  onPrint: (transfer: StockTransfer, type: "delivery" | "receipt") => void;
}

export function OutletView({
  stockList,
  incomingTransfers,
  marketName,
  userRole,
  transferOrders,
  activeTab,
  onSuccess,
  onVerify,
  onReject,
  onPrint,
}: OutletViewProps) {
  const totalQty = stockList.reduce((sum, s) => sum + s.qty, 0);
  const lowStock = stockList.filter((s) => s.qty < 5).length;

  return (
    <div className="space-y-6">
      {activeTab === "stok" ? (
        <>
          {/* Header Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-blue-100 text-sm">Outlet Anda</p>
                <h2 className="text-2xl font-bold">{marketName || "perlu ditambahkan"}</h2>
              </div>
              <Store className="w-12 h-12 opacity-30" />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-blue-100 text-xs text-center sm:text-left">Jenis Barang</p>
                <p className="text-xl font-bold text-center sm:text-left">{stockList.length}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-blue-100 text-xs text-center sm:text-left">Total Qty</p>
                <p className="text-xl font-bold text-center sm:text-left">{formatQty(totalQty)}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-blue-100 text-xs text-center sm:text-left">Stok Rendah</p>
                <p className={`text-xl font-bold text-center sm:text-left ${lowStock > 0 ? "text-yellow-300" : ""}`}>{lowStock}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onVerify}
              className="bg-white border-2 border-blue-100 hover:border-blue-400 hover:bg-blue-50 rounded-xl p-5 text-left transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-semibold text-gray-800">Verifikasi Stok</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">Catat barang yang sudah sampai & periksa kesesuaian</p>
            </button>

            <button
              onClick={onReject}
              className="bg-white border-2 border-red-100 hover:border-red-400 hover:bg-red-50 rounded-xl p-5 text-left transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <span className="font-semibold text-gray-800">Laporkan Rusak</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">Ajukan laporan barang rusak untuk persetujuan admin</p>
            </button>
          </div>

          {/* Stock Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <Package className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold text-gray-800">Stok Saat Ini</h2>
            </div>
            {stockList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Package className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Belum ada stok di outlet ini</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Produk</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stockList.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{s.product?.name}</p>
                          {s.batch && <p className="text-xs text-gray-400">Batch: {s.batch}</p>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-semibold text-gray-900">
                            {formatQty(s.qty)}
                          </span>
                          <span className="text-gray-400 text-sm ml-1">{s.unit === "1" ? "kg" : "ekor"}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${s.qty < 3
                                ? "bg-red-100 text-red-700"
                                : s.qty < 10
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                          >
                            {s.qty < 3 ? "Kritis" : s.qty < 10 ? "Rendah" : "Normal"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Incoming Transfers (from DB) */}
          {incomingTransfers.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-amber-100/70 px-6 py-3 border-b border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-700" />
                  <h2 className="font-bold text-amber-900">Kiriman Masuk — Perlu Verifikasi</h2>
                  <span className="bg-amber-400 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                    {incomingTransfers.length} kiriman
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {incomingTransfers.map((transfer) => {
                  const unit = transfer.unit === "1" ? "kg" : "ekor";
                  const qty = formatQty(transfer.qty);
                  return (
                    <div
                      key={transfer.id}
                      className="bg-white p-4 rounded-xl border border-amber-100 flex items-center justify-between group hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center font-black text-amber-500 text-lg group-hover:scale-110 transition-transform text-center">
                          {transfer.product?.name?.charAt(0) ?? "?"}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{transfer.product?.name}</h3>
                          <p className="text-xs text-gray-500">
                            Dari: {transfer.source_stock?.werehouse?.name ?? "Gudang"}
                            {transfer.sent_at && ` · Dikirim ${new Date(transfer.sent_at).toLocaleDateString("id-ID")}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="text-right">
                          <p className="text-base sm:text-lg font-black text-amber-700">
                            {qty} <span className="text-[10px] uppercase">{unit}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => onPrint(transfer, "delivery")}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat Surat Jalan"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transfer Orders — Pengiriman Berjalan */}
          {transferOrders.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-orange-50">
                <Truck className="w-5 h-5 text-orange-600" />
                <h2 className="font-semibold text-orange-800">Pengiriman Stok ke Outlet</h2>
                <span className="ml-auto text-sm text-orange-600 font-medium">
                  {transferOrders.filter(t => t.status !== 'DONE' && t.status !== 'CANCELLED').length} aktif
                </span>
              </div>
              <div className="p-4">
                <TransferOrderList
                  transfers={transferOrders}
                  userRole={userRole}
                  onSuccess={onSuccess}
                  onPrint={onPrint}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
