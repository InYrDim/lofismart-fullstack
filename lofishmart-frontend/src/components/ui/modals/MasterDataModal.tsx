import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

interface MasterItem {
    id: string;
    name: string;
    barcode: string;
}

interface MasterDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    icon: LucideIcon;
    iconColor: string;
    items: MasterItem[];
    isLoading: boolean;
    onCreate: (name: string, barcode: string) => Promise<void>;
    onUpdate: (id: string, name: string, barcode: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export const MasterDataModal: React.FC<MasterDataModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    icon: Icon,
    iconColor,
    items,
    isLoading,
    onCreate,
    onUpdate,
    onDelete,
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [newBarcode, setNewBarcode] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [editingBarcode, setEditingBarcode] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // ── Duplicate barcode validation ─────────────────────────────────────
    const isDuplicateBarcode = (barcode: string, excludeId?: string): boolean => {
        const trimmed = barcode.trim().toUpperCase();
        if (!trimmed) return false;
        return items.some(item =>
            item.barcode.toUpperCase() === trimmed && item.id !== excludeId
        );
    };

    const newBarcodeError = newBarcode.trim() && isDuplicateBarcode(newBarcode)
        ? `Kode "${newBarcode.trim()}" sudah digunakan.`
        : "";

    const editBarcodeError = editingBarcode.trim() && isDuplicateBarcode(editingBarcode, editingId ?? undefined)
        ? `Kode "${editingBarcode.trim()}" sudah digunakan.`
        : "";

    const handleCreate = async () => {
        const trimmedName = newName.trim();
        const trimmedBarcode = newBarcode.trim();
        if (!trimmedName || !trimmedBarcode || newBarcodeError) return;
        setIsSaving(true);
        try {
            await onCreate(trimmedName, trimmedBarcode);
            setNewName("");
            setNewBarcode("");
            setIsAdding(false);
            toast.success("Berhasil", { description: `${title} "${trimmedName}" berhasil ditambahkan.` });
        } catch (error) {
            toast.error("Gagal", { description: `Gagal menambahkan ${title.toLowerCase()}.` });
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        const trimmedName = editingName.trim();
        const trimmedBarcode = editingBarcode.trim();
        if (!trimmedName || !trimmedBarcode || editBarcodeError) return;
        setIsSaving(true);
        try {
            await onUpdate(editingId, trimmedName, trimmedBarcode);
            setEditingId(null);
            setEditingName("");
            setEditingBarcode("");
            toast.success("Berhasil", { description: `${title} berhasil diperbarui.` });
        } catch (error) {
            toast.error("Gagal", { description: `Gagal memperbarui ${title.toLowerCase()}.` });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        setIsSaving(true);
        try {
            await onDelete(deletingId);
            setDeletingId(null);
            toast.success("Berhasil", { description: `${title} berhasil dihapus.` });
        } catch (error) {
            toast.error("Gagal", { description: `Gagal menghapus ${title.toLowerCase()}. Mungkin masih digunakan oleh produk.` });
        } finally {
            setIsSaving(false);
        }
    };

    const startEdit = (item: MasterItem) => {
        setEditingId(item.id);
        setEditingName(item.name);
        setEditingBarcode(item.barcode);
        setIsAdding(false);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingName("");
        setEditingBarcode("");
    };

    const cancelAdd = () => {
        setIsAdding(false);
        setNewName("");
        setNewBarcode("");
    };

    const handleKeyDown = (e: React.KeyboardEvent, action: "create" | "update") => {
        if (e.key === "Enter") action === "create" ? handleCreate() : handleUpdate();
        if (e.key === "Escape") action === "create" ? cancelAdd() : cancelEdit();
    };

    const deletingItem = items.find(i => i.id === deletingId);

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                    <DialogHeader className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 shrink-0">
                        <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            Kelola {title}
                        </DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto">
                        {/* Add button / Add input row */}
                        <div className="px-6 py-3 border-b border-gray-100 bg-white">
                            {isAdding ? (
                                <div className="flex gap-2">
                                    <Input
                                        autoFocus
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, "create")}
                                        placeholder={`Nama ${title.toLowerCase()}...`}
                                        className="h-9 text-sm flex-1"
                                        disabled={isSaving}
                                    />
                                    <div className="flex flex-col">
                                        <Input
                                            value={newBarcode}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, "");
                                                setNewBarcode(val.slice(0, 2));
                                            }}
                                            onKeyDown={(e) => handleKeyDown(e, "create")}
                                            placeholder="Kode"
                                            className={`h-9 text-sm w-16 text-center font-mono ${newBarcodeError ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                                            maxLength={2}
                                            disabled={isSaving}
                                        />
                                        {newBarcodeError && (
                                            <span className="text-xs text-red-500 mt-0.5 whitespace-nowrap">{newBarcodeError}</span>
                                        )}
                                    </div>
                                    <Button size="sm" onClick={handleCreate} disabled={isSaving || !newName.trim() || !newBarcode.trim() || !!newBarcodeError} className="h-9 px-3 gap-1">
                                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                        Simpan
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={cancelAdd} disabled={isSaving} className="h-9 px-2">
                                        <X className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            ) : (
                                <Button size="sm" onClick={() => { setIsAdding(true); cancelEdit(); }} className="gap-1.5 h-9">
                                    <Plus className="w-3.5 h-3.5" />
                                    Tambah {title}
                                </Button>
                            )}
                        </div>

                        {/* Table */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-16 text-gray-400 text-sm">
                                Belum ada data {title.toLowerCase()}.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50">
                                        <TableHead className="w-12 text-center">No.</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead className="w-20 text-center">Kode</TableHead>
                                        <TableHead className="w-24 text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item, idx) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-center text-gray-400 text-sm font-medium">
                                                {idx + 1}
                                            </TableCell>
                                            <TableCell>
                                                {editingId === item.id ? (
                                                    <Input
                                                        autoFocus
                                                        value={editingName}
                                                        onChange={(e) => setEditingName(e.target.value)}
                                                        onKeyDown={(e) => handleKeyDown(e, "update")}
                                                        className="h-8 text-sm"
                                                        disabled={isSaving}
                                                    />
                                                ) : (
                                                    <span className="font-medium text-gray-900">{item.name}</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {editingId === item.id ? (
                                                    <div className="flex flex-col items-center">
                                                        <Input
                                                            value={editingBarcode}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/[^0-9]/g, "");
                                                                setEditingBarcode(val.slice(0, 2));
                                                            }}
                                                            onKeyDown={(e) => handleKeyDown(e, "update")}
                                                            className={`h-8 text-sm w-14 text-center font-mono ${editBarcodeError ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                                                            maxLength={2}
                                                            disabled={isSaving}
                                                        />
                                                        {editBarcodeError && (
                                                            <span className="text-xs text-red-500 mt-0.5 whitespace-nowrap">{editBarcodeError}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{item.barcode}</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {editingId === item.id ? (
                                                    <div className="flex justify-end gap-1">
                                                        <Button size="sm" onClick={handleUpdate} disabled={isSaving || !editingName.trim() || !editingBarcode.trim() || !!editBarcodeError} className="h-7 w-7 p-0">
                                                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={cancelEdit} disabled={isSaving} className="h-7 w-7 p-0">
                                                            <X className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => startEdit(item)}
                                                            className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => setDeletingId(item.id)}
                                                            className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-base">Hapus {title}?</DialogTitle>
                        <DialogDescription>
                            Anda yakin ingin menghapus <strong>"{deletingItem?.name}"</strong>? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => setDeletingId(null)} disabled={isSaving}>
                            Batal
                        </Button>
                        <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleDelete}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                            Hapus
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
