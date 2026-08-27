import { XCircle, Package, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InventoryService, type StockItem } from "@/services/inventory.service";
import { useRoleAndPermission } from "@/hooks/useRoleAndPermission";
import { formatQty } from "@/utils/format";

interface OutletDetailOverlayProps {
  outletId: string;
  isOpen: boolean;
  onClose: () => void;
  stocks: StockItem[];
  markets: { id: string; name: string; address?: string }[];
  onSuccess?: () => void;
}

export function OutletDetailOverlay({
  outletId,
  isOpen,
  onClose,
  stocks,
  markets,
  onSuccess,
}: OutletDetailOverlayProps) {
  const { isAdmin, isManager } = useRoleAndPermission();
  const canDelete = isAdmin || isManager;
  const market = markets.find(m => m.id === outletId);

  const handleDelete = async (stockId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data stok ini secara permanen?")) {
      return;
    }

    try {
      await InventoryService.deleteStock(stockId);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to delete stock:", err);
      toast.error("Gagal menghapus stok. Silakan coba lagi.");
    }
  };
  const totalQty = stocks.reduce((sum, s) => sum + s.qty, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex justify-end" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-gray-50 h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
        onClick={e => e.stopPropagation()}
      >
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon-sm" onClick={onClose} className="rounded-full">
              <XCircle className="w-5 h-5 text-gray-400" />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{market?.name || "Detail Outlet"}</h2>
              <p className="text-sm text-gray-500">{stocks.length} jenis produk tersimpan</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Stok</p>
            <p className="text-xl font-black text-blue-600">
              {formatQty(totalQty)} {stocks[0]?.unit === "1" ? "KG" : "Ekor"}
            </p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Status Operasional</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="font-bold text-emerald-600">Aktif</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Lokasi</p>
              <p className="font-bold text-gray-800 truncate">{market?.address || "Alamat belum diatur"}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-500" />
                Daftar Stok Produk
              </h3>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Produk</th>
                  <th className="px-6 py-3 text-center">Batch</th>
                  <th className="px-6 py-3 text-right">Stok Aktif</th>
                  {canDelete && <th className="px-6 py-3 w-10"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stocks.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-gray-400 italic">
                      Tidak ada stok tersedia
                    </td>
                  </tr>
                ) : (
                  stocks.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{s.product?.name}</p>
                        <p className="text-xs text-gray-400">ID: {s.id.slice(0, 8)}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded font-medium text-gray-600">
                          {s.batch || "NO BATCH"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-black text-gray-900 text-base">
                          {formatQty(s.qty)}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          {s.unit === "1" ? "Kilogram" : "Ekor"}
                        </p>
                      </td>
                      {canDelete && (
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(s.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200 p-6">
          <Button variant="outline" className="w-full py-6 rounded-xl font-bold" onClick={onClose}>
            Tutup Panel
          </Button>
        </footer>
      </div>
    </div>
  );
}
