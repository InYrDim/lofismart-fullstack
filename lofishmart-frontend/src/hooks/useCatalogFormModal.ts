import { useState } from "react";

export type CatalogModalAction = "add-product" | "add-service" | "edit" | null;

interface UseCatalogFormModalOptions {
    /** Dipanggil setelah berhasil simpan (tambah/edit). */
    onSuccess?: () => void;
}

export function useCatalogFormModal({ onSuccess }: UseCatalogFormModalOptions = {}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [initialType, setInitialType] = useState<"PRODUCT" | "SERVICE" | null>(null);
    const [action, setAction] = useState<CatalogModalAction>(null);

    /** Buka modal untuk menambah produk baru. */
    const openForAddProduct = () => {
        setSelectedId(null);
        setInitialType("PRODUCT");
        setAction("add-product");
        setIsOpen(true);
    };

    /** Buka modal untuk menambah layanan baru. */
    const openForAddService = () => {
        setSelectedId(null);
        setInitialType("SERVICE");
        setAction("add-service");
        setIsOpen(true);
    };

    /** Buka modal untuk mengedit item (produk atau layanan). Deteksi tipe otomatis. */
    const openForEdit = (item: { id: string; type: "PRODUCT" | "SERVICE" }) => {
        setSelectedId(item.id);
        setInitialType(item.type === "SERVICE" ? "SERVICE" : "PRODUCT");
        setAction("edit");
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
        setAction(null);
    };

    const handleSuccess = () => {
        onSuccess?.();
        close();
    };

    /** Props siap pakai untuk di-spread ke komponen <CatalogFormModal /> */
    const modalProps = {
        isOpen,
        onClose: close,
        productId: selectedId,
        initialType,
        onSuccess: handleSuccess,
    };

    return {
        isOpen,
        selectedId,
        initialType,
        /** Tombol mana yang memicu modal terakhir kali: "add-product" | "add-service" | "edit" | null */
        action,
        openForAddProduct,
        openForAddService,
        openForEdit,
        close,
        modalProps,
    };
}
