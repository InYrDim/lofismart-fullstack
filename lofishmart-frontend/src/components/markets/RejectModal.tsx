import React, { useState } from "react";
import { Clock, AlertCircle, Plus, RefreshCw, XCircle } from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/modals/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { InventoryService } from "@/services/inventory.service";

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: { id: string; productId?: string; name: string; type: string, unit?: string }[];
  onSuccess: () => void;
  marketId: string;
}

export function RejectModal({
  isOpen,
  onClose,
  products,
  onSuccess,
  marketId,
}: RejectModalProps) {
  const [form, setForm] = useState({ product_id: "", qty: "", desc: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("1");

  const reset = () => {
    setForm({ product_id: "", qty: "", desc: "" });
    setImageFile(null);
    setError(null);
    setSuccess(false);
    setSelectedUnit("1");
  };

  const handleProductChange = (val: string) => {
    const product = products.find(p => (p.productId || p.id) === val);
    setForm({ ...form, product_id: val });
    if (product?.unit) {
      setSelectedUnit(product.unit);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const data = new FormData();
      data.append("product_id", form.product_id);
      data.append("qty", form.qty);
      data.append("desc", form.desc);
      data.append("market_id", marketId);
      if (imageFile) data.append("image_proof", imageFile);
      await InventoryService.requestReject(data);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal mengajukan laporan";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Laporkan Barang Rusak"
      size="lg"
    >
      {success ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Laporan Terkirim!</h3>
          <p className="text-gray-500 mt-1">Menunggu persetujuan dari admin.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produk <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.product_id}
                onChange={(v) => handleProductChange(String(v))}
                options={[
                  { label: "Pilih Produk", value: "" },
                  ...products
                    .filter((p) => p.type === "PRODUCT")
                    .map((p) => ({
                      label: p.name,
                      value: p.productId || p.id,
                    })),
                ]}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {selectedUnit === "2" ? "Jumlah Rusak (ekor)" : "Berat Rusak (kg)"} <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step={selectedUnit === "2" ? "1" : "0.01"}
                value={form.qty}
                onChange={(e) => setForm({ ...form, qty: e.target.value })}
                placeholder="0"
                required
              />
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan / Alasan <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              placeholder="Contoh: Ikan busuk, kemasan rusak, kadaluarsa"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto Bukti <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-gray-300 transition-colors">
              {imageFile ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{imageFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setImageFile(null)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Hapus
                  </Button>
                </div>
              ) : (
                <>
                  <Plus className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                  <p className="text-sm text-gray-400">Klik untuk upload foto</p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                required={!imageFile}
              />
            </div>
          </div>

          <ModalFooter>
            <Button variant="outline" type="button" onClick={handleClose}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              {submitting ? "Mengirim..." : "Kirim Laporan"}
            </Button>
          </ModalFooter>
        </form>
      )}
    </Modal>
  );
}
