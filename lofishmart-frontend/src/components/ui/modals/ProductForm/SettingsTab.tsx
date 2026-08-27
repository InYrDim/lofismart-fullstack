import React from "react";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Eye, Lock, Package, Zap } from "lucide-react";

interface SettingsTabProps {
    form: any;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
    form
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <form.Field
                name="isShow"
                children={(field) => (
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">Visibilitas Sistem Point of Sale</Label>
                        <Select
                            label=""
                            value={field.state.value ? "true" : "false"}
                            onChange={(val) => field.handleChange(val === "true")}
                            options={[
                                { value: "true", label: <span className="flex items-center gap-2"><Eye className="w-4 h-4 text-blue-500" /> Ditampilkan di Katalog Kasir</span> },
                                { value: "false", label: <span className="flex items-center gap-2"><Lock className="w-4 h-4 text-gray-400" /> Disembunyikan (Arsip/Internal)</span> }
                            ]}
                            className="h-11 bg-gray-50 hover:bg-white transition-all font-medium"
                        />
                    </div>
                )}
            />

            <form.Field
                name="isNonStock"
                children={(field) => (
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">Flag Persediaan Perputaran Cepat</Label>
                        <Select
                            label=""
                            value={field.state.value ? "true" : "false"}
                            onChange={(val) => field.handleChange(val === "true")}
                            options={[
                                { value: "false", label: <span className="flex items-center gap-2"><Package className="w-4 h-4 text-green-500" /> Normal Stock (Dilacak Gudang)</span> },
                                { value: "true", label: <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Fast Moving / Pre-Order (Abaikan Stok)</span> }
                            ]}
                            className="h-11 bg-gray-50 hover:bg-white transition-all font-medium"
                        />
                    </div>
                )}
            />

        </div>
    );
};
