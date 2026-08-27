import React from "react";
import { Plus, Trash2, Edit, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "@tanstack/react-router";
import type { MasterSize, MasterGrade } from "@/services/product.service";
import type { PriceVariantData } from "@/components/ui/modals/PriceVariantModal";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface VariantsTabProps<TForm = any> {
    form: TForm & {
        Subscribe: React.ComponentType<{
            selector: (state: { values: { variants: PriceVariantData[]; barcode: string } }) => unknown[];
            children: (values: unknown[]) => React.ReactNode;
        }>;
    };
    sizes: MasterSize[];
    grades: MasterGrade[];
    getVariantBarcode: (parentBarcode: string, sizeBarcode: string, gradeBarcode: string) => string;
    setEditingVariant: (variant: PriceVariantData | null) => void;
    setIsVariantModalOpen: (isOpen: boolean) => void;
    handleDeleteVariant: (id: string) => void;
}

export const VariantsTab = <TForm = unknown>({
    form,
    sizes,
    grades,
    getVariantBarcode,
    setEditingVariant,
    setIsVariantModalOpen,
    handleDeleteVariant
}: VariantsTabProps<TForm>): React.ReactElement => {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Hierarki Harga Varian</h3>
                    <p className="text-xs text-gray-500 mt-1">Gunakan kombinasi Size dan Grade terdaftar untuk memecah harga.</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 shadow-xs border-dashed border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                    onClick={() => {
                        setEditingVariant(null);
                        setIsVariantModalOpen(true);
                    }}
                >
                    <Plus className="w-3.5 h-3.5" /> Tambah Matriks Varian
                </Button>
            </div>

            {(grades.length === 0 || sizes.length === 0) && (
                <Alert className="bg-red-50/50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800 font-bold">Atribut Master Belum Dikonfigurasi</AlertTitle>
                    <AlertDescription className="text-red-700/80 mt-1 leading-relaxed">
                        <div>Anda tidak dapat menambahkan varian karena data
                            <span className="font-bold underline mx-1">{grades.length === 0 ? "Grade" : ""}</span>
                            {grades.length === 0 && sizes.length === 0 ? "dan" : ""}
                            <span className="font-bold underline mx-1">{sizes.length === 0 ? "Size" : ""}</span>
                            masih kosong di database.
                            <Link
                                to="/product-attributes"
                                className="inline-flex items-center gap-1 ml-2 font-bold text-red-600 hover:text-red-800 underline underline-offset-4"
                            >
                                Konfigurasi Sekarang <ExternalLink className="w-3 h-3" />
                            </Link></div>
                    </AlertDescription>
                </Alert>
            )}

            <form.Subscribe
                selector={(state) => [state.values.variants, state.values.barcode]}
                children={([variants, formBarcode]) => variants.length === 0 ? (
                    <div className="py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center px-4">
                        <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center mb-3 text-gray-300">
                            <Plus className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-semibold text-gray-600">Formasi Kosong</p>
                        <p className="text-xs text-gray-400 mt-1 max-w-[250px]">Produk fisik memerlukan setidaknya konfigurasi satu buah kombinasi Varian Size & Grade layan Kasir.</p>
                    </div>
                ) : (
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Dimensi (Size)</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Kualitas (Grade)</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Sub-Barcode Lacak</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Harga Retil</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-center w-20">Utilitas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {variants.map((v: PriceVariantData) => {
                                    const sizeObj = sizes.find(s => s.id === v.sizeId);
                                    const gradeObj = grades.find(g => g.id === v.gradeId);
                                    const sizeName = sizeObj?.name || v.sizeId;
                                    const gradeName = gradeObj?.name || v.gradeId;
                                    const autoBarcode = getVariantBarcode(
                                        String(formBarcode) || "",
                                        sizeObj?.barcode || "",
                                        gradeObj?.barcode || ""
                                    );

                                    return (
                                        <tr key={v.id || v.barcode || Math.random().toString()} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3.5 font-medium text-gray-800">{sizeName}</td>
                                            <td className="px-4 py-3.5 font-medium text-gray-800">{gradeName}</td>
                                            <td className="px-4 py-3.5">
                                                <span className="font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded text-[10px] tracking-wider">{autoBarcode || "N/A"}</span>
                                            </td>
                                            <td className="px-4 py-3.5 font-bold text-gray-900 text-right">Rp {v.basePrice.toLocaleString("id-ID")}</td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingVariant(v);
                                                            setIsVariantModalOpen(true);
                                                        }}
                                                        className="p-1.5 bg-white border border-gray-200 shadow-xs text-gray-500 hover:text-brand-primary hover:border-brand-primary rounded-md transition-colors"
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteVariant(v.id!)}
                                                        className="p-1.5 bg-white border border-gray-200 shadow-xs text-gray-500 hover:text-red-500 hover:border-red-500 rounded-md transition-colors"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            />
        </div>
    );
};
