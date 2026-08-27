import { Package, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Modal, ModalFooter } from "@/components/ui/modals/Modal";
import { Button } from "@/components/ui/button";
import { InventoryService, type StockItem } from "@/services/inventory.service";
import { useRoleAndPermission } from "@/hooks/useRoleAndPermission";
import { formatQty } from "@/utils/format";

interface StockDetailModalProps {
  productName: string;
  isOpen: boolean;
  onClose: () => void;
  stocks: StockItem[];
  onSuccess?: () => void;
}

export function StockDetailModal({
  productName,
  isOpen,
  onClose,
  stocks,
  onSuccess,
}: StockDetailModalProps) {
  const { isAdmin, isManager } = useRoleAndPermission();
  const canDelete = isAdmin || isManager;

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
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detail Stok: ${productName}`} size="lg">
      <div className="space-y-4">
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-emerald-600 font-medium">Total Stok di Gudang</p>
            <p className="text-2xl font-bold text-emerald-900">
              {formatQty(stocks.reduce((sum, s) => sum + s.qty, 0))} {stocks[0]?.unit === "1" ? "kg" : "ekor"}
            </p>
          </div>
          <Package className="w-10 h-10 text-emerald-200" />
        </div>

        <div className="overflow-hidden border border-gray-100 rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-4 py-2">Batch / Barcode</th>
                <th className="px-4 py-2">Tgl Masuk</th>
                <th className="px-4 py-2 text-right">Qty</th>
                {canDelete && <th className="px-4 py-2 w-10"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stocks.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{s.batch || "-"}</p>
                    <p className="text-xs text-gray-400">{s.barcode || s.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(s.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">
                    {formatQty(s.qty)}
                  </td>
                  {canDelete && (
                    <td className="px-4 py-3 text-right">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Tutup
        </Button>
      </ModalFooter>
    </Modal>
  );
}
