/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { MasterCategory } from "@/services/product.service";

interface BasicInfoTabProps {
    form: any;
    isAutoBarcode: boolean;
    handleAutoBarcodeToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
    categories: MasterCategory[];
    existingBarcodes: string[];
    originalBarcode: string;
    barcodeApiError?: string;
    onBarcodeClearApiError?: () => void;
}

export const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
    form,
    isAutoBarcode,
    handleAutoBarcodeToggle,
    categories,
    existingBarcodes,
    originalBarcode,
    barcodeApiError = "",
    onBarcodeClearApiError,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <form.Field
                name="name"
                validators={{
                    onChange: ({ value }: any) => !value?.trim() ? "Nama produk tidak boleh kosong." : undefined,
                }}
                children={(field: any) => (
                    <div className="space-y-3 md:col-span-2">
                        <Label className="text-sm font-semibold text-gray-700">Nama Produk</Label>
                        <Input
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Contoh: Ikan Layang Spesial"
                            error={field.state.meta.errors ? field.state.meta.errors.map((e: any) => e?.message || e).join(', ') : undefined}
                            className="h-11 bg-gray-50 border-transparent hover:bg-white focus:bg-white transition-all text-sm font-medium"
                        />
                    </div>
                )}
            />

            <form.Field
                name="barcode"
                validators={{
                    onChange: ({ value }: any) => {
                        const bc = (value || "").toUpperCase();
                        // if (bc && !/^([A-D][0-9]|[0-9][A-D])$/.test(bc)) {
                        //     return "Format salah. Harus 1 huruf (A-D) dan 1 angka (0-9).";
                        // }
                        if (bc && !/^[0-9]{2}$/.test(bc)) {
                            return "Format salah. Harus 2 angka (0-9).";
                        }
                        if (bc && existingBarcodes.includes(bc) && bc !== originalBarcode) {
                            return "Barcode sudah digunakan.";
                        }
                        return undefined;
                    }
                }}
                children={(field: any) => (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold text-gray-700">Lacak (Barcode)</Label>
                            <label className="flex items-center gap-2 text-[11px] font-medium text-gray-500 cursor-pointer bg-gray-100 px-2.5 py-1 rounded-md hover:bg-gray-200 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={isAutoBarcode}
                                    onChange={handleAutoBarcodeToggle}
                                    className="w-3.5 h-3.5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                />
                                Otomatis
                            </label>
                        </div>
                        <Input
                            name={field.name}
                            type="text"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, "");
                                field.handleChange(val.toUpperCase().slice(0, 2));
                                if (barcodeApiError) onBarcodeClearApiError?.();
                            }}
                            placeholder="Ketik 2 Angka (mis. 01)"
                            disabled={isAutoBarcode}
                            error={barcodeApiError || (field.state.meta.errors ? field.state.meta.errors.map((e: any) => e?.message || e).join(', ') : undefined)}
                            className={`h-11 font-mono tracking-widest uppercase transition-all ${barcodeApiError
                                ? "border-red-500 bg-red-50 ring-1 ring-red-400"
                                : isAutoBarcode
                                    ? "bg-gray-100 text-gray-400 opacity-70"
                                    : "bg-gray-50 hover:bg-white focus:bg-white"
                                }`}
                        />
                    </div>
                )}
            />

            <form.Field
                name="categoryId"
                validators={{
                    onBlur: ({ value }: any) => !value ? "Kategori produk fisik harus dipilih." : undefined,
                }}
                children={(field: any) => (
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">Grup Kategori</Label>
                        <Select
                            label=""
                            value={field.state.value || undefined}
                            onChange={(val) => field.handleChange(String(val))}
                            error={field.state.meta.isTouched && field.state.meta.errors ? field.state.meta.errors.map((e: any) => e?.message || e).join(', ') : undefined}
                            placeholder="Pilih Kategori Induk"
                            options={categories.map((c: any) => ({ value: c.id, label: c.name }))}
                            className={`h-11 font-medium transition-all ${field.state.meta.isTouched && field.state.meta.errors?.length ? 'border-red-500 bg-red-50' : 'bg-gray-50 hover:bg-white'}`}
                        />
                    </div>
                )}
            />
            <form.Field
                name="unit"
                children={(field: any) => (
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">Unit Basis Perhitungan</Label>
                        <Select
                            label=""
                            value={field.state.value}
                            onChange={(val) => field.handleChange(val as "PCS" | "KG")}
                            options={[
                                { value: "PCS", label: "Per Lembar / Pcs (Satuan)" },
                                { value: "KG", label: "Per Kilogram (Volume)" }
                            ]}
                            className="h-11 bg-gray-50 hover:bg-white transition-all font-medium"
                        />
                    </div>
                )}
            />
        </div>
    );
};
