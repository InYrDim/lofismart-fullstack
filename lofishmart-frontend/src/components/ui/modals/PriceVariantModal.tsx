import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { MasterSize, MasterGrade } from "@/services/product.service";

export interface PriceVariantData {
    id?: string; // local id for edit tracking
    sizeId: string;
    gradeId: string;
    basePrice: number;
    barcode?: string;
}

interface PriceVariantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (variant: PriceVariantData) => void;
    sizes: MasterSize[];
    grades: MasterGrade[];
    initialData?: PriceVariantData | null;
    existingVariants: PriceVariantData[];
}

export const PriceVariantModal: React.FC<PriceVariantModalProps> = ({
    isOpen,
    onClose,
    onSave,
    sizes,
    grades,
    initialData,
    existingVariants
}) => {
    const [formData, setFormData] = useState<PriceVariantData>({
        sizeId: "",
        gradeId: "",
        basePrice: 0,
        barcode: ""
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    sizeId: "",
                    gradeId: "",
                    basePrice: 0,
                    barcode: "",
                    id: Date.now().toString()
                });
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Cek duplikasi: Apakah ada varian lain (selain yang sedang diedit) dengan Size & Grade yang sama?
        // Meskipun di UI sudah dihilangkan, kita tetap simpan pengecekan ini sebagai fallback layer keamanan.
        const isDuplicate = existingVariants.some(v =>
            v.sizeId === formData.sizeId &&
            v.gradeId === formData.gradeId &&
            v.id !== formData.id // Jika edit, abaikan variant dirinya sendiri
        );

        if (isDuplicate) {
            const sizeName = sizes.find(s => s.id === formData.sizeId)?.name || "Ukuran";
            const gradeName = grades.find(g => g.id === formData.gradeId)?.name || "Grade";
            toast.error(`Varian "${sizeName} - ${gradeName}" sudah ada dalam daftar. Anda tidak bisa menambahkan varian ganda.`);
            return;
        }

        onSave(formData);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md p-0 overflow-hidden bg-white/95 backdrop-blur-md rounded-xl">
                <DialogHeader className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                    <DialogTitle className="text-lg font-bold text-gray-900">
                        {initialData ? "Edit Varian Harga" : "Tambah Varian Harga"}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Tentukan kombinasi Ukuran dan Grade, serta atur harga retil
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-5 space-y-5">
                    <div className="space-y-3">
                        <Select
                            label="Ukuran (Size)"
                            value={formData.sizeId || undefined}
                            onChange={(val) => setFormData(prev => ({ ...prev, sizeId: String(val) }))}
                            placeholder="Pilih Ukuran"
                            options={sizes.map(s => ({ value: s.id, label: s.name }))}
                            className="h-11 border-gray-200 hover:bg-white bg-gray-50"
                        />
                    </div>

                    <div className="space-y-3">
                        <Select
                            label="Grade (Kualitas)"
                            value={formData.gradeId || undefined}
                            onChange={(val) => setFormData(prev => ({ ...prev, gradeId: String(val) }))}
                            disabled={!formData.sizeId}
                            placeholder={formData.sizeId ? "Pilih Grade" : "Pilih Ukuran Terlebih Dahulu"}
                            options={grades.map(g => ({ value: g.id, label: g.name }))}
                            className={`h-11 border-gray-200 ${!formData.sizeId ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-white bg-gray-50'}`}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700">Harga Dasar</label>
                        <Input
                            name="basePrice"
                            type="number"
                            value={formData.basePrice || ""}
                            onChange={handleChange}
                            min={0}
                            required
                            placeholder="Contoh: 15000"
                            className="h-11 bg-gray-50 hover:bg-white transition-all font-medium"
                        />
                    </div>

                    <DialogFooter className="pt-4 flex justify-end gap-3 w-full border-t border-gray-100 mt-2">
                        <Button type="button" variant="outline" className="h-10 px-5 shadow-xs bg-white" onClick={onClose}>
                            Batal
                        </Button>
                        <Button type="submit" className="h-10 px-5 shadow-md shadow-brand-primary/20">
                            Simpan Varian
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
